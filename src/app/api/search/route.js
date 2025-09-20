import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) return NextResponse.json({ results: [] });

  // pretend work
  const results = [{ id: "1", title: `You searched for "${q}"` },
                    { id: "2", title: `Result 2 for "${q}"` }
  ];

  return NextResponse.json({ q, results });
}
