import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database/db.js", () => ({ query: vi.fn() }));

import { getCardIdByName, getCardIdsByNames, getDecksContainingCard } from "../card-operations.js";
import * as db from "@/lib/database/db.js";

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// getCardIdByName
// ---------------------------------------------------------------------------

describe("getCardIdByName", () => {
    it("returns card_id when card is found", async () => {
        db.query.mockResolvedValue({ rows: [{ scryfall_id: "abc-123" }] });
        const result = await getCardIdByName("Sol Ring");
        expect(result).toEqual({ card_id: "abc-123" });
    });

    it("returns card_id: null when card is not found", async () => {
        db.query.mockResolvedValue({ rows: [] });
        const result = await getCardIdByName("Fake Card");
        expect(result).toEqual({ card_id: null });
    });

    it("passes the card name as a query parameter", async () => {
        db.query.mockResolvedValue({ rows: [] });
        await getCardIdByName("Black Lotus");
        expect(db.query).toHaveBeenCalledWith(expect.any(String), ["Black Lotus"]);
    });

    it("throws a descriptive error when the DB query fails", async () => {
        db.query.mockRejectedValue(new Error("connection refused"));
        await expect(getCardIdByName("Sol Ring")).rejects.toThrow("Failed to fetch card ID for: Sol Ring");
    });
});

// ---------------------------------------------------------------------------
// getCardIdsByNames
// ---------------------------------------------------------------------------

describe("getCardIdsByNames", () => {
    it("returns an empty Map without querying when given an empty array", async () => {
        const result = await getCardIdsByNames([]);
        expect(result).toEqual(new Map());
        expect(db.query).not.toHaveBeenCalled();
    });

    it("returns an empty Map without querying when given null/undefined", async () => {
        const result = await getCardIdsByNames(null);
        expect(result).toEqual(new Map());
        expect(db.query).not.toHaveBeenCalled();
    });

    it("returns a Map of name → scryfall_id", async () => {
        db.query.mockResolvedValue({
            rows: [
                { name: "Sol Ring", scryfall_id: "id-1" },
                { name: "Black Lotus", scryfall_id: "id-2" },
            ],
        });
        const result = await getCardIdsByNames(["Sol Ring", "Black Lotus"]);
        expect(result.get("Sol Ring")).toBe("id-1");
        expect(result.get("Black Lotus")).toBe("id-2");
        expect(result.size).toBe(2);
    });

    it("passes all names as a single array parameter", async () => {
        db.query.mockResolvedValue({ rows: [] });
        await getCardIdsByNames(["Sol Ring", "Black Lotus"]);
        expect(db.query).toHaveBeenCalledWith(expect.any(String), [["Sol Ring", "Black Lotus"]]);
    });

    it("throws when the DB query fails", async () => {
        db.query.mockRejectedValue(new Error("timeout"));
        await expect(getCardIdsByNames(["Sol Ring"])).rejects.toThrow("Failed to fetch card IDs");
    });
});

// ---------------------------------------------------------------------------
// getDecksContainingCard
// ---------------------------------------------------------------------------

describe("getDecksContainingCard", () => {
    it("returns array of deck_ids", async () => {
        db.query.mockResolvedValue({ rows: [{ deck_id: 1 }, { deck_id: 2 }] });
        const result = await getDecksContainingCard("id-1");
        expect(result).toEqual([1, 2]);
    });

    it("returns empty array when no decks contain the card", async () => {
        db.query.mockResolvedValue({ rows: [] });
        const result = await getDecksContainingCard("id-1");
        expect(result).toEqual([]);
    });

    it("passes the card ID as a query parameter", async () => {
        db.query.mockResolvedValue({ rows: [] });
        await getDecksContainingCard("abc-123");
        expect(db.query).toHaveBeenCalledWith(expect.any(String), ["abc-123"]);
    });

    it("throws a descriptive error when the DB query fails", async () => {
        db.query.mockRejectedValue(new Error("DB down"));
        await expect(getDecksContainingCard("id-1")).rejects.toThrow("Failed to fetch decks for card: id-1");
    });
});
