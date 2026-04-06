import { NextResponse } from "next/server";
import { searchDecks } from "@/lib/services/search-service.js";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const { includes, excludes } = await req.json();

        if (!Array.isArray(includes) || !Array.isArray(excludes)) {
            return NextResponse.json(
                { error: "includes and excludes must be arrays" },
                { status: 400 }
            );
        }

        if (includes.length + excludes.length > 20) {
            return NextResponse.json(
                { error: "Too many cards (max 20 total)" },
                { status: 400 }
            );
        }

        const result = await searchDecks(includes, excludes);

return NextResponse.json({
            includes: result.includes,
            excludes: result.excludes,
            hasResults: result.includes?.length > 0,
        });
    } catch (error) {
        if (error.message === "CARDS_NOT_FOUND") {
            return NextResponse.json(
                {
                    error: "Some cards were not found in the database",
                    missingIncludes: error.missingIncludes,
                    missingExcludes: error.missingExcludes,
                    hasResults: false,
                },
                { status: 404 }
            );
        }

        console.error("Search API error:", error);
        return NextResponse.json(
            { error: "Failed to perform search" },
            { status: 500 }
        );
    }
}
