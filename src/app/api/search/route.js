import { NextResponse } from "next/server";
import {
    getDecksIncludingExcluding,
    getDecksLogicalInverse,
    getCardIDByName,
} from "@/lib/api_helpers";

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
                const result = await getCardIDByName(cardName);
                return result.card_id;
            })
        );

        // Get card IDs for excludes
        const excludesIDs = await Promise.all(
            excludes.map(async (cardName) => {
                const result = await getCardIDByName(cardName);
                return result.card_id;
            })
        );

        // Fetch deck data
        const incExcRows = await getDecksIncludingExcluding(
            includesIDs,
            excludesIDs
        );
        const invRows = await getDecksLogicalInverse(includesIDs, excludesIDs);

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
