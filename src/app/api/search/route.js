import { NextResponse } from "next/server";
import {
    getCardIdByName,
    getDecksContainingCard,
    getDeckDetails,
    getDecksWithCardFilter,
    getDecksIncludingExcluding,
    getDecksLogicalInverse,
} from "@/lib/database";
import { searchDecks } from "@/lib/services";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const { includes, excludes } = await req.json();

        if (!includes || !excludes) {
            return NextResponse.json(
                { error: "Missing includes or excludes arrays" },
                { status: 400 }
            );
        }

        // Get card IDs for includes and track missing cards
        const includesResults = await Promise.all(
            includes.map(async (cardName) => {
                try {
                    const result = await getCardIdByName(cardName);
                    const found = result.card_id !== null;
                    return { cardName, cardId: result.card_id, found };
                } catch (error) {
                    return { cardName, cardId: null, found: false };
                }
            })
        );

        // Get card IDs for excludes and track missing cards
        const excludesResults = await Promise.all(
            excludes.map(async (cardName) => {
                try {
                    const result = await getCardIdByName(cardName);
                    const found = result.card_id !== null;
                    return { cardName, cardId: result.card_id, found };
                } catch (error) {
                    return { cardName, cardId: null, found: false };
                }
            })
        );

        // Separate found and missing cards
        const validIncludesIDs = includesResults
            .filter((r) => r.found)
            .map((r) => r.cardId);
        const validExcludesIDs = excludesResults
            .filter((r) => r.found)
            .map((r) => r.cardId);
        const missingIncludes = includesResults
            .filter((r) => !r.found)
            .map((r) => r.cardName);
        const missingExcludes = excludesResults
            .filter((r) => !r.found)
            .map((r) => r.cardName);

        // If any cards are missing, return error with details
        if (missingIncludes.length > 0 || missingExcludes.length > 0) {
            return NextResponse.json(
                {
                    error: "Some cards were not found in the database",
                    missingIncludes,
                    missingExcludes,
                    hasResults: false,
                },
                { status: 404 }
            );
        }

        // Fetch deck data
        const incExcRows = await getDecksIncludingExcluding(
            validIncludesIDs,
            validExcludesIDs
        );
        const invRows = await getDecksLogicalInverse(
            validIncludesIDs,
            validExcludesIDs
        );

        return NextResponse.json({
            includes: incExcRows,
            excludes: invRows,
            hasResults: incExcRows?.length > 0,
        });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            { error: "Failed to perform search" },
            { status: 500 }
        );
    }
}
