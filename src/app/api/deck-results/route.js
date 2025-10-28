/**
 * DEPRECATED: This API route is no longer needed for homepage leaderboards.
 * Homepage now uses server-side rendering (see leaderboard-server.js).
 * This route may still be used by other features - check before removing.
 */

import { NextResponse } from "next/server";
import { query } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "Both start_date and end_date are required" },
                { status: 400 }
            );
        }

        // Get all deck results for StatBox-style calculations
        const sqlQuery = `
            SELECT 
                d.id AS deck_id,
                d.placement::float / e.num_players::float AS normalised_placement,
                e.date AS event_date,
                e.name AS event_name,
                e.num_players AS max_players,
                d.archetype,
                ARRAY_AGG(dc.card_id) as cards_in_deck
            FROM decks d
            JOIN events e ON e.id = d.event_id
            JOIN deck_cards dc ON dc.deck_id = d.id
            WHERE e.date >= $1 
                AND e.date <= $2
                AND e.num_players > 16
            GROUP BY d.id, d.placement, e.num_players, e.date, e.name, d.archetype
            ORDER BY e.date DESC;
        `;

        const { rows } = await query(sqlQuery, [startDate, endDate]);

        const response = {
            success: true,
            metadata: {
                date_range: {
                    start: startDate,
                    end: endDate,
                },
                total_decks: rows.length,
                generated_at: new Date().toISOString(),
            },
            decks: rows.map((row) => ({
                deck_id: row.deck_id,
                normalised_placement: row.normalised_placement,
                event_date: row.event_date,
                event_name: row.event_name,
                max_players: row.max_players,
                archetype: row.archetype,
                cards_in_deck: row.cards_in_deck,
            })),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Deck results API error:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch deck results",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
