export interface NumericSummary {
    n: number
    mean: number
    median: number
    stddev: number
    min: number
    max: number
    confidence: number
    confidenceInterval: {
        low: number
        high: number
    }
    /**
     * Backward-compatible alias used by the plotting code and by previous
     * result files. When confidence is 0.95, this is exactly the 95% CI.
     */
    ci95: {
        low: number
        high: number
    }
}

export function summarize(values: number[], confidence = 0.95): NumericSummary | undefined {
    const xs = values.filter(value => Number.isFinite(value))
    if (xs.length === 0) return undefined

    const avg = mean(xs)
    const sd = stddev(xs)
    const z = zScore(confidence)
    const margin = z * sd / Math.sqrt(xs.length)
    const interval = {
        low: avg - margin,
        high: avg + margin,
    }

    return {
        n: xs.length,
        mean: avg,
        median: median(xs),
        stddev: sd,
        min: Math.min(...xs),
        max: Math.max(...xs),
        confidence,
        confidenceInterval: interval,
        ci95: interval,
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

/**
 * Approximate z-score for common two-sided confidence intervals.
 * This avoids adding a dependency just for normal quantiles.
 */
function zScore(confidence: number): number {
    if (Math.abs(confidence - 0.80) < 1e-9) return 1.2815515655446004
    if (Math.abs(confidence - 0.90) < 1e-9) return 1.6448536269514722
    if (Math.abs(confidence - 0.95) < 1e-9) return 1.959963984540054
    if (Math.abs(confidence - 0.98) < 1e-9) return 2.3263478740408408
    if (Math.abs(confidence - 0.99) < 1e-9) return 2.5758293035489004

    // Fallback to the 95% interval for uncommon values. The requested
    // confidence is still stored in the result metadata.
    return 1.959963984540054
}
