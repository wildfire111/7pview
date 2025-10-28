/**
 * Leaderboard-specific database queries
 * Complex queries for leaderboard data aggregation and card performance analysis
 */

import { query } from "./db.js";

/**
 * Fetch card performance data for leaderboards
 * @param {Date} startDate - Start date for filtering
 * @param {Date} endDate - End date for filtering
 * @param {string[]} [cardFilter] - Optional array of card IDs to filter by
 * @returns {Promise<Object>} Query result with card statistics
 */
export async function getLeaderboardCardData(
    startDate,
    endDate,
    cardFilter = null
) {
    const formatDate = (date) => date.toISOString().split("T")[0];

    let sql = `
        WITH card_stats AS (
            SELECT 
                c.scryfall_id,
                c.name as card_name,
                COUNT(DISTINCT d.id) as total_appearances,
                AVG(d.placement::float / e.num_players::float) as avg_normalized_placement,
                ARRAY_AGG(
                    JSON_BUILD_OBJECT(
                        'event_name', e.name,
                        'event_date', e.date,
                        'normalised_placement', d.placement::float / e.num_players::float,
                        'raw_placement', d.placement,
                        'num_players', e.num_players
                    ) ORDER BY e.date DESC
                ) as placement_details
            FROM cards c
            JOIN deck_cards dc ON c.scryfall_id = dc.card_id
            JOIN decks d ON dc.deck_id = d.id
            JOIN events e ON d.event_id = e.id
            WHERE e.date >= $1 AND e.date <= $2
            AND e.num_players > 16
    `;

    const params = [formatDate(startDate), formatDate(endDate)];

    if (cardFilter?.length > 0) {
        sql += ` AND c.scryfall_id = ANY($3)`;
        params.push(cardFilter);
    }

    sql += `
            GROUP BY c.scryfall_id, c.name
        )
        SELECT * FROM card_stats
        ORDER BY avg_normalized_placement ASC
    `;

    try {
        const { rows } = await query(sql, params);

        return {
            success: true,
            cards: rows,
            metadata: {
                date_range: {
                    start: formatDate(startDate),
                    end: formatDate(endDate),
                },
                total_cards: rows.length,
            },
        };
    } catch (err) {
        console.error("Database error in getLeaderboardCardData:", err);
        throw new Error("Failed to fetch leaderboard card data");
    }
}
