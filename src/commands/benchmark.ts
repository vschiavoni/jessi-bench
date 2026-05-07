import {Engine} from "./engine.js"
import {Workload} from "./workload.js"
import {docker} from "../services/docker.js"
import {logger, LogLevel} from "../utils/logger.js"
import {dirname, resolve} from "path"
import {mkdir, readFile, unlink, writeFile} from "fs/promises"
import {Writable} from "stream"
import {toPascalCase} from "../utils/helpers.js"
import {summarize, NumericSummary} from "../utils/statistics.js"
import os from "os"
import {execFile as execFileCb} from "child_process"
import {promisify} from "util"

const execFile = promisify(execFileCb)

export type EventId = string
export type MeasurementMode = "combined" | "split"

export interface BenchmarkOptions {
    repetitions: number
    warmup: number
    confidence: number
    metadata: boolean
    measurementMode: MeasurementMode
}

export interface RunSample {
    iteration: number
    phase: "measurement"
    measurementMode: MeasurementMode
    runTime?: number
    maxMemory?: number
    instructions?: number
    branches?: number
    branchMisses?: number
    pageFaults?: number
    parseWarnings?: string[]
    [event: EventId]: number | string | string[] | undefined
}

export type BenchmarkSummary = Record<string, NumericSummary>

export interface BenchmarkMetadata {
    timestamp: string
    hostname: string
    platform: NodeJS.Platform
    release: string
    arch: string
    cpuModel?: string
    cpuCount: number
    totalMemoryBytes: number
    freeMemoryBytes: number
    nodeVersion: string
    engineId: string
    engineName: string
    dockerImage: string
    measurementMode: MeasurementMode
    inContainer: boolean
    mountSource?: string
    packageVersion?: string
    gitCommit?: string
    uname?: string
    dockerVersion?: string
    perfEventParanoid?: string
    cpuGovernor?: string
}

export interface BenchmarkResult {
    config: BenchmarkOptions
    metadata?: BenchmarkMetadata
    samples: RunSample[]
    summary: BenchmarkSummary
    error?: string
}

export type Stats = Record<string, Record<string, BenchmarkResult>>

const DEFAULT_OPTIONS: BenchmarkOptions = {
    repetitions: 1,
    warmup: 0,
    confidence: 0.95,
    metadata: true,
    measurementMode: "combined",
}

const PERF_EVENTS = [
    "task-clock",
    "instructions",
    "branches",
    "branch-misses",
    "page-faults",
]

export class Benchmark {
    private readonly workloads: Workload[]
    private readonly engines: Engine[]
    private readonly options: BenchmarkOptions

    public constructor(
        workload: Workload | Workload[],
        engine: Engine | Engine[],
        options: Partial<BenchmarkOptions> = {},
    ) {
        this.workloads = Array.isArray(workload) ? workload : [workload]
        this.engines = Array.isArray(engine) ? engine : [engine]
        this.options = sanitizeOptions({...DEFAULT_OPTIONS, ...options})
    }

    /**
     * Runs all provided workloads with all provided engines.
     */
    public async run(): Promise<Stats> {
        const stats: Stats = {}

        for (const workload of this.workloads) {
            const workloadKey = toPascalCase(workload.id)
            stats[workloadKey] = {}

            for (const engine of this.engines) {
                if (this.workloads.length > 1 || this.engines.length > 1) {
                    logger.debug("\n====================\n")
                }

                const engineKey = toPascalCase(engine.id)
                stats[workloadKey][engineKey] = await gatherBenchmark(workload, engine, this.options)
            }
        }

        return stats
    }
}

function sanitizeOptions(options: BenchmarkOptions): BenchmarkOptions {
    const measurementMode: MeasurementMode = options.measurementMode === "split" ? "split" : "combined"

    return {
        repetitions: Math.max(1, Math.floor(options.repetitions)),
        warmup: Math.max(0, Math.floor(options.warmup)),
        confidence: options.confidence,
        metadata: options.metadata,
        measurementMode,
    }
}

