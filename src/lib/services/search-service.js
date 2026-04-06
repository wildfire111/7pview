/**
 * Search service
 * Business logic for search functionality and deck filtering
 */

import {
    getCardIdsByNames,
    getDecksWithCardFilter,
    getDecksLogicalInverse,
} from "@/lib/database/index.js";

/**
 * Search for decks based on include/exclude card criteria.
 * Throws a structured error (message "CARDS_NOT_FOUND") if any card names
 * cannot be resolved — callers should catch this and surface it as a 404.
 *
 * @param {string[]} includeCardNames - Card names that must be included
 * @param {string[]} excludeCardNames - Card names that must be excluded
 * @returns {Promise<{includes: Object[], excludes: Object[]}>} Matching and inverse decks
 */
export async function searchDecks(
    includeCardNames = [],
    excludeCardNames = []
) {
    // Resolve all names in a single batch query
    const nameMap = await getCardIdsByNames([...includeCardNames, ...excludeCardNames]);

    const missingIncludes = includeCardNames.filter((n) => !nameMap.has(n));
    const missingExcludes = excludeCardNames.filter((n) => !nameMap.has(n));

    if (missingIncludes.length > 0 || missingExcludes.length > 0) {
        const err = new Error("CARDS_NOT_FOUND");
        err.missingIncludes = missingIncludes;
        err.missingExcludes = missingExcludes;
        throw err;
    }

    const includeIds = includeCardNames.map((n) => nameMap.get(n));
    const excludeIds = excludeCardNames.map((n) => nameMap.get(n));

    const [includes, excludes] = await Promise.all([
        getDecksWithCardFilter(includeIds, excludeIds),
        getDecksLogicalInverse(includeIds, excludeIds),
    ]);

    return { includes, excludes };
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

    const nameMap = await getCardIdsByNames(cardNames);

    const valid = [];
    const invalid = [];

    for (const name of cardNames) {
        const id = nameMap.get(name);
        if (id) {
            valid.push({ name, found: true, id });
        } else {
            invalid.push(name);
        }
    }

    return { valid, invalid };
}
