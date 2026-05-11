import {existsSync, readFileSync} from "fs"
import {readdir, readFile} from "fs/promises"
import {resolve} from "path"
import {Engine} from "./engine.js"
import {logger} from "../utils/logger.js"
import {getTagsForId, loadTagConfig} from "../utils/tags.js"

export type WorkloadId = string
export type WorkloadExecutionMode = "script" | "harnessed"

export interface HarnessOptions {
    warmup: number
    repetitions: number
}

export class Workload {
    public readonly id: WorkloadId
    private readonly sourceCode: string

    public constructor(id: WorkloadId) {
        try {
            this.sourceCode = readFileSync(resolve(PKG_ROOT, "workloads", `${id}.js`), "utf-8")
        } catch (e: any) {
            throw new Error(`Invalid workload '${id}' (${e.message})`)
        }
        this.id = id
    }

    /**
     * Compiles the source code for a specific engine and returns the generated source code.
     * If no engine is provided, returns the source code as is.
     *
     * In script mode this preserves the historical JeSsi-Bench behaviour: the workload is an
     * arbitrary self-contained JavaScript program executed once by the engine.
     *
     * @param engine The target JavaScript engine
     */
    public compile(engine?: Engine): string {
        return this.applyEngineTemplate(this.sourceCode, engine)
    }

    /**
     * Compiles the workload as an in-process benchmark harness.
     *
     * Harnessed workloads must define a global function named `benchmark`:
     *
     * function benchmark() {
     *     // one logical benchmark operation
     *     return someValue
     * }
     *
     * Warm-up iterations and measured repetitions are then executed inside the same JS engine
     * process, so JIT/compiler/runtime state can actually be warmed up.
     */
    public compileHarnessed(engine: Engine | undefined, options: HarnessOptions): string {
        const source = [
            "var __JESSI_BENCH_HARNESS__ = true;",
            this.sourceCode,
            buildHarnessSource(options),
        ].join("\n\n")

        return this.applyEngineTemplate(source, engine)
    }

    private applyEngineTemplate(source: string, engine?: Engine): string {
        if (!engine) return source

        const templateFile = resolve(PKG_ROOT, "engines", engine.id, "template.js")
        if (!existsSync(templateFile)) {
            logger.debug(`No workload template found for ${engine.id}\n> ${templateFile}`)
            return source
        }

        const template = readFileSync(templateFile, "utf-8")
        return template.replace(/\$\{\s*workload\s*}/, source)
    }

    public static async getAllIds(): Promise<WorkloadId[]> {
        const workloadsRoot = resolve(PKG_ROOT, "workloads")
        return (await readdir(workloadsRoot))
            .filter(filename => filename.endsWith(".js"))
            .map(filename => filename.replace(/\.js$/, ""))
            .sort((a, b) => a.localeCompare(b))
    }

    public static async listAll(tagConfigPath?: string): Promise<{ id: string, lines: number, tags: string }[]> {
        const ids = await Workload.getAllIds()
        const tagConfig = loadTagConfig(tagConfigPath)

        return await Promise.all(ids.map(async id => {
            const buf = await readFile(resolve(PKG_ROOT, "workloads", id + ".js"))
            const lines = buf.toString().split("\n").length
            return {
                id,
                lines,
                tags: getTagsForId(tagConfig.workloads, id).join(", "),
            }
        }))
    }
}

function buildHarnessSource(options: HarnessOptions): string {
    return `
(function () {
    var WARMUP = ${JSON.stringify(options.warmup)};
    var REPETITIONS = ${JSON.stringify(options.repetitions)};

    if (typeof benchmark !== "function") {
        throw new Error("Harnessed workload mode requires a global function named benchmark()");
    }

    function nowMs() {
        if (typeof performance !== "undefined" && performance && performance.now) {
            return performance.now();
        }
        return Date.now();
    }

    var sink = 0;

    function consume(value) {
        if (typeof value === "number") {
            sink += value;
        } else if (typeof value === "string") {
            sink += value.length;
        } else if (value && typeof value.length === "number") {
            sink += value.length;
        } else if (value !== undefined && value !== null) {
            sink += 1;
        }
    }

    for (var i = 0; i < WARMUP; i++) {
        consume(benchmark());
    }

    for (var j = 0; j < REPETITIONS; j++) {
        var start = nowMs();
        var result = benchmark();
        var end = nowMs();
        consume(result);
        console.log(JSON.stringify({
            type: "jessi-bench-sample",
            iteration: j + 1,
            runTime: end - start
        }));
    }

    console.log(JSON.stringify({
        type: "jessi-bench-sink",
        value: sink
    }));
})();`
}
