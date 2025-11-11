import { NextResponse } from "next/server";
import { query } from "@/lib/database";

export const runtime = "nodejs";

/**
 * GET /api/events
 * Returns all events in the database
 */
export async function GET() {
    try {
        const { rows } = await query(
            `SELECT 
                id,
                name,
                date,
                num_players
            FROM events 
            ORDER BY date DESC, name ASC`
        );

        return NextResponse.json({
            events: rows,
            count: rows.length,
        });
    } catch (error) {
        console.error("Events API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}
