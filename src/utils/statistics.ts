export interface NumericSummary {
    n: number
    mean: number
    median: number
    stddev: number
    min: number
    max: number
    ci95: {
        low: number
        high: number
    }
}

export function summarize(values: number[]): NumericSummary | undefined {
    const xs = values.filter(value => Number.isFinite(value))
    if (xs.length === 0) return undefined

    const avg = mean(xs)
    const sd = stddev(xs)
    const margin = 1.96 * sd / Math.sqrt(xs.length)

    return {
        n: xs.length,
        mean: avg,
        median: median(xs),
        stddev: sd,
        min: Math.min(...xs),
        max: Math.max(...xs),
        ci95: {
            low: avg - margin,
            high: avg + margin,
        },
    }
}

export function mean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2
    }

    return sorted[middle]
}

export function stddev(values: number[]): number {
    if (values.length < 2) return 0

    const avg = mean(values)
    const variance = values
        .map(value => Math.pow(value - avg, 2))
        .reduce((sum, value) => sum + value, 0) / (values.length - 1)

    return Math.sqrt(variance)
}
