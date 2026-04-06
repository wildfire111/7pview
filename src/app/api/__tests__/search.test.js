import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/services/search-service.js", () => ({
    searchDecks: vi.fn(),
}));

import { POST } from "../search/route.js";
import { searchDecks } from "@/lib/services/search-service.js";

beforeEach(() => vi.clearAllMocks());

const makeRequest = (body) =>
    new Request("http://localhost/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

const mockDeck = { deck_id: 1, archetype: "Aggro", normalised_placement: 0.1 };

// ---------------------------------------------------------------------------
// Input validation (400)
// ---------------------------------------------------------------------------

describe("POST /api/search — input validation", () => {
    it("returns 400 when includes is not an array", async () => {
        const res = await POST(makeRequest({ includes: "Sol Ring", excludes: [] }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("includes and excludes must be arrays");
    });

    it("returns 400 when excludes is not an array", async () => {
        const res = await POST(makeRequest({ includes: [], excludes: "Black Lotus" }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("includes and excludes must be arrays");
    });

    it("returns 400 when total cards exceed 20", async () => {
        const cards = Array.from({ length: 21 }, (_, i) => `Card ${i}`);
        const res = await POST(makeRequest({ includes: cards, excludes: [] }));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("Too many cards (max 20 total)");
    });

    it("returns 400 when combined includes and excludes exceed 20", async () => {
        const inc = Array.from({ length: 11 }, (_, i) => `Inc ${i}`);
        const exc = Array.from({ length: 10 }, (_, i) => `Exc ${i}`);
        const res = await POST(makeRequest({ includes: inc, excludes: exc }));
        expect(res.status).toBe(400);
    });
});

// ---------------------------------------------------------------------------
// Missing card (404)
// ---------------------------------------------------------------------------

describe("POST /api/search — missing cards (404)", () => {
    it("returns 404 when the service throws CARDS_NOT_FOUND for an include", async () => {
        const err = new Error("CARDS_NOT_FOUND");
        err.missingIncludes = ["Sol Ring"];
        err.missingExcludes = [];
        searchDecks.mockRejectedValue(err);

        const res = await POST(makeRequest({ includes: ["Sol Ring"], excludes: [] }));
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.missingIncludes).toContain("Sol Ring");
        expect(body.missingExcludes).toEqual([]);
        expect(body.hasResults).toBe(false);
    });

    it("returns 404 when the service throws CARDS_NOT_FOUND for an exclude", async () => {
        const err = new Error("CARDS_NOT_FOUND");
        err.missingIncludes = [];
        err.missingExcludes = ["Ghost Card"];
        searchDecks.mockRejectedValue(err);

        const res = await POST(makeRequest({ includes: [], excludes: ["Ghost Card"] }));
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.missingExcludes).toContain("Ghost Card");
    });
});

// ---------------------------------------------------------------------------
// Success (200)
// ---------------------------------------------------------------------------

describe("POST /api/search — success", () => {
    it("returns 200 with includes, excludes, and hasResults when all cards are found", async () => {
        searchDecks.mockResolvedValue({
            includes: [mockDeck],
            excludes: [{ deck_id: 2 }],
        });

        const res = await POST(makeRequest({ includes: ["Sol Ring"], excludes: [] }));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.includes).toHaveLength(1);
        expect(body.excludes).toHaveLength(1);
        expect(body.hasResults).toBe(true);
    });

    it("hasResults is false when includes is empty", async () => {
        searchDecks.mockResolvedValue({ includes: [], excludes: [] });

        const res = await POST(makeRequest({ includes: ["Sol Ring"], excludes: [] }));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.hasResults).toBe(false);
    });

    it("passes includes and excludes arrays to the service", async () => {
        searchDecks.mockResolvedValue({ includes: [], excludes: [] });

        await POST(makeRequest({ includes: ["Sol Ring"], excludes: ["Black Lotus"] }));

        expect(searchDecks).toHaveBeenCalledWith(["Sol Ring"], ["Black Lotus"]);
    });

    it("returns 200 for empty includes and excludes", async () => {
        searchDecks.mockResolvedValue({ includes: [], excludes: [] });

        const res = await POST(makeRequest({ includes: [], excludes: [] }));
        expect(res.status).toBe(200);
    });
});

// ---------------------------------------------------------------------------
// DB / unexpected errors (500)
// ---------------------------------------------------------------------------

describe("POST /api/search — server error", () => {
    it("returns 500 when the service throws an unexpected error", async () => {
        searchDecks.mockRejectedValue(new Error("DB down"));

        const res = await POST(makeRequest({ includes: ["Sol Ring"], excludes: [] }));
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Failed to perform search");
    });
});
