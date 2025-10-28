/**
 * Performance metrics and delta calculations
 * Handles StatBox-style performance comparisons between card sets
 */

import { calculateMeanAndConfidenceInterval } from "./confidence-intervals.js";
import { filterDecksByDateRange } from "./date-filters.js";

/**
 * Calculate performance delta between included and excluded card performance
 * This is the core StatBox calculation comparing decks with vs without specific cards
 * @param {Object[]} includeDecks - Decks that include the target cards
 * @param {Object[]} excludeDecks - Decks that exclude the target cards (baseline)
 * @param {Date} startDate - Start date for filtering
 * @param {Date} endDate - End date for filtering
 * @returns {Object} Delta calculation results with confidence intervals
 */
export function calculatePerformanceDelta(
    includeDecks,
    excludeDecks,
    startDate,
    endDate
) {
    // Filter by date range
    const filteredIncludeDecks = filterDecksByDateRange(
        includeDecks,
        startDate,
        endDate
    );
    const filteredExcludeDecks = filterDecksByDateRange(
        excludeDecks,
        startDate,
        endDate
    );

    // Calculate statistics for each group
    const includeStats =
        calculateMeanAndConfidenceInterval(filteredIncludeDecks);
    const excludeStats =
        calculateMeanAndConfidenceInterval(filteredExcludeDecks);

    let delta = 0;
    let marginOfError = 0;

    if (includeStats && excludeStats) {
        delta = includeStats.mean - excludeStats.mean;
        marginOfError = includeStats.marginOfError;

        // Ensure valid numbers
        if (isNaN(delta) || !isFinite(delta)) {
            delta = 0;
        }
        if (isNaN(marginOfError) || !isFinite(marginOfError)) {
            marginOfError = 0;
        }
    }

    return {
        delta,
        CI: marginOfError,
        inc_count: filteredIncludeDecks.length,
        inv_count: filteredExcludeDecks.length,

        // Legacy field names for backward compatibility
        incExcCount: filteredIncludeDecks.length,
        invCount: filteredExcludeDecks.length,
    };
}

/**
 * Calculate conservative performance score
 * Penalizes uncertainty by adding confidence interval to delta
 * @param {number} delta - Performance delta
 * @param {number} confidenceInterval - Confidence interval (uncertainty measure)
 * @returns {number} Conservative score (delta + CI for penalty)
 */
export function calculateConservativeScore(delta, confidenceInterval) {
    return delta + confidenceInterval;
}

/**
 * Rank cards by performance with conservative scoring
 * @param {Object[]} cards - Array of card objects with performance metrics
 * @returns {Object[]} Sorted array with rank assignments
 */
export function rankCardsByPerformance(cards) {
    return cards
        .sort((a, b) => {
            // Primary sort: conservative score (lower is better)
            if (a.conservative_score !== b.conservative_score) {
                return a.conservative_score - b.conservative_score;
            }
            // Secondary sort: sample size (higher is better for tie-breaking)
            return b.inc_count - a.inc_count;
        })
        .map((card, index) => ({ ...card, rank: index + 1 }));
}
