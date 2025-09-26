import { NextResponse } from "next/server";
import { getCardIDByName } from "@/lib/api_helpers";

export const runtime = "nodejs";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const name = (searchParams.get("name") || "").trim();
    if (!name) return NextResponse.json({ card_id: null });
}
