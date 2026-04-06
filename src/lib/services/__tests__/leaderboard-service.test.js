import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database/index.js", () => ({
    getLeaderboardCardData: vi.fn(),
    getDeckResultsForStats: vi.fn(),
}));

vi.mock("../points-service.js", () => ({
    getPointsData: vi.fn(),
}));

import { fetchLeaderboardData } from "../leaderboard-service.js";
import * as db from "@/lib/database/index.js";
import { getPointsData } from "../points-service.js";

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockPointsInfo = {
    lastChanged: "2024-01-01T00:00:00Z",
    cards: [
        { scryfall_id: "id-1", name: "Sol Ring", points: 1 },
        { scryfall_id: "id-2", name: "Black Lotus", points: 7 },
    ],
};

const makeCardData = (cards = []) => ({
    success: true,
    cards,
    metadata: { date_range: { start: "2020-01-01", end: "2024-12-31" }, total_cards: cards.length },
});

const makeDeckResults = () => [
    { deck_id: 1, cards_in_deck: ["id-1"], normalised_placement: 0.1, max_players: 32, event_date: "2024-01-01" },
    { deck_id: 2, cards_in_deck: ["id-2"], normalised_placement: 0.2, max_players: 32, event_date: "2024-01-02" },
    { deck_id: 3, cards_in_deck: [], normalised_placement: 0.5, max_players: 32, event_date: "2024-01-03" },
];

// A card with enough appearances to survive the inc_count > 5 filter
const makeCardWithAppearances = (id, incCount) => ({
    scryfall_id: id,
    card_name: `Card ${id}`,
    total_appearances: incCount,
    placement_details: Array.from({ length: Math.min(incCount, 3) }, (_, i) => ({
        event_name: `Event ${i}`,
        event_date: "2024-01-01",
        normalised_placement: 0.3,
        raw_placement: 10,
        num_players: 32,
    })),
});

// Deck results that make inc_count > 5 for a given card scryfall_id
const makeManyDecks = (cardId, count) =>
    Array.from({ length: count }, (_, i) => ({
        deck_id: i + 100,
        cards_in_deck: [cardId],
        normalised_placement: 0.3 + i * 0.01,
        max_players: 32,
        event_date: `2024-0${(i % 9) + 1}-01`,
    }));

// ---------------------------------------------------------------------------
// Result shape
// ---------------------------------------------------------------------------

describe("fetchLeaderboardData — result shape", () => {
    beforeEach(() => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        db.getLeaderboardCardData.mockResolvedValue(makeCardData([]));
        db.getDeckResultsForStats.mockResolvedValue([]);
    });

    it("returns object with allTime, lastYear, sinceUpdate keys", async () => {
        const result = await fetchLeaderboardData();
        expect(result).toHaveProperty("allTime");
        expect(result).toHaveProperty("lastYear");
        expect(result).toHaveProperty("sinceUpdate");
    });

    it("each period has period_name, metadata, total_cards, top_cards, all_cards, summary", async () => {
        const result = await fetchLeaderboardData();
        for (const key of ["allTime", "lastYear", "sinceUpdate"]) {
            expect(result[key]).toMatchObject({
                period_name: expect.any(String),
                metadata: expect.any(Object),
                total_cards: expect.any(Number),
                top_cards: expect.any(Array),
                all_cards: expect.any(Array),
                summary: expect.any(Object),
            });
        }
    });

    it("total_cards equals all_cards.length", async () => {
        const result = await fetchLeaderboardData();
        for (const key of ["allTime", "lastYear", "sinceUpdate"]) {
            expect(result[key].total_cards).toBe(result[key].all_cards.length);
        }
    });
});

// ---------------------------------------------------------------------------
// Filtering and ranking
// ---------------------------------------------------------------------------

