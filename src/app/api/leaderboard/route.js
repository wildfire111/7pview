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
        const cardIds = searchParams.get("card_ids"); // Optional filter for specific cards

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "Both start_date and end_date are required" },
                { status: 400 }
            );
        }

        // Get minimum appearances threshold (optional query param, defaults to 3)
        const minAppearances = parseInt(
            searchParams.get("min_appearances") || "3"
        );

        // Parse card IDs filter if provided
        const cardIdFilter = cardIds
            ? cardIds.split(",").map((id) => id.trim())
            : null;

        // Build dynamic SQL query with optional card filter
        let sqlQuery;
        let queryParams = [startDate, endDate];

        if (cardIdFilter && cardIdFilter.length > 0) {
            // Query with card filter
            sqlQuery = `
                WITH event_placements AS (
                    SELECT 
                        c.scryfall_id,
                        c.name AS card_name,
                        d.placement::float / e.num_players::float AS normalised_placement,
                        e.date AS event_date,
                        e.name AS event_name,
                        e.num_players,
                        d.archetype,
                        p.name AS player_name,
                        d.id AS deck_id
                    FROM deck_cards dc
                    JOIN cards c ON c.scryfall_id = dc.card_id
                    JOIN decks d ON d.id = dc.deck_id
                    JOIN events e ON e.id = d.event_id
                    JOIN players p ON p.id = d.player_id
                    WHERE e.date >= $1 
                        AND e.date <= $2
                        AND e.num_players > 16
                        AND c.scryfall_id = ANY($3::text[])
                    ORDER BY c.scryfall_id, e.date DESC
                ),
                card_aggregates AS (
                    SELECT 
                        scryfall_id,
                        card_name,
                        COUNT(*) as total_appearances,
                        -- Return all normalized placements as an array for CI calculation
                        ARRAY_AGG(normalised_placement ORDER BY event_date DESC) as all_normalised_placements,
                        -- Basic stats for quick reference
                        AVG(normalised_placement) as mean_normalised_placement,
                        MIN(normalised_placement) as best_normalised_placement,
                        MAX(normalised_placement) as worst_normalised_placement,
                        -- Event details for tooltip/detailed view (limited to save space)
                        ARRAY_AGG(
                            json_build_object(
                                'event_name', event_name,
                                'event_date', event_date,
                                'num_players', num_players,
                                'normalised_placement', normalised_placement,
                                'archetype', archetype,
                                'player_name', player_name,
                                'deck_id', deck_id
                            ) 
                            ORDER BY event_date DESC
                        ) as placement_details
                    FROM event_placements
                    GROUP BY scryfall_id, card_name
                    HAVING COUNT(*) >= $4
                )
                SELECT 
                    scryfall_id,
                    card_name,
                    total_appearances,
                    all_normalised_placements,
                    mean_normalised_placement,
                    best_normalised_placement,
                    worst_normalised_placement,
                    placement_details
                FROM card_aggregates
                ORDER BY mean_normalised_placement ASC, total_appearances DESC;
            `;
            queryParams = [startDate, endDate, cardIdFilter, minAppearances];
        } else {
            // Original query without card filter
            sqlQuery = `
                WITH event_placements AS (
                    SELECT 
                        c.scryfall_id,
                        c.name AS card_name,
                        d.placement::float / e.num_players::float AS normalised_placement,
                        e.date AS event_date,
                        e.name AS event_name,
                        e.num_players,
                        d.archetype,
                        p.name AS player_name,
                        d.id AS deck_id
                    FROM deck_cards dc
                    JOIN cards c ON c.scryfall_id = dc.card_id
                    JOIN decks d ON d.id = dc.deck_id
                    JOIN events e ON e.id = d.event_id
                    JOIN players p ON p.id = d.player_id
                    WHERE e.date >= $1 
                        AND e.date <= $2
                        AND e.num_players > 16
                    ORDER BY c.scryfall_id, e.date DESC
                ),
                card_aggregates AS (
                    SELECT 
                        scryfall_id,
                        card_name,
                        COUNT(*) as total_appearances,
                        -- Return all normalized placements as an array for CI calculation
                        ARRAY_AGG(normalised_placement ORDER BY event_date DESC) as all_normalised_placements,
                        -- Basic stats for quick reference
                        AVG(normalised_placement) as mean_normalised_placement,
                        MIN(normalised_placement) as best_normalised_placement,
                        MAX(normalised_placement) as worst_normalised_placement,
                        -- Event details for tooltip/detailed view (limited to save space)
                        ARRAY_AGG(
                            json_build_object(
                                'event_name', event_name,
                                'event_date', event_date,
                                'num_players', num_players,
                                'normalised_placement', normalised_placement,
                                'archetype', archetype,
                                'player_name', player_name,
                                'deck_id', deck_id
                            ) 
                            ORDER BY event_date DESC
                        ) as placement_details
                    FROM event_placements
                    GROUP BY scryfall_id, card_name
                    HAVING COUNT(*) >= $3
                )
                SELECT 
                    scryfall_id,
                    card_name,
                    total_appearances,
                    all_normalised_placements,
                    mean_normalised_placement,
                    best_normalised_placement,
                    worst_normalised_placement,
                    placement_details
                FROM card_aggregates
                ORDER BY mean_normalised_placement ASC, total_appearances DESC;
            `;
            queryParams = [startDate, endDate, minAppearances];
        }

        const { rows } = await query(sqlQuery, queryParams);

        // Return card performance data - client will calculate StatBox-style deltas
        const response = {
            success: true,
            metadata: {
                date_range: {
                    start: startDate,
                    end: endDate,
                },
                total_cards: rows.length,
                min_appearances: minAppearances,
                generated_at: new Date().toISOString(),
            },
            cards: rows.map((row) => ({
                scryfall_id: row.scryfall_id,
                card_name: row.card_name,
                total_appearances: row.total_appearances,
                // All normalized placements for CI calculation
                all_normalised_placements: row.all_normalised_placements,
                // Quick stats
                stats: {
                    mean: parseFloat(
                        row.mean_normalised_placement?.toFixed(4) || 0
                    ),
                    best: parseFloat(
                        row.best_normalised_placement?.toFixed(4) || 0
                    ),
                    worst: parseFloat(
                        row.worst_normalised_placement?.toFixed(4) || 0
                    ),
                },
                // Sample event details (limited to save space)
                placement_details: (row.placement_details || []).slice(0, 5),
            })),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Leaderboard API error:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch leaderboard data",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
