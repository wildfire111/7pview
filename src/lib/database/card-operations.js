/**
 * Card-related database operations
 * Handles all database interactions for card entities
 */

import { query } from "./db.js";

/**
 * Get card's scryfall ID by name
 * @param {string} name - Card name to search for
 * @returns {Promise<{card_id: string|null}>} Card ID object or null if not found
 */
export async function getCardIdByName(name) {
    try {
        const { rows } = await query(
            "SELECT scryfall_id FROM cards WHERE name = $1 LIMIT 1",
            [name]
        );
        const cardId = rows[0]?.scryfall_id ?? null;
        return { card_id: cardId };
    } catch (err) {
        console.error("Database error in getCardIdByName:", err);
        throw new Error(`Failed to fetch card ID for: ${name}`);
    }
}

/**
 * Get scryfall IDs for multiple card names in a single query
 * @param {string[]} names - Card names to look up
 * @returns {Promise<Map<string, string>>} Map of card name to scryfall_id
 */
export async function getCardIdsByNames(names) {
    if (!names?.length) return new Map();
    try {
        const { rows } = await query(
            "SELECT name, scryfall_id FROM cards WHERE name = ANY($1)",
            [names]
        );
        return new Map(rows.map((r) => [r.name, r.scryfall_id]));
    } catch (err) {
        console.error("Database error in getCardIdsByNames:", err);
        throw new Error("Failed to fetch card IDs");
    }
}

/**
 * Get all decks containing a specific card
 * @param {string} cardId - Scryfall ID of the card
 * @returns {Promise<string[]>} Array of deck IDs
 */
export async function getDecksContainingCard(cardId) {
    try {
        const { rows } = await query(
            `SELECT d.id AS deck_id
            FROM decks d
            JOIN deck_cards dc ON d.id = dc.deck_id
            WHERE dc.card_id = $1`,
            [cardId]
        );
        return rows.map((row) => row.deck_id);
    } catch (err) {
        console.error("Database error in getDecksContainingCard:", err);
        throw new Error(`Failed to fetch decks for card: ${cardId}`);
    }
}
