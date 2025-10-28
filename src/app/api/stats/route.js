import { NextResponse } from "next/server";
import { getPointsData } from "@/lib/services";

export const runtime = "nodejs";

export async function GET() {
    try {
        const pointsInfo = await getPointsData();

        return NextResponse.json({
            success: true,
            lastChanged: pointsInfo.lastChanged,
            commitMessage: pointsInfo.commitMessage,
            commitUrl: pointsInfo.commitUrl,
            cards: pointsInfo.cards, // Include parsed cards list
            totalCards: pointsInfo.cards?.length || 0,
        });
    } catch (error) {
        console.error("Stats API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats", details: error.message },
            { status: 500 }
        );
    }
}
