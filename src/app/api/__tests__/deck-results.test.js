import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database", () => ({
    query: vi.fn(),
}));

import { GET } from "../deck-results/route.js";
import * as db from "@/lib/database";

beforeEach(() => vi.clearAllMocks());

const makeRequest = (params = {}) => {
    const url = new URL("http://localhost/api/deck-results");
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return new Request(url.toString());
};

const mockDeckRow = {
    deck_id: 1,
    normalised_placement: 0.25,
    event_date: "2024-06-01",
    event_name: "GP London",
    max_players: 128,
    archetype: "Aggro",
    cards_in_deck: ["id-1", "id-2"],
};

describe("GET /api/deck-results", () => {
    it("returns 400 when start_date is missing", async () => {
        const res = await GET(makeRequest({ end_date: "2024-12-31" }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toMatch(/start_date/);
    });

    it("returns 400 when end_date is missing", async () => {
        const res = await GET(makeRequest({ start_date: "2024-01-01" }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toMatch(/end_date/);
    });

    it("returns 400 when both params are missing", async () => {
        const res = await GET(makeRequest());
        expect(res.status).toBe(400);
    });

    it("returns 200 with correct shape when both params are provided", async () => {
        db.query.mockResolvedValue({ rows: [mockDeckRow] });

        const res = await GET(makeRequest({ start_date: "2024-01-01", end_date: "2024-12-31" }));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.metadata.date_range.start).toBe("2024-01-01");
        expect(body.metadata.date_range.end).toBe("2024-12-31");
        expect(body.metadata.total_decks).toBe(1);
        expect(body.decks).toHaveLength(1);
    });

    it("deck objects include required fields", async () => {
        db.query.mockResolvedValue({ rows: [mockDeckRow] });

        const res = await GET(makeRequest({ start_date: "2024-01-01", end_date: "2024-12-31" }));
        const body = await res.json();
        const deck = body.decks[0];

        expect(deck).toHaveProperty("deck_id");
        expect(deck).toHaveProperty("normalised_placement");
        expect(deck).toHaveProperty("event_date");
        expect(deck).toHaveProperty("event_name");
        expect(deck).toHaveProperty("max_players");
        expect(deck).toHaveProperty("archetype");
        expect(deck).toHaveProperty("cards_in_deck");
    });

    it("returns empty decks array when DB returns no rows", async () => {
        db.query.mockResolvedValue({ rows: [] });

        const res = await GET(makeRequest({ start_date: "2024-01-01", end_date: "2024-12-31" }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.decks).toEqual([]);
        expect(body.metadata.total_decks).toBe(0);
    });

    it("returns 500 when DB throws", async () => {
        db.query.mockRejectedValue(new Error("query failed"));

        const res = await GET(makeRequest({ start_date: "2024-01-01", end_date: "2024-12-31" }));
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Failed to fetch deck results");
        expect(body.details).toBe("query failed");
    });
});
