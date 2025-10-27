import { NextResponse } from "next/server";
import { calcCardArrayDelta } from "@/lib/calcs";
import { getPoints } from "@/lib/api_helpers";

export const runtime = "nodejs";

export async function POST(req) {
    try {
        const { includes, excludes, dateRanges } = await req.json();

        if (!includes || !excludes || !dateRanges) {
            return NextResponse.json(
                { error: "Missing required data" },
                { status: 400 }
            );
        }

        const { earliest, latest, block2date, block3date, startDate, endDate } =
            dateRanges;

        // Calculate all the stats blocks
        const block1stats = await calcCardArrayDelta(
            includes,
            excludes,
            new Date(earliest),
            new Date(latest)
        );

        const block2stats = await calcCardArrayDelta(
            includes,
            excludes,
            new Date(block2date),
            new Date()
        );

        let block3stats;
        try {
            const pointsInfo = await getPoints();
            block3stats = await calcCardArrayDelta(
                includes,
                excludes,
                new Date(pointsInfo.lastChanged),
                new Date()
            );
        } catch (error) {
            console.warn(
                "Failed to get points info, using fallback date:",
                error.message
            );
            // Fallback to 30 days ago if getPoints fails
            const fallbackDate = new Date();
            fallbackDate.setDate(fallbackDate.getDate() - 30);
            block3stats = await calcCardArrayDelta(
                includes,
                excludes,
                fallbackDate,
                new Date()
            );
        }

        const block4stats = await calcCardArrayDelta(
            includes,
            excludes,
            new Date(startDate),
            new Date(endDate)
        );

        return NextResponse.json({
            block1stats,
            block2stats,
            block3stats,
            block4stats,
        });
    } catch (error) {
        console.error("Stats API error:", error);
        return NextResponse.json(
            { error: "Failed to calculate stats" },
            { status: 500 }
        );
    }
}
