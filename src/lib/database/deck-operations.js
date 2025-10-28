/**
 * Deck-related database operations
 * Handles all database interactions for deck entities and deck filtering
 */

import { query } from "./db.js";

/**
 * Get detailed information for multiple decks
 * @param {string[]} deckIds - Array of deck IDs to fetch details for
 * @returns {Promise<Object[]>} Array of deck detail objects
 */
export async function getDeckDetails(deckIds) {
    if (!deckIds?.length) return [];

    try {
        // Use a single query with IN clause for better performance
        const placeholders = deckIds
            .map((_, index) => `$${index + 1}`)
            .join(", ");
        const { rows } = await query(
            `SELECT 
                d.id AS deck_id, 
                d.archetype, 
                p.name AS player_name, 
                e.name AS event_name, 
                e.date AS event_date
            FROM decks d
            JOIN players p ON d.player_id = p.id
            JOIN events e ON d.event_id = e.id
            WHERE d.id IN (${placeholders})
            ORDER BY e.date DESC`,
            deckIds
        );
        return rows;
    } catch (err) {
        console.error("Database error in getDeckDetails:", err);
        throw new Error("Failed to fetch deck details");
    }
}

/**
 * Get decks that include specific cards and exclude others
 * @param {string[]} includeCards - Cards that must be included (empty array = all decks)
 * @param {string[]} excludeCards - Cards that must be excluded
 * @returns {Promise<Object[]>} Array of deck objects with placement data
 */
export async function getDecksWithCardFilter(
    includeCards = [],
    excludeCards = []
) {
    try {
        const sqlQuery = `
            /* Unpack include and exclude card lists into table rows */
            WITH include_cards(card_id) AS ( 
                SELECT unnest($1::text[])
            ),
            exclude_cards(card_id) AS (
                SELECT unnest($2::text[])
            ),

            /* Decks containing all included cards (if include is empty, take all decks) */
            matching_decks AS (
                SELECT d.id AS deck_id
                FROM decks d
                WHERE (SELECT COUNT(*) FROM include_cards) = 0
                UNION
                SELECT dc.deck_id
                FROM deck_cards dc
                JOIN include_cards ic ON ic.card_id = dc.card_id
                GROUP BY dc.deck_id
                HAVING COUNT(DISTINCT ic.card_id) = (SELECT COUNT(*) FROM include_cards)
            ),

            /* Decks containing none of the excluded cards */
            filtered_decks AS (
                SELECT d.id
                FROM decks d
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM deck_cards dc
                    JOIN exclude_cards ec ON ec.card_id = dc.card_id
                    WHERE dc.deck_id = d.id
                )
            )

            SELECT 
                d.id AS deck_id,
                d.moxfield_id,
                d.archetype,
                p.name AS player_name,
                e.name AS event_name,
                e.date AS event_date,
                d.placement AS raw_placement,
                (d.placement::float / e.num_players::float) AS normalised_placement,
                e.num_players AS max_players
            FROM matching_decks md
            JOIN filtered_decks fd ON fd.id = md.deck_id
            JOIN decks d ON d.id = md.deck_id
            JOIN events e ON e.id = d.event_id
            JOIN players p ON p.id = d.player_id
            WHERE e.num_players > 16
            ORDER BY e.date DESC, e.name DESC, d.placement ASC
        `;

        const { rows } = await query(sqlQuery, [includeCards, excludeCards]);
        return rows;
    } catch (err) {
        console.error("Database error in getDecksWithCardFilter:", err);
        throw new Error("Failed to fetch filtered decks");
    }
}

/**
 * Get deck results for statistical calculations
 * @param {Date} startDate - Start date for filtering
 * @param {Date} endDate - End date for filtering
 * @returns {Promise<Object[]>} Array of deck objects with card compositions
 */
export async function getDeckResultsForStats(startDate, endDate) {
    const formatDate = (date) => date.toISOString().split("T")[0];

    try {
        const { rows } = await query(
            `SELECT 
                d.id as deck_id,
                d.placement::float / e.num_players::float as normalised_placement,
                e.num_players as max_players,
                e.date as event_date,
                ARRAY_AGG(dc.card_id) as cards_in_deck
            FROM decks d
            JOIN events e ON d.event_id = e.id
            JOIN deck_cards dc ON d.id = dc.deck_id
            WHERE e.date >= $1 AND e.date <= $2
            AND e.num_players > 16
            GROUP BY d.id, d.placement, e.num_players, e.date`,
            [formatDate(startDate), formatDate(endDate)]
        );

        return rows;
    } catch (err) {
        console.error("Database error in getDeckResultsForStats:", err);
        throw new Error("Failed to fetch deck results for statistics");
    }
}

/**
 * Get the logical inverse of decks (all decks minus those that match the filter)
 * @param {string[]} includeCards - Cards that must be included
 * @param {string[]} excludeCards - Cards that must be excluded
 * @returns {Promise<Object[]>} Array of deck objects that don't match the filter
 */
export async function getDecksLogicalInverse(includeCards, excludeCards) {
    try {
        // A = decks that satisfy include ∧ no excludes
        const matchingDecks = await getDecksWithCardFilter(
            includeCards,
            excludeCards
        );

        // U = all decks (get by passing empty filters)
        const allDecks = await getDecksWithCardFilter([], []);

        // U \ A = logical complement
        const matchingIds = new Set(matchingDecks.map((d) => d.deck_id));
        const inverse = allDecks.filter((d) => !matchingIds.has(d.deck_id));

        return inverse;
    } catch (err) {
        console.error("Database error in getDecksLogicalInverse:", err);
        throw new Error("Failed to fetch logical inverse of decks");
    }
}
