import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database/index.js", () => ({
    getCardIdsByNames: vi.fn(),
    getDecksWithCardFilter: vi.fn(),
    getDecksLogicalInverse: vi.fn(),
}));

import { searchDecks, validateCardNames } from "../search-service.js";
import * as db from "@/lib/database/index.js";

beforeEach(() => vi.clearAllMocks());

const mockDeck = (id) => ({ deck_id: id, archetype: "Aggro", normalised_placement: 0.2 });

// ---------------------------------------------------------------------------
// searchDecks
// ---------------------------------------------------------------------------

describe("searchDecks", () => {
    it("returns empty includes/excludes without querying when both arrays are empty", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map());
        db.getDecksWithCardFilter.mockResolvedValue([]);
        db.getDecksLogicalInverse.mockResolvedValue([]);

        const result = await searchDecks([], []);
        expect(result.includes).toEqual([]);
        expect(result.excludes).toEqual([]);
    });

    it("resolves all card names in a single batch call", async () => {
        db.getCardIdsByNames.mockResolvedValue(
            new Map([["Sol Ring", "id-1"], ["Black Lotus", "id-2"]])
        );
        db.getDecksWithCardFilter.mockResolvedValue([]);
        db.getDecksLogicalInverse.mockResolvedValue([]);

        await searchDecks(["Sol Ring"], ["Black Lotus"]);

        expect(db.getCardIdsByNames).toHaveBeenCalledTimes(1);
        expect(db.getCardIdsByNames).toHaveBeenCalledWith(["Sol Ring", "Black Lotus"]);
    });

    it("passes resolved IDs to getDecksWithCardFilter", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map([["Sol Ring", "id-1"]]));
        db.getDecksWithCardFilter.mockResolvedValue([mockDeck(1)]);
        db.getDecksLogicalInverse.mockResolvedValue([]);

        await searchDecks(["Sol Ring"], []);

        expect(db.getDecksWithCardFilter).toHaveBeenCalledWith(["id-1"], []);
    });

    it("throws CARDS_NOT_FOUND when an include card is missing from the DB", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map([["Black Lotus", "id-2"]]));

        const err = await searchDecks(["Sol Ring", "Black Lotus"], []).catch((e) => e);
        expect(err.message).toBe("CARDS_NOT_FOUND");
        expect(err.missingIncludes).toContain("Sol Ring");
        expect(err.missingExcludes).toEqual([]);
    });

    it("throws CARDS_NOT_FOUND when an exclude card is missing from the DB", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map());

        const err = await searchDecks([], ["Ghost Card"]).catch((e) => e);
        expect(err.message).toBe("CARDS_NOT_FOUND");
        expect(err.missingIncludes).toEqual([]);
        expect(err.missingExcludes).toContain("Ghost Card");
    });

    it("returns includes from getDecksWithCardFilter and excludes from getDecksLogicalInverse", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map([["Sol Ring", "id-1"]]));
        db.getDecksWithCardFilter.mockResolvedValue([mockDeck(1), mockDeck(2)]);
        db.getDecksLogicalInverse.mockResolvedValue([mockDeck(3)]);

        const result = await searchDecks(["Sol Ring"], []);
        expect(result.includes.map((d) => d.deck_id)).toEqual([1, 2]);
        expect(result.excludes.map((d) => d.deck_id)).toEqual([3]);
    });

    it("runs deck queries in parallel", async () => {
        const order = [];
        db.getCardIdsByNames.mockResolvedValue(new Map([["Sol Ring", "id-1"]]));
        db.getDecksWithCardFilter.mockImplementation(() => {
            order.push("filter");
            return Promise.resolve([]);
        });
        db.getDecksLogicalInverse.mockImplementation(() => {
            order.push("inverse");
            return Promise.resolve([]);
        });

        await searchDecks(["Sol Ring"], []);

        // Both should have been called (order may vary since they run in parallel)
        expect(order).toContain("filter");
        expect(order).toContain("inverse");
    });

    it("throws when the DB throws during deck lookup", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map([["Sol Ring", "id-1"]]));
        db.getDecksWithCardFilter.mockRejectedValue(new Error("DB down"));
        db.getDecksLogicalInverse.mockResolvedValue([]);

        await expect(searchDecks(["Sol Ring"], [])).rejects.toThrow();
    });
});

// ---------------------------------------------------------------------------
// validateCardNames
// ---------------------------------------------------------------------------

describe("validateCardNames", () => {
    it("returns empty valid and invalid for empty array", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map());
        const result = await validateCardNames([]);
        expect(result).toEqual({ valid: [], invalid: [] });
        expect(db.getCardIdsByNames).not.toHaveBeenCalled();
    });

    it("returns empty valid and invalid for null", async () => {
        const result = await validateCardNames(null);
        expect(result).toEqual({ valid: [], invalid: [] });
    });

    it("puts found cards in valid with name, found, id", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map([["Sol Ring", "abc-123"]]));

        const result = await validateCardNames(["Sol Ring"]);
        expect(result.valid).toHaveLength(1);
        expect(result.valid[0]).toMatchObject({ name: "Sol Ring", found: true, id: "abc-123" });
        expect(result.invalid).toHaveLength(0);
    });

    it("puts cards not in the map in invalid", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map());

        const result = await validateCardNames(["Fake Card"]);
        expect(result.invalid).toContain("Fake Card");
        expect(result.valid).toHaveLength(0);
    });

    it("correctly splits mixed found/not-found input", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map([["Sol Ring", "id-1"]]));

        const result = await validateCardNames(["Sol Ring", "Fake Card"]);
        expect(result.valid).toHaveLength(1);
        expect(result.valid[0].name).toBe("Sol Ring");
        expect(result.invalid).toContain("Fake Card");
    });

    it("uses a single batch query for all card names", async () => {
        db.getCardIdsByNames.mockResolvedValue(new Map());

        await validateCardNames(["Card A", "Card B", "Card C"]);

        expect(db.getCardIdsByNames).toHaveBeenCalledTimes(1);
        expect(db.getCardIdsByNames).toHaveBeenCalledWith(["Card A", "Card B", "Card C"]);
    });
});
