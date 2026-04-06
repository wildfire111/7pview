/**
 * Integration test for POST /api/search
 *
 * Unlike search.test.js (which mocks the service layer), this test mocks only
 * the low-level `query` function from db.js. The real route handler,
 * search-service.js, card-operations.js, and deck-operations.js all execute,
 * so the full request → service → DB-ops → SQL chain is exercised.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database/db.js", () => ({ query: vi.fn() }));

import { POST } from "../search/route.js";
import * as db from "@/lib/database/db.js";

beforeEach(() => vi.clearAllMocks());

const makeRequest = (body) =>
    new Request("http://localhost/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

const makeDeckRow = (id) => ({
    deck_id: id,
    moxfield_id: `mox-${id}`,
    archetype: "Aggro",
    player_name: "Alice",
    event_name: "Test Event",
    event_date: "2024-06-01",
    raw_placement: 1,
    normalised_placement: 0.03,
    max_players: 32,
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe("search integration — happy path", () => {
    it("resolves card names, calls deck filter, and returns results", async () => {
        // Call 1: getCardIdsByNames → resolve "Sol Ring"
        db.query.mockResolvedValueOnce({
            rows: [{ name: "Sol Ring", scryfall_id: "id-sol-ring" }],
        });
        // Call 2: getDecksWithCardFilter(includeIds, excludeIds) → includes result
        db.query.mockResolvedValueOnce({ rows: [makeDeckRow(1), makeDeckRow(2)] });
        // Call 3: getDecksWithCardFilter(includeIds, excludeIds) → matching set inside logicalInverse
        db.query.mockResolvedValueOnce({ rows: [makeDeckRow(1), makeDeckRow(2)] });
        // Call 4: getDecksWithCardFilter([], []) → all decks inside logicalInverse
        db.query.mockResolvedValueOnce({ rows: [makeDeckRow(1), makeDeckRow(2), makeDeckRow(3)] });

        const res = await POST(makeRequest({ includes: ["Sol Ring"], excludes: [] }));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.hasResults).toBe(true);
        expect(body.includes).toHaveLength(2);
        expect(body.excludes).toHaveLength(1);
    });

    it("passes card IDs (not names) to the deck filter query", async () => {
        db.query.mockResolvedValueOnce({
            rows: [{ name: "Black Lotus", scryfall_id: "id-black-lotus" }],
        });
        db.query.mockResolvedValue({ rows: [] });

        await POST(makeRequest({ includes: ["Black Lotus"], excludes: [] }));

        // Second query call is getDecksWithCardFilter; params are [includeIds, excludeIds]
        const [, params] = db.query.mock.calls[1];
        expect(params).toEqual([["id-black-lotus"], []]);
    });
});

// ---------------------------------------------------------------------------
// Missing card
// ---------------------------------------------------------------------------

describe("search integration — missing card", () => {
    it("returns 404 with missingIncludes when a card is not in the DB", async () => {
        // getCardIdsByNames returns empty (no rows found)
        db.query.mockResolvedValueOnce({ rows: [] });

        const res = await POST(makeRequest({ includes: ["Fake Card"], excludes: [] }));
        expect(res.status).toBe(404);

        const body = await res.json();
        expect(body.missingIncludes).toContain("Fake Card");
    });

    it("returns 404 with missingExcludes when an exclude card is missing", async () => {
        db.query.mockResolvedValueOnce({ rows: [] });

        const res = await POST(makeRequest({ includes: [], excludes: ["Ghost Card"] }));
        expect(res.status).toBe(404);

        const body = await res.json();
        expect(body.missingExcludes).toContain("Ghost Card");
    });
});

// ---------------------------------------------------------------------------
// DB error propagation
// ---------------------------------------------------------------------------

describe("search integration — DB errors", () => {
    it("returns 500 when the DB query throws", async () => {
        db.query.mockRejectedValue(new Error("connection refused"));

        const res = await POST(makeRequest({ includes: ["Sol Ring"], excludes: [] }));
        expect(res.status).toBe(500);

        const body = await res.json();
        expect(body.error).toBeDefined();
    });
});

// ---------------------------------------------------------------------------
// Input validation (unchanged from unit layer, verified end-to-end)
// ---------------------------------------------------------------------------

describe("search integration — input validation", () => {
    it("returns 400 when includes is not an array", async () => {
        const res = await POST(makeRequest({ includes: "Sol Ring", excludes: [] }));
        expect(res.status).toBe(400);
    });

    it("returns 400 when total cards exceed 20", async () => {
        const cards = Array.from({ length: 21 }, (_, i) => `Card ${i}`);
        const res = await POST(makeRequest({ includes: cards, excludes: [] }));
        expect(res.status).toBe(400);
    });
});
