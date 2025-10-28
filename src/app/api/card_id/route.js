import { NextResponse } from "next/server";
import { getCardIdByName } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const name = (searchParams.get("name") || "").trim();
    if (!name) return NextResponse.json({ card_id: null });
    try {
        const cardID = await getCardIdByName(name);
        return NextResponse.json(cardID);
    } catch (err) {
        console.error("Error fetching card ID:", err);
        return NextResponse.json(
            { error: "Failed to fetch card ID" },
            { status: 500 }
        );
    }
}