describe("fetchLeaderboardData — filtering and ranking", () => {
    it("filters out cards with inc_count <= 5", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);

        // Card id-1 appears in only 3 decks (inc_count = 3, won't pass > 5 filter)
        const cardData = makeCardData([makeCardWithAppearances("id-1", 3)]);
        const deckResults = makeManyDecks("id-1", 3);

        db.getLeaderboardCardData.mockResolvedValue(cardData);
        db.getDeckResultsForStats.mockResolvedValue(deckResults);

        const result = await fetchLeaderboardData();
        expect(result.allTime.all_cards).toHaveLength(0);
    });

    it("includes cards with inc_count > 5", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);

        const cardData = makeCardData([makeCardWithAppearances("id-1", 10)]);
        const deckResults = makeManyDecks("id-1", 10);

        db.getLeaderboardCardData.mockResolvedValue(cardData);
        db.getDeckResultsForStats.mockResolvedValue(deckResults);

        const result = await fetchLeaderboardData();
        expect(result.allTime.all_cards).toHaveLength(1);
    });

    it("top_cards is capped at 50 entries", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);

        // 60 cards each with 10 appearances
        const manyCards = Array.from({ length: 60 }, (_, i) =>
            makeCardWithAppearances(`id-${i}`, 10)
        );
        const cardData = makeCardData(manyCards);
        const deckResults = manyCards.flatMap((c) => makeManyDecks(c.scryfall_id, 10));

        db.getLeaderboardCardData.mockResolvedValue(cardData);
        db.getDeckResultsForStats.mockResolvedValue(deckResults);

        const result = await fetchLeaderboardData();
        expect(result.allTime.top_cards.length).toBeLessThanOrEqual(50);
        expect(result.allTime.all_cards.length).toBe(60);
    });
});

// ---------------------------------------------------------------------------
// cardFilter behaviour
// ---------------------------------------------------------------------------

describe("fetchLeaderboardData — cardFilter", () => {
    it("passes null cardFilter when pointsInfo.cards is empty", async () => {
        getPointsData.mockResolvedValue({ ...mockPointsInfo, cards: [] });
        db.getLeaderboardCardData.mockResolvedValue(makeCardData([]));
        db.getDeckResultsForStats.mockResolvedValue([]);

        await fetchLeaderboardData();

        // Third argument to getLeaderboardCardData should be null
        expect(db.getLeaderboardCardData).toHaveBeenCalledWith(
            expect.any(Date),
            expect.any(Date),
            null
        );
    });

    it("passes array of scryfall_ids as cardFilter when cards exist", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        db.getLeaderboardCardData.mockResolvedValue(makeCardData([]));
        db.getDeckResultsForStats.mockResolvedValue([]);

        await fetchLeaderboardData();

        expect(db.getLeaderboardCardData).toHaveBeenCalledWith(
            expect.any(Date),
            expect.any(Date),
            ["id-1", "id-2"]
        );
    });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("fetchLeaderboardData — error handling", () => {
    it("throws 'Leaderboard service error:' when getPointsData throws", async () => {
        getPointsData.mockRejectedValue(new Error("GitHub down"));

        await expect(fetchLeaderboardData()).rejects.toThrow("Leaderboard service error:");
    });

    it("throws when getLeaderboardCardData throws", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        db.getLeaderboardCardData.mockRejectedValue(new Error("DB error"));
        db.getDeckResultsForStats.mockResolvedValue([]);

        await expect(fetchLeaderboardData()).rejects.toThrow("Leaderboard service error:");
    });

    it("throws when cardData.success is false", async () => {
        getPointsData.mockResolvedValue(mockPointsInfo);
        db.getLeaderboardCardData.mockResolvedValue({ success: false, cards: [], metadata: {} });
        db.getDeckResultsForStats.mockResolvedValue([]);

        await expect(fetchLeaderboardData()).rejects.toThrow("Leaderboard service error:");
    });

    it("uses new Date() as lastUpdateDate when pointsInfo.lastChanged is null", async () => {
        getPointsData.mockResolvedValue({ ...mockPointsInfo, lastChanged: null });
        db.getLeaderboardCardData.mockResolvedValue(makeCardData([]));
        db.getDeckResultsForStats.mockResolvedValue([]);

        // Should not throw
        await expect(fetchLeaderboardData()).resolves.toBeDefined();
    });
});
