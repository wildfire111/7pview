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

        // Get card IDs for includes
        const includesIDs = await Promise.all(
            includes.map(async (cardName) => {
                try {
                    const result = await getCardIdByName(cardName);
                    return result.card_id;
                } catch (error) {
                    // Skip invalid card names
                    return null;
                }
            })
        );

        // Get card IDs for excludes
        const excludesIDs = await Promise.all(
            excludes.map(async (cardName) => {
                try {
                    const result = await getCardIdByName(cardName);
                    return result.card_id;
                } catch (error) {
                    // Skip invalid card names
                    return null;
                }
            })
        );

        // Filter out null values from failed sanitisation
        const validIncludesIDs = includesIDs.filter((id) => id !== null);
        const validExcludesIDs = excludesIDs.filter((id) => id !== null);

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
