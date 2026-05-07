export interface NumericSummary {
    n: number
    mean: number
    median: number
    stddev: number
    min: number
    max: number
    ci: {
        confidence: number
        low: number
        high: number
    }
    /** Kept for backward compatibility with previous JSON/plot code. */
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
    const requestedMargin = zScore(confidence) * sd / Math.sqrt(xs.length)
    const margin95 = zScore(0.95) * sd / Math.sqrt(xs.length)

    return {
        n: xs.length,
        mean: avg,
        median: median(xs),
        stddev: sd,
        min: Math.min(...xs),
        max: Math.max(...xs),
        ci: {
            confidence,
            low: avg - requestedMargin,
            high: avg + requestedMargin,
        },
        ci95: {
            low: avg - margin95,
            high: avg + margin95,
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

function zScore(confidence: number): number {
    // Common two-sided normal critical values. This avoids adding a dependency.
    const rounded = Math.round(confidence * 1000) / 1000

    switch (rounded) {
        case 0.80: return 1.2815515655446004
        case 0.85: return 1.4395314709384563
        case 0.90: return 1.6448536269514722
        case 0.95: return 1.959963984540054
        case 0.98: return 2.3263478740408408
        case 0.99: return 2.5758293035489004
        default:
            // Sensible fallback for unsupported confidence levels.
            // The value is still recorded in the JSON config.
            return 1.959963984540054
    }
}
