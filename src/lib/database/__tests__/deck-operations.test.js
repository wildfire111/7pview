import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database/db.js", () => ({ query: vi.fn() }));

import {
    getDeckDetails,
    getDecksWithCardFilter,
    getDeckResultsForStats,
    getDecksLogicalInverse,
} from "../deck-operations.js";
import * as db from "@/lib/database/db.js";

beforeEach(() => vi.clearAllMocks());

const makeDeckRow = (id) => ({
    deck_id: id,
    archetype: "Aggro",
    player_name: "Alice",
    event_name: "Test Event",
    event_date: "2024-01-01",
    raw_placement: 1,
    normalised_placement: 0.03,
    max_players: 32,
});

// ---------------------------------------------------------------------------
// getDeckDetails
// ---------------------------------------------------------------------------

describe("getDeckDetails", () => {
    it("returns empty array without querying when given an empty array", async () => {
        const result = await getDeckDetails([]);
        expect(result).toEqual([]);
        expect(db.query).not.toHaveBeenCalled();
    });

    it("returns empty array without querying when given null/undefined", async () => {
        const result = await getDeckDetails(null);
        expect(result).toEqual([]);
        expect(db.query).not.toHaveBeenCalled();
    });

    it("returns rows from the query", async () => {
        const rows = [makeDeckRow(1), makeDeckRow(2)];
        db.query.mockResolvedValue({ rows });
        const result = await getDeckDetails([1, 2]);
        expect(result).toEqual(rows);
    });

    it("passes deck IDs as individual query parameters", async () => {
        db.query.mockResolvedValue({ rows: [] });
        await getDeckDetails([10, 20]);
        expect(db.query).toHaveBeenCalledWith(expect.any(String), [10, 20]);
    });

    it("throws when the DB query fails", async () => {
        db.query.mockRejectedValue(new Error("DB error"));
        await expect(getDeckDetails([1])).rejects.toThrow("Failed to fetch deck details");
    });
});

// ---------------------------------------------------------------------------
// getDecksWithCardFilter
// ---------------------------------------------------------------------------

describe("getDecksWithCardFilter", () => {
    it("returns deck rows", async () => {
        const rows = [makeDeckRow(1)];
        db.query.mockResolvedValue({ rows });
        const result = await getDecksWithCardFilter(["id-1"], []);
        expect(result).toEqual(rows);
    });

    it("passes include and exclude arrays as parameters", async () => {
        db.query.mockResolvedValue({ rows: [] });
        await getDecksWithCardFilter(["id-1"], ["id-2"]);
        expect(db.query).toHaveBeenCalledWith(expect.any(String), [["id-1"], ["id-2"]]);
    });

    it("accepts empty arrays for both include and exclude (returns all decks)", async () => {
        db.query.mockResolvedValue({ rows: [] });
        await getDecksWithCardFilter([], []);
        expect(db.query).toHaveBeenCalledWith(expect.any(String), [[], []]);
    });

    it("defaults to empty arrays when called with no arguments", async () => {
        db.query.mockResolvedValue({ rows: [] });
        await getDecksWithCardFilter();
        expect(db.query).toHaveBeenCalledWith(expect.any(String), [[], []]);
    });

    it("throws when the DB query fails", async () => {
        db.query.mockRejectedValue(new Error("timeout"));
        await expect(getDecksWithCardFilter(["id-1"], [])).rejects.toThrow("Failed to fetch filtered decks");
    });
});

// ---------------------------------------------------------------------------
// getDeckResultsForStats
// ---------------------------------------------------------------------------

describe("getDeckResultsForStats", () => {
    it("returns deck rows", async () => {
        const rows = [{ deck_id: 1, normalised_placement: 0.1, cards_in_deck: ["id-1"] }];
        db.query.mockResolvedValue({ rows });
        const result = await getDeckResultsForStats(new Date("2024-01-01"), new Date("2024-12-31"));
        expect(result).toEqual(rows);
    });

    it("formats dates as YYYY-MM-DD strings", async () => {
        db.query.mockResolvedValue({ rows: [] });
        await getDeckResultsForStats(new Date("2024-03-15"), new Date("2024-06-30"));
        expect(db.query).toHaveBeenCalledWith(expect.any(String), ["2024-03-15", "2024-06-30"]);
    });

    it("throws when the DB query fails", async () => {
        db.query.mockRejectedValue(new Error("DB error"));
        await expect(
            getDeckResultsForStats(new Date("2024-01-01"), new Date("2024-12-31"))
        ).rejects.toThrow("Failed to fetch deck results for statistics");
    });
});

// ---------------------------------------------------------------------------
// getDecksLogicalInverse
// ---------------------------------------------------------------------------

describe("getDecksLogicalInverse", () => {
    it("returns decks not in the matching set", async () => {
        // Call 1: getDecksWithCardFilter(includeCards, excludeCards) — matching decks
        db.query.mockResolvedValueOnce({ rows: [makeDeckRow(1)] });
        // Call 2: getDecksWithCardFilter([], []) — all decks
        db.query.mockResolvedValueOnce({ rows: [makeDeckRow(1), makeDeckRow(2), makeDeckRow(3)] });

        const result = await getDecksLogicalInverse(["id-1"], []);
        expect(result).toHaveLength(2);
        expect(result.map((r) => r.deck_id)).toEqual([2, 3]);
    });

    it("makes two DB round-trips", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getDecksLogicalInverse(["id-1"], []);

        expect(db.query).toHaveBeenCalledTimes(2);
    });

    it("returns empty array when no inverse decks exist", async () => {
        db.query.mockResolvedValueOnce({ rows: [makeDeckRow(1)] });
        db.query.mockResolvedValueOnce({ rows: [makeDeckRow(1)] });

        const result = await getDecksLogicalInverse(["id-1"], []);
        expect(result).toEqual([]);
    });

    it("defaults to empty arrays when called with no arguments", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getDecksLogicalInverse();

        // Both inner calls pass empty arrays
        expect(db.query).toHaveBeenCalledWith(expect.any(String), [[], []]);
    });

    it("throws when the DB query fails", async () => {
        db.query.mockRejectedValue(new Error("DB error"));
        await expect(getDecksLogicalInverse(["id-1"], [])).rejects.toThrow(
            "Failed to fetch logical inverse of decks"
        );
    });
});
