import {OptionValues, program} from "commander"
import {readFile, writeFile} from "fs/promises"
import "./utils/globals.js"
import {logger, LogLevel} from "./utils/logger.js"
import {actionWrapper, mergeFilterSelections} from "./utils/cli.js"
import {timestamp} from "./utils/helpers.js"
import {
    DEFAULT_TAG_CONFIG_FILE,
    findUnmatchedTags,
    listKnownTags,
    loadTagConfig,
    normalizeTags,
    selectIdsByTags,
} from "./utils/tags.js"
import {Engine, EngineId} from "./commands/engine.js"
import {Workload, WorkloadId, WorkloadExecutionMode} from "./commands/workload.js"
import {Benchmark, BenchmarkOptions, MeasurementMode} from "./commands/benchmark.js"
import {Plot} from "./commands/plot.js"

program
    .name("jessi-bench")
    .description("jessi-bench is a tool to benchmark IoT-friendly JavaScript engines")
    .version(PKG_VERSION)
    .option("-v, --verbose", "print additional details for debugging purpose")
    .configureOutput({
        writeOut: str => logger.info(str),
        writeErr: str => logger.error(str),
    })

program
    .command("benchmark")
    .alias("bm")
    .description(
        "Generate a benchmark for selected workloads and engines and store results in a JSON file.\n" +
        "You can select workloads and engines explicitly, by tag, or both.",
    )
    .summary("generate a benchmark")
    .option("-w, --workload <workload...>", "the workload(s) to run (default: all)")
    .option("-e, --engine <engine...>", "the engine(s) to use (default: all)")
    .option("--workload-tag <tag...>", "select workloads having any of the given tags")
    .option("--engine-tag <tag...>", "select engines having any of the given tags")
    .option("--tag-config <file>", "path to the persistent tag configuration file", DEFAULT_TAG_CONFIG_FILE)
    .option("-o, --output <file>", "the output file that will store the results")
    .option("-p, --plot", "displays plots once the benchmark is generated")
    .option("-r, --repetitions <number>", "number of measured repetitions", "30")
    .option("--warmup <number>", "number of warm-up iterations/runs before measurement", "5")
    .option("--confidence <number>", "confidence level used for statistical summaries", "0.95")
    .option("--measurement-mode <mode>", "collect runtime/perf and memory in combined or split mode", "combined")
    .option("--workload-mode <mode>", "execute workloads as script or harnessed", "script")
    .option("--no-metadata", "do not include machine and environment metadata")
    .action(actionWrapper(async (options: OptionValues) => {
        const allEngineIds = await Engine.getAllIds()
        const allWorkloadIds = await Workload.getAllIds()

        const tagConfig = loadTagConfig(options.tagConfig)
        const engineTags = normalizeTags(options.engineTag)
        const workloadTags = normalizeTags(options.workloadTag)

        warnUnmatchedTags("engine", allEngineIds, tagConfig.engines, engineTags)
        warnUnmatchedTags("workload", allWorkloadIds, tagConfig.workloads, workloadTags)

        const taggedEngineIds = selectIdsByTags(allEngineIds, tagConfig.engines, engineTags) as EngineId[]
        const taggedWorkloadIds = selectIdsByTags(allWorkloadIds, tagConfig.workloads, workloadTags) as WorkloadId[]

        const engineIds = mergeFilterSelections(options.engine, taggedEngineIds, allEngineIds) as EngineId[]
        const workloadIds = mergeFilterSelections(options.workload, taggedWorkloadIds, allWorkloadIds) as WorkloadId[]

        if (engineIds.length === 0) throw new Error("No engines selected")
        if (workloadIds.length === 0) throw new Error("No workloads selected")

        if (engineTags.length || workloadTags.length) {
            logger.info(`Selected engines: ${engineIds.join(", ")}`)
            logger.info(`Selected workloads: ${workloadIds.join(", ")}`)
        }

        const engines = engineIds.map((id: EngineId) => new Engine(id))
        const workloads = workloadIds.map((id: WorkloadId) => new Workload(id))

        const benchmarkOptions: BenchmarkOptions = {
            repetitions: parsePositiveInteger(options.repetitions, "repetitions"),
            warmup: parseNonNegativeInteger(options.warmup, "warmup"),
            confidence: parseConfidence(options.confidence),
            metadata: options.metadata,
            measurementMode: parseMeasurementMode(options.measurementMode),
            workloadMode: parseWorkloadMode(options.workloadMode),
        }

        const benchmark = new Benchmark(workloads, engines, benchmarkOptions)
        const results = await benchmark.run()

        const filename = options.output ?? `benchmark_${timestamp()}.json`
        const data = JSON.stringify(results, null, 4)
        await writeFile(filename, data)
        logger.info("Saved results to " + filename)

        if (options.plot) {
            logger.info("-------------------------------")
            new Plot(results).show()
        }
    }))

const engineCmd = program
    .command("engine")
    .description("Manage JavaScript engines")
    .summary("manage engines")

