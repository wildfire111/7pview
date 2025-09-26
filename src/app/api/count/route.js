import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const cardId = Number(searchParams.get("card_id"));
    const { rows } = await query(
        "SELECT COUNT(DISTINCT deck_id) AS deck_count FROM deck_cards WHERE card_id = $1",
        [cardId]
    );
    return NextResponse.json({
        card_id: cardId,
        deck_count: Number(rows[0]?.deck_count || 0),
    });
}
