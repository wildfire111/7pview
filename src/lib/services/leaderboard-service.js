/**
 * Leaderboard service
 * Business logic for leaderboard data processing and ranking
 */

import {
    getLeaderboardCardData,
    getDeckResultsForStats,
} from "@/lib/database/index.js";
import {
    calculatePerformanceDelta,
    calculateConservativeScore,
    rankCardsByPerformance,
    createDateRangeForPeriod,
} from "@/lib/statistics/index.js";
import { getPointsData } from "./points-service.js";

/**
 * Fetch and process leaderboard data for multiple time periods
 * @returns {Promise<Object>} Processed leaderboard data for all time periods
 */
export async function fetchLeaderboardData() {
    try {
        // Get points information for card filtering and date reference
        const pointsInfo = await getPointsData();
        const lastUpdateDate = pointsInfo.lastChanged
            ? new Date(pointsInfo.lastChanged)
            : new Date();

        // Create card filter from points data
        const cardFilter =
            pointsInfo.cards?.length > 0
                ? pointsInfo.cards.map((card) => card.scryfall_id)
                : null;

        // Define time periods
        const periods = [
            {
                name: "All Time",
                key: "allTime",
                ...createDateRangeForPeriod("all-time"),
            },
            {
                name: "Last Year",
                key: "lastYear",
                ...createDateRangeForPeriod("last-year"),
            },
            {
                name: "Since Last Update",
                key: "sinceUpdate",
                startDate: lastUpdateDate,
                endDate: new Date(),
            },
        ];

        // Fetch data for all periods in parallel
        const results = await Promise.all(
            periods.map(async (period) => {
                const [cardData, deckData] = await Promise.all([
                    getLeaderboardCardData(
                        period.startDate,
                        period.endDate,
                        cardFilter
                    ),
                    getDeckResultsForStats(period.startDate, period.endDate),
                ]);

                return {
                    ...period,
                    data: processLeaderboardData(cardData, deckData, period),
                };
            })
        );

        // Convert results to object with keys
        return results.reduce((acc, result) => {
            acc[result.key] = result.data;
            return acc;
        }, {});
    } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
        throw new Error(`Leaderboard service error: ${error.message}`);
    }
}

/**
 * Process raw leaderboard data using StatBox methodology
 * @param {Object} cardData - Raw card performance data
 * @param {Object[]} deckResults - Deck results for StatBox calculations
 * @param {Object} period - Period information
 * @returns {Object} Processed leaderboard data
 */
function processLeaderboardData(cardData, deckResults, period) {
    if (!cardData.success) {
        throw new Error(`Failed to fetch card data for ${period.name}`);
    }

    const processedCards = cardData.cards.map((card) => {
        // Create includes/excludes arrays for StatBox calculation
        const includeDecks = deckResults.filter((deck) =>
            deck.cards_in_deck.includes(card.scryfall_id)
        );
        const excludeDecks = deckResults.filter(
            (deck) => !deck.cards_in_deck.includes(card.scryfall_id)
        );

        // Calculate performance delta using StatBox methodology
        const performanceMetrics = calculatePerformanceDelta(
            includeDecks,
            excludeDecks,
            period.startDate,
            period.endDate
        );

        // Calculate conservative score (penalizes uncertainty)
        const conservativeScore = calculateConservativeScore(
            performanceMetrics.delta,
            performanceMetrics.CI
        );

        return {
            scryfall_id: card.scryfall_id,
            name: card.card_name,
            appearances: card.total_appearances,

            // Performance metrics
            delta: performanceMetrics.delta,
            CI: performanceMetrics.CI,
            inc_count: performanceMetrics.inc_count,
            inv_count: performanceMetrics.inv_count,
            conservative_score: conservativeScore,

            // Sample event details (limit to recent events)
            sample_events: card.placement_details.slice(0, 3),
        };
    });

    // Filter and rank cards
    const rankedCards = rankCardsByPerformance(
        processedCards.filter((card) => card.inc_count > 5) // Minimum 6 appearances
    );

    return {
        period_name: period.name,
        metadata: {
            ...cardData.metadata,
            period_start: period.startDate.toISOString(),
            period_end: period.endDate.toISOString(),
        },
        total_cards: rankedCards.length,
        top_cards: rankedCards.slice(0, 50), // Top 50 for display
        all_cards: rankedCards,

        // Summary statistics
        summary: {
            total_events: new Set(
                processedCards.flatMap((card) =>
                    card.sample_events.map(
                        (event) => event.event_name || "Unknown"
                    )
                )
            ).size,
            total_appearances: processedCards.reduce(
                (sum, card) => sum + card.inc_count,
                0
            ),
        },
    };
}