engineCmd
    .command("list")
    .description("List all available JavaScript engines")
    .summary("list available engines")
    .option("--tag-config <file>", "path to the persistent tag configuration file", DEFAULT_TAG_CONFIG_FILE)
    .action(actionWrapper(async () => logger.table(await Engine.listAll(options.tagConfig))))

engineCmd
    .command("setup")
    .description("Download and build (or rebuild) one of the available JavaScript engines")
    .summary("setup an engine")
    .argument("<engine>", "the engine to setup")
    .action(actionWrapper(async engineId => new Engine(engineId).setup()))

const workloadCmd = program
    .command("workload")
    .alias("wl")
    .description("Manage workloads")
    .summary("manage workloads")

workloadCmd
    .command("list")
    .description("List all available workloads")
    .summary("list available workloads")
    .option("--tag-config <file>", "path to the persistent tag configuration file", DEFAULT_TAG_CONFIG_FILE)
    .action(actionWrapper(async () => logger.table(await Workload.listAll(options.tagConfig))))

const tagCmd = program
    .command("tag")
    .description("Inspect persistent engine/workload tags")
    .summary("inspect tags")

tagCmd
    .command("list")
    .description("List known engine and workload tags")
    .summary("list tags")
    .option("--tag-config <file>", "path to the persistent tag configuration file", DEFAULT_TAG_CONFIG_FILE)
    .action(actionWrapper(async (options: OptionValues) => {
        const tagConfig = loadTagConfig(options.tagConfig)
        logger.info("Engine tags: " + listKnownTags(tagConfig.engines).join(", "))
        logger.info("Workload tags: " + listKnownTags(tagConfig.workloads).join(", "))
    }))

tagCmd
    .command("engines")
    .description("List engines matching any of the given tags")
    .summary("list engines by tag")
    .argument("<tag...>", "tag(s) to match")
    .option("--tag-config <file>", "path to the persistent tag configuration file", DEFAULT_TAG_CONFIG_FILE)
    .action(actionWrapper(async (tags: string[], options: OptionValues) => {
        const allEngineIds = await Engine.getAllIds()
        const tagConfig = loadTagConfig(options.tagConfig)
        const selectedTags = normalizeTags(tags)
        warnUnmatchedTags("engine", allEngineIds, tagConfig.engines, selectedTags)
        logger.info(selectIdsByTags(allEngineIds, tagConfig.engines, selectedTags).join("\n"))
    }))

tagCmd
    .command("workloads")
    .description("List workloads matching any of the given tags")
    .summary("list workloads by tag")
    .argument("<tag...>", "tag(s) to match")
    .option("--tag-config <file>", "path to the persistent tag configuration file", DEFAULT_TAG_CONFIG_FILE)
    .action(actionWrapper(async (tags: string[], options: OptionValues) => {
        const allWorkloadIds = await Workload.getAllIds()
        const tagConfig = loadTagConfig(options.tagConfig)
        const selectedTags = normalizeTags(tags)
        warnUnmatchedTags("workload", allWorkloadIds, tagConfig.workloads, selectedTags)
        logger.info(selectIdsByTags(allWorkloadIds, tagConfig.workloads, selectedTags).join("\n"))
    }))

program
    .command("plot")
    .description("Generate and display plots for a benchmark.")
    .summary("draw plots")
    .argument("<benchmark-file>", "a benchmark JSON file")
    .action(actionWrapper(async benchmarkFile => {
        const json = await readFile(benchmarkFile, "utf-8")
        const benchmark = JSON.parse(json)
        new Plot(benchmark).show()
    }))

program.on("option:verbose", () => logger.logLevel = LogLevel.DEBUG)
program.parse()

function warnUnmatchedTags(
    kind: "engine" | "workload",
    allIds: string[],
    tagMap: Record<string, string[]>,
    selectedTags: string[],
) {
    const unmatched = findUnmatchedTags(allIds, tagMap, selectedTags)
    if (!unmatched.length) return

    const knownTags = listKnownTags(tagMap)
    for (const tag of unmatched) logger.warn(`${kind} tag '${tag}' matched no ${kind}s`)
    if (knownTags.length) logger.warn(`Known ${kind} tags: ${knownTags.join(", ")}`)
}

function parsePositiveInteger(value: string, optionName: string): number {
    const parsed = parseInt(value)
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`Invalid --${optionName}: expected an integer >= 1`)
    }
    return parsed
}

function parseNonNegativeInteger(value: string, optionName: string): number {
    const parsed = parseInt(value)
    if (!Number.isInteger(parsed) || parsed < 0) {
        throw new Error(`Invalid --${optionName}: expected an integer >= 0`)
    }
    return parsed
}

function parseConfidence(value: string): number {
    const parsed = parseFloat(value)
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 1) {
        throw new Error("Invalid --confidence: expected a number between 0 and 1, e.g. 0.95")
    }
    return parsed
}

function parseMeasurementMode(value: string): MeasurementMode {
    if (value === "combined" || value === "split") return value
    throw new Error("Invalid --measurement-mode: expected combined or split")
}

function parseWorkloadMode(value: string): WorkloadExecutionMode {
    if (value === "script" || value === "harnessed") return value
    throw new Error("Invalid --workload-mode: expected script or harnessed")
}