async function gatherBenchmark(
    workload: Workload,
    engine: Engine,
    options: BenchmarkOptions,
): Promise<BenchmarkResult> {
    if (!await docker.imageExists(engine.imageName)) await engine.setup()

    logger.info(`Running workload '${workload.id}' with engine ${engine.name}`)
    logger.info(`> Measurement mode: ${options.measurementMode}`)
    logger.info(`> Warm-up runs: ${options.warmup}; measured repetitions: ${options.repetitions}`)

    const filename = `${workload.id}__${engine.id}__${new Date().getTime()}.tmp.js`
    const workloadFile = resolve(PKG_ROOT, "workloads", "tmp", filename)

    await mkdir(dirname(workloadFile), {recursive: true})
    await writeFile(workloadFile, workload.compile(engine))

    // If JeSsi-Bench is running inside Docker, use the host path as mount source.
    const mountSourcePath = process.env.MOUNT_SRC
        ? workloadFile.replace(PKG_ROOT, process.env.MOUNT_SRC)
        : workloadFile

    try {
        for (let i = 0; i < options.warmup; i++) {
            logger.info(`> Warm-up ${i + 1}/${options.warmup}`)
            await runWarmup(engine, mountSourcePath)
        }

        const samples: RunSample[] = []

        for (let i = 0; i < options.repetitions; i++) {
            logger.info(`> Measured run ${i + 1}/${options.repetitions}`)
            samples.push(await gatherOneSample(engine, mountSourcePath, i + 1, options.measurementMode))
        }

        const result: BenchmarkResult = {
            config: options,
            samples,
            summary: summarizeSamples(samples, options.confidence),
        }

        if (options.metadata) {
            result.metadata = await gatherMetadata(engine, options.measurementMode)
        }

        return result
    } catch (e: any) {
        logger.warn(e.message)
        if (logger.logLevel !== LogLevel.DEBUG) {
            logger.warn("Rerun with the `--verbose` option for more details")
        }

        return {
            config: options,
            metadata: options.metadata ? await gatherMetadata(engine, options.measurementMode) : undefined,
            samples: [],
            summary: {},
            error: e.message,
        }
    } finally {
        await unlink(workloadFile)
    }
}

async function runWarmup(engine: Engine, mountSourcePath: string): Promise<void> {
    // Warm-up is a separate pre-measurement execution. It does not preserve
    // process-local JIT/runtime state for the measured repetitions.
    await runCommand([], engine, mountSourcePath)
}

async function gatherOneSample(
    engine: Engine,
    mountSourcePath: string,
    iteration: number,
    measurementMode: MeasurementMode,
): Promise<RunSample> {
    if (measurementMode === "split") {
        return gatherOneSampleSplit(engine, mountSourcePath, iteration)
    }

    return gatherOneSampleCombined(engine, mountSourcePath, iteration)
}

async function gatherOneSampleCombined(
    engine: Engine,
    mountSourcePath: string,
    iteration: number,
): Promise<RunSample> {
    logger.info(" > Gathering performance and memory stats in one execution")

    const output = await runCommand([
        "/usr/bin/time",
        "-v",
        "perf",
        "stat",
        "-x,",
        "-e",
        PERF_EVENTS.join(","),
    ], engine, mountSourcePath)

    const perfStats = parsePerfOutput(output)
    const timeStats = parseTimeOutput(output)
    const parseWarnings = [...perfStats.parseWarnings, ...timeStats.parseWarnings]

    return {
        iteration,
        phase: "measurement",
        measurementMode: "combined",
        ...perfStats.stats,
        ...timeStats.stats,
        ...(parseWarnings.length ? {parseWarnings} : {}),
    }
}

async function gatherOneSampleSplit(
    engine: Engine,
    mountSourcePath: string,
    iteration: number,
): Promise<RunSample> {
    logger.info(" > Gathering performance stats")
    const perfOutput = await runCommand([
        "perf",
        "stat",
        "-x,",
        "-e",
        PERF_EVENTS.join(","),
    ], engine, mountSourcePath)

    logger.info(" > Gathering memory usage")
    const timeOutput = await runCommand(["/usr/bin/time", "-v"], engine, mountSourcePath)

    const perfStats = parsePerfOutput(perfOutput)
    const timeStats = parseTimeOutput(timeOutput)
    const parseWarnings = [...perfStats.parseWarnings, ...timeStats.parseWarnings]

    return {
        iteration,
        phase: "measurement",
        measurementMode: "split",
        ...perfStats.stats,
        ...timeStats.stats,
        ...(parseWarnings.length ? {parseWarnings} : {}),
    }
}

