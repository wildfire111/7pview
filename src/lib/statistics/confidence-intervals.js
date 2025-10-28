/**
 * Confidence interval calculations
 * Statistical confidence interval calculations using t-distribution
 */

import { jStat } from "jstat";

/**
 * Calculate mean and 80% confidence interval for deck performance data
 * Filters for events with >16 players and uses t-distribution for accuracy
 * @param {Object[]} deckArray - Array of deck objects with event_date, max_players, normalised_placement
 * @returns {Object|null} Object with mean and marginOfError, or null if insufficient data
 */
export function calculateMeanAndConfidenceInterval(deckArray) {
    if (!deckArray?.length) return null;

    // Filter for statistical validity: >16 players, valid placements
    const placements = deckArray
        .filter((deck) => Number(deck.max_players) > 16)
        .map((deck) => Number(deck.normalised_placement))
        .filter((placement) => !isNaN(placement) && isFinite(placement));

    if (placements.length < 2) return null; // Need minimum 2 samples for t-distribution

    const n = placements.length;
    const mean = jStat.mean(placements);
    const stddev = jStat.stdev(placements, true); // Sample standard deviation

    // Use t-distribution for small sample accuracy
    const standardError = stddev / Math.sqrt(n);
    const degreesOfFreedom = n - 1;
    const tValue = jStat.studentt.inv(1 - 0.2 / 2, degreesOfFreedom); // 80% CI
    const marginOfError = tValue * standardError;

    // Validate results
    if (
        isNaN(mean) ||
        !isFinite(mean) ||
        isNaN(marginOfError) ||
        !isFinite(marginOfError)
    ) {
        return null;
    }

    return { mean, marginOfError };
}

/**
 * Calculate confidence interval for normalized placements
 * @param {number[]} placements - Array of normalized placements (0-1)
 * @param {number} confidence - Confidence level (default 0.80 for 80%)
 * @returns {Object} Object with lower, upper bounds and confidence level
 */
export function calculateConfidenceInterval(placements, confidence = 0.8) {
    if (!placements || placements.length < 2) {
        return {
            lower: null,
            upper: null,
            confidence,
            error: "Insufficient data for confidence interval",
        };
    }

    const n = placements.length;
    const mean = jStat.mean(placements);
    const stdDev = jStat.stdev(placements, true); // Sample standard deviation

    // Standard error of the mean
    const standardError = stdDev / Math.sqrt(n);

    // Get t-value for confidence level
    const alpha = 1 - confidence;
    const degreesOfFreedom = n - 1;
    const tValue = jStat.studentt.inv(1 - alpha / 2, degreesOfFreedom);

    // Calculate margin of error
    const marginOfError = tValue * standardError;

    return {
        lower: Math.max(0, mean - marginOfError), // Placement can't be below 0
        upper: Math.min(1, mean + marginOfError), // Placement can't be above 1
        confidence,
        mean,
        marginOfError,
        sampleSize: n,
    };
}
