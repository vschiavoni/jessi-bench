import {plot, Plot as PlotData} from "nodeplotlib"
import {BenchmarkResult, Stats} from "./benchmark.js"

interface PlotEntry {
    title: string
    plot: PlotData[]
}

export class Plot {
    private readonly plots: PlotEntry[]

    public constructor(benchmark: Stats) {
        const stats = [
            {title: "Run time median (ms)", id: "runTime", scale: 1},
            {title: "Memory usage median (MB)", id: "maxMemory", scale: 1 / 1000000},
            {title: "Instructions count median", id: "instructions", scale: 1},
            {title: "Branches median", id: "branches", scale: 1},
            {title: "Branch misses median", id: "branchMisses", scale: 1},
            {title: "Page faults median", id: "pageFaults", scale: 1},
        ]

        this.plots = stats.map(({title, id: statId, scale}) => ({
            title,
            plot: Object.entries(benchmark).map(([workloadId, engineStats]) => {
                const filtered = Object.fromEntries(Object.entries(engineStats)
                    .filter(([_, result]) => hasSummaryStat(result, statId)))

                return {
                    name: workloadId,
                    x: Object.keys(filtered),
                    y: Object.values(filtered).map(result => result.summary[statId].median * scale),
                    error_y: {
                        type: "data",
                        array: Object.values(filtered).map(result => ciHighError(result, statId) * scale),
                        arrayminus: Object.values(filtered).map(result => ciLowError(result, statId) * scale),
                        visible: true,
                    },
                    type: "bar",
                }
            }),
        }))
    }

    public show() {
        if (IN_CONTAINER) {
            throw new Error(
                "Drawing plots inside a Docker container is not yet supported.\n" +
                "Please install Node.js and run `node build/main plot` instead.")
        }

        for (const entry of this.plots) plot(entry.plot, {title: {text: entry.title}})
    }
}

function hasSummaryStat(result: BenchmarkResult, statId: string): boolean {
    return !!result.summary?.[statId]
}

function ciHighError(result: BenchmarkResult, statId: string): number {
    const summary = result.summary[statId]
    return Math.max(0, summary.ci95.high - summary.median)
}

function ciLowError(result: BenchmarkResult, statId: string): number {
    const summary = result.summary[statId]
    return Math.max(0, summary.median - summary.ci95.low)
}