function parsePerfOutput(output: string): {stats: Partial<RunSample>, parseWarnings: string[]} {
    const stats: Partial<RunSample> = {}
    const parseWarnings: string[] = []

    for (const line of output.split(/\r?\n/)) {
        const cells = line.split(",")
        if (cells.length < 3) continue

        const rawValue = cells[0].trim().replace(/^>?/, "")
        const value = parseFloat(rawValue)
        if (!Number.isFinite(value)) continue

        const eventName = cells[2].trim().replace(/:.*$/, "")

        switch (eventName) {
            case "task-clock":
                // perf reports task-clock in milliseconds.
                stats.runTime = value
                break
            case "branch-misses":
                stats.branchMisses = value
                break
            case "page-faults":
                stats.pageFaults = value
                break
            default:
                stats[toPascalCase(eventName)] = value
                break
        }
    }

    if (!stats.runTime) parseWarnings.push("Failed to parse task-clock runtime from perf output")
    if (!stats.instructions) parseWarnings.push("Failed to parse instructions from perf output")
    if (!stats.branches) parseWarnings.push("Failed to parse branches from perf output")
    if (!stats.branchMisses) parseWarnings.push("Failed to parse branch misses from perf output")
    if (!stats.pageFaults) parseWarnings.push("Failed to parse page faults from perf output")

    if (!stats.runTime) {
        throw new Error("Failed to measure runtime with perf")
    }

    return {stats, parseWarnings}
}

function parseTimeOutput(output: string): {stats: Partial<RunSample>, parseWarnings: string[]} {
    const parseWarnings: string[] = []
    const maxMemory = output.match(/^\s*Maximum resident set size \(kbytes\): (\d+)/m)?.[1]

    if (!maxMemory) {
        parseWarnings.push("Failed to parse maximum resident set size from GNU time output")
        throw new Error("Failed to measure max memory usage")
    }

    return {
        stats: {
            maxMemory: parseInt(maxMemory) * 1000,
        },
        parseWarnings,
    }
}

function summarizeSamples(samples: RunSample[], confidence: number): BenchmarkSummary {
    const summary: BenchmarkSummary = {}
    const keys = new Set<string>()

    for (const sample of samples) {
        for (const [key, value] of Object.entries(sample)) {
            if (
                key !== "iteration" &&
                key !== "phase" &&
                key !== "measurementMode" &&
                key !== "parseWarnings" &&
                typeof value === "number"
            ) {
                keys.add(key)
            }
        }
    }

    for (const key of keys) {
        const values = samples
            .map(sample => sample[key])
            .filter((value): value is number => typeof value === "number" && Number.isFinite(value))

        const stat = summarize(values, confidence)
        if (stat) summary[key] = stat
    }

    return summary
}

async function gatherMetadata(engine: Engine, measurementMode: MeasurementMode): Promise<BenchmarkMetadata> {
    const cpus = os.cpus()

    return {
        timestamp: new Date().toISOString(),
        hostname: os.hostname(),
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        cpuModel: cpus[0]?.model,
        cpuCount: cpus.length,
        totalMemoryBytes: os.totalmem(),
        freeMemoryBytes: os.freemem(),
        nodeVersion: process.version,
        engineId: engine.id,
        engineName: engine.name,
        dockerImage: engine.imageName,
        measurementMode,
        inContainer: IN_CONTAINER,
        mountSource: process.env.MOUNT_SRC,
        packageVersion: PKG_VERSION,
        gitCommit: await safeExec("git", ["rev-parse", "HEAD"], PKG_ROOT),
        uname: await safeExec("uname", ["-a"]),
        dockerVersion: await safeExec("docker", ["--version"]),
        perfEventParanoid: await safeReadFile("/proc/sys/kernel/perf_event_paranoid"),
        cpuGovernor: await safeReadFile("/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor"),
    }
}

async function safeExec(command: string, args: string[], cwd?: string): Promise<string | undefined> {
    try {
        const {stdout} = await execFile(command, args, {cwd})
        return stdout.trim() || undefined
    } catch {
        return undefined
    }
}

async function safeReadFile(path: string): Promise<string | undefined> {
    try {
        return (await readFile(path, "utf-8")).trim() || undefined
    } catch {
        return undefined
    }
}

async function runCommand(command: string[], engine: Engine, workloadFile: string): Promise<string> {
    let output = ""

    const containerStream = new Writable({
        write: (chunk: Buffer, _, next) => {
            logger.debug(chunk, {raw: true})
            output += chunk.toString()
            next()
        },
    })

    const [{StatusCode: exitCode}] = (await docker.run(
        engine.imageName,
        ["/jessi-bench/workload.js"],
        containerStream,
        {
            Entrypoint: [...command, engine.entrypoint],
            HostConfig: {
                Mounts: [{
                    Type: "bind",
                    Source: workloadFile,
                    Target: "/jessi-bench/workload.js",
                }],
                AutoRemove: true,
                SecurityOpt: ["seccomp=unconfined"],
            },
        },
    ))

    if (exitCode !== 0) {
        throw new Error(`This workload could not be run with ${engine.name} (exit code: ${exitCode})`)
    }

    return output
}
