import { NextResponse } from "next/server";
import { query } from "@/lib/database";

export const runtime = "nodejs";

/**
 * GET /api/events/[eventId]/decks
 * Returns all decks from a specific event
 */
export async function GET(request, { params }) {
    const { eventId } = await params;

    try {
        // Validate eventId is provided
        if (!eventId) {
            return NextResponse.json(
                { error: "Event ID is required" },
                { status: 400 }
            );
        }

        // First, verify the event exists and get event details
        const { rows: eventRows } = await query(
            `SELECT id, name, date, num_players
            FROM events 
            WHERE id = $1`,
            [eventId]
        );

        if (eventRows.length === 0) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        const event = eventRows[0];

        // Get all decks for this event
        const { rows: deckRows } = await query(
            `SELECT 
                d.id AS deck_id,
                d.moxfield_id,
                d.archetype,
                d.placement,
                p.name AS player_name,
                p.id AS player_id
            FROM decks d
            JOIN players p ON d.player_id = p.id
            WHERE d.event_id = $1
            ORDER BY d.placement ASC`,
            [eventId]
        );

        return NextResponse.json({
            event: event,
            decks: deckRows,
            count: deckRows.length,
        });
    } catch (error) {
        console.error("Event decks API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch decks for event" },
            { status: 500 }
        );
    }
}
