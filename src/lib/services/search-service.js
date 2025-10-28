/**
 * Search service
 * Business logic for search functionality and deck filtering
 */

import {
    getCardIdByName,
    getDecksWithCardFilter,
} from "@/lib/database/index.js";

/**
 * Search for decks based on include/exclude card criteria
 * @param {string[]} includeCardNames - Card names that must be included
 * @param {string[]} excludeCardNames - Card names that must be excluded
 * @returns {Promise<Object>} Search results with deck data
 */
export async function searchDecks(
    includeCardNames = [],
    excludeCardNames = []
) {
    try {
        // Resolve card names to IDs in parallel
        const [includeIds, excludeIds] = await Promise.all([
            resolveCardNames(includeCardNames),
            resolveCardNames(excludeCardNames),
        ]);

        // Fetch decks matching criteria
        const decks = await getDecksWithCardFilter(includeIds, excludeIds);

        // Get logical inverse (decks without the included cards)
        const inverseDecks =
            excludeIds.length > 0
                ? await getDecksWithCardFilter([], includeIds)
                : await getDecksWithCardFilter([], []);

        return {
            includes: decks,
            excludes: inverseDecks.filter(
                (deck) => !decks.some((d) => d.deck_id === deck.deck_id)
            ),
            metadata: {
                include_cards: includeCardNames,
                exclude_cards: excludeCardNames,
                total_include_decks: decks.length,
                search_timestamp: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error("Search service error:", error);
        throw new Error(`Search failed: ${error.message}`);
    }
}

/**
 * Resolve array of card names to Scryfall IDs
 * @param {string[]} cardNames - Array of card names to resolve
 * @returns {Promise<string[]>} Array of resolved Scryfall IDs
 */
async function resolveCardNames(cardNames) {
    if (!cardNames?.length) return [];

    const results = await Promise.allSettled(
        cardNames.map((name) => getCardIdByName(name))
    );

    return results
        .filter(
            (result) => result.status === "fulfilled" && result.value.card_id
        )
        .map((result) => result.value.card_id);
}

/**
 * Validate card names against database
 * @param {string[]} cardNames - Card names to validate
 * @returns {Promise<Object>} Validation results with found/missing cards
 */
export async function validateCardNames(cardNames) {
    if (!cardNames?.length) {
        return { valid: [], invalid: [] };
    }

    const results = await Promise.allSettled(
        cardNames.map(async (name) => {
            const result = await getCardIdByName(name);
            return { name, found: !!result.card_id, id: result.card_id };
        })
    );

    const valid = [];
    const invalid = [];

    results.forEach((result) => {
        if (result.status === "fulfilled") {
            if (result.value.found) {
                valid.push(result.value);
            } else {
                invalid.push(result.value.name);
            }
        } else {
            invalid.push("Unknown card");
        }
    });

    return { valid, invalid };
}
