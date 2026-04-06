/**
 * Integration test for fetchLeaderboardData
 *
 * Unlike leaderboard-service.test.js (which mocks all of @/lib/database), this
 * test mocks only the low-level `query` from db.js. The real leaderboard-queries.js,
 * deck-operations.js, and all statistics functions execute, verifying that the
 * full service → DB-ops → statistics pipeline is wired correctly.
 *
 * points-service.js is mocked because it makes external GitHub API calls.
 */
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database/db.js", () => ({ query: vi.fn() }));

vi.mock("../points-service.js", () => ({
    getPointsData: vi.fn(),
}));

import { fetchLeaderboardData } from "../leaderboard-service.js";
import { getPointsData } from "../points-service.js";
import * as db from "@/lib/database/db.js";

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockPointsInfo = {
    lastChanged: "2024-01-01T00:00:00Z",
    cards: [{ scryfall_id: "id-1", name: "Sol Ring", points: 1 }],
};

// Build deck results where card "id-1" appears in `count` decks
const makeDeckResults = (cardId, count) =>
    Array.from({ length: count }, (_, i) => ({
        deck_id: i + 1,
        normalised_placement: 0.2 + i * 0.01,
        max_players: 32,
        event_date: `2024-0${(i % 9) + 1}-01`,
        cards_in_deck: [cardId],
    }));

// Build the rows that getLeaderboardCardData returns for one card
const makeCardRows = (cardId, count) => [
    {
        scryfall_id: cardId,
        card_name: "Sol Ring",
        total_appearances: count,
        avg_normalized_placement: 0.25,
        placement_details: Array.from({ length: Math.min(count, 5) }, (_, i) => ({
            event_name: `Event ${i}`,
            event_date: "2024-01-01",
            normalised_placement: 0.25,
            raw_placement: 8,
            num_players: 32,
        })),
    },
];

// Set up query mock: distinguish between leaderboard query (returns card rows)
// and deck results query (returns deck rows) based on SQL content.
function setupQueryMock(cardCount, deckCount) {
    db.query.mockImplementation((sql) => {
        if (sql.includes("cards_in_deck")) {
            return Promise.resolve({ rows: makeDeckResults("id-1", deckCount) });
        }
        return Promise.resolve({ rows: makeCardRows("id-1", cardCount) });
    });
}

// ---------------------------------------------------------------------------
// Result structure
// ---------------------------------------------------------------------------

describe("leaderboard integration — result structure", () => {
    it("returns allTime, lastYear, sinceUpdate periods", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        setupQueryMock(10, 10);

        const result = await fetchLeaderboardData();

        expect(result).toHaveProperty("allTime");
        expect(result).toHaveProperty("lastYear");
        expect(result).toHaveProperty("sinceUpdate");
    });

    it("each period contains the expected keys", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        setupQueryMock(10, 10);

        const result = await fetchLeaderboardData();

        for (const key of ["allTime", "lastYear", "sinceUpdate"]) {
            expect(result[key]).toMatchObject({
                period_name: expect.any(String),
                total_cards: expect.any(Number),
                top_cards: expect.any(Array),
                all_cards: expect.any(Array),
            });
        }
    });
});

// ---------------------------------------------------------------------------
// Real statistical processing
// ---------------------------------------------------------------------------

describe("leaderboard integration — statistics pipeline", () => {
    it("produces cards with rank, delta, CI, and conservative_score fields", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        setupQueryMock(10, 10);

        const result = await fetchLeaderboardData();

        if (result.allTime.all_cards.length > 0) {
            const card = result.allTime.all_cards[0];
            expect(card).toHaveProperty("rank");
            expect(card).toHaveProperty("delta");
            expect(card).toHaveProperty("CI");
            expect(card).toHaveProperty("conservative_score");
            expect(card).toHaveProperty("inc_count");
        }
    });

    it("filters out cards with 5 or fewer appearances in deck results", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        // leaderboard returns the card, but deck results only have 3 decks → inc_count = 3 ≤ 5
        setupQueryMock(3, 3);

        const result = await fetchLeaderboardData();
        expect(result.allTime.all_cards).toHaveLength(0);
    });

    it("includes cards with more than 5 appearances in deck results", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        setupQueryMock(10, 10);

        const result = await fetchLeaderboardData();
        expect(result.allTime.all_cards.length).toBeGreaterThan(0);
    });
});

// ---------------------------------------------------------------------------
// DB query calls
// ---------------------------------------------------------------------------

describe("leaderboard integration — query calls", () => {
    it("calls the DB at least once per period for both card data and deck results", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        setupQueryMock(10, 10);

        await fetchLeaderboardData();

        // 3 periods × 2 queries (getLeaderboardCardData + getDeckResultsForStats) = 6 calls
        expect(db.query).toHaveBeenCalledTimes(6);
    });

    it("passes the cardFilter scryfall IDs to getLeaderboardCardData", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        setupQueryMock(10, 10);

        await fetchLeaderboardData();

        const leaderboardCalls = db.query.mock.calls.filter(
            ([sql]) => !sql.includes("cards_in_deck")
        );
        // Each leaderboard call should have 3 params (start, end, cardFilter)
        for (const [, params] of leaderboardCalls) {
            expect(params).toHaveLength(3);
            expect(params[2]).toContain("id-1");
        }
    });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("leaderboard integration — error handling", () => {
    it("throws when the DB query fails", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        db.query.mockRejectedValue(new Error("DB down"));

        await expect(fetchLeaderboardData()).rejects.toThrow("Leaderboard service error:");
    });

    it("throws when getPointsData fails", async () => {
        getPointsData.mockRejectedValue(new Error("GitHub rate limit"));

        await expect(fetchLeaderboardData()).rejects.toThrow("Leaderboard service error:");
    });
});
