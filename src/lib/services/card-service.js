/**
 * Card service
 * Business logic for card lookups and deck data retrieval by card
 */

import {
    getCardIdByName,
    getDecksWithCardFilter,
    getDecksLogicalInverse,
} from "@/lib/database/index.js";

/**
 * Look up a card's scryfall ID by name
 * @param {string} name - Card name (exact match)
 * @returns {Promise<{card_id: string|null}>}
 */
export async function getCardByName(name) {
    return getCardIdByName(name);
}

/**
 * Fetch the include and exclude deck lists for a single card
 * @param {string} cardId - Scryfall ID of the card
 * @returns {Promise<{includes: Object[], excludes: Object[]}>}
 */
export async function getCardDecks(cardId) {
    const [includes, excludes] = await Promise.all([
        getDecksWithCardFilter([cardId], []),
        getDecksLogicalInverse([cardId], []),
    ]);
    return { includes, excludes };
}
