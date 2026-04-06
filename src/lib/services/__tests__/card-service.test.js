import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database/index.js", () => ({
    getCardIdByName: vi.fn(),
    getDecksWithCardFilter: vi.fn(),
    getDecksLogicalInverse: vi.fn(),
}));

import { getCardByName, getCardDecks } from "../card-service.js";
import * as db from "@/lib/database/index.js";

beforeEach(() => vi.clearAllMocks());

const makeDeckRow = (id) => ({ deck_id: id, archetype: "Aggro", normalised_placement: 0.2 });

// ---------------------------------------------------------------------------
// getCardByName
// ---------------------------------------------------------------------------

describe("getCardByName", () => {
    it("returns card_id when the card exists", async () => {
        db.getCardIdByName.mockResolvedValue({ card_id: "abc-123" });
        const result = await getCardByName("Sol Ring");
        expect(result).toEqual({ card_id: "abc-123" });
    });

    it("returns card_id: null when the card is not found", async () => {
        db.getCardIdByName.mockResolvedValue({ card_id: null });
        const result = await getCardByName("Fake Card");
        expect(result).toEqual({ card_id: null });
    });

    it("passes the card name through to the DB operation", async () => {
        db.getCardIdByName.mockResolvedValue({ card_id: null });
        await getCardByName("Black Lotus");
        expect(db.getCardIdByName).toHaveBeenCalledWith("Black Lotus");
    });

    it("propagates errors from the DB layer", async () => {
        db.getCardIdByName.mockRejectedValue(new Error("DB down"));
        await expect(getCardByName("Sol Ring")).rejects.toThrow("DB down");
    });
});

// ---------------------------------------------------------------------------
// getCardDecks
// ---------------------------------------------------------------------------

describe("getCardDecks", () => {
    it("returns includes and excludes", async () => {
        db.getDecksWithCardFilter.mockResolvedValue([makeDeckRow(1), makeDeckRow(2)]);
        db.getDecksLogicalInverse.mockResolvedValue([makeDeckRow(3)]);

        const result = await getCardDecks("id-1");
        expect(result.includes).toHaveLength(2);
        expect(result.excludes).toHaveLength(1);
    });

    it("passes the card ID as a single-element include array with no excludes", async () => {
        db.getDecksWithCardFilter.mockResolvedValue([]);
        db.getDecksLogicalInverse.mockResolvedValue([]);

        await getCardDecks("id-abc");

        expect(db.getDecksWithCardFilter).toHaveBeenCalledWith(["id-abc"], []);
        expect(db.getDecksLogicalInverse).toHaveBeenCalledWith(["id-abc"], []);
    });

    it("runs both deck queries in parallel", async () => {
        const started = [];
        db.getDecksWithCardFilter.mockImplementation(() => {
            started.push("filter");
            return Promise.resolve([]);
        });
        db.getDecksLogicalInverse.mockImplementation(() => {
            started.push("inverse");
            return Promise.resolve([]);
        });

        await getCardDecks("id-1");
        expect(started).toContain("filter");
        expect(started).toContain("inverse");
    });

    it("returns empty arrays when no decks exist", async () => {
        db.getDecksWithCardFilter.mockResolvedValue([]);
        db.getDecksLogicalInverse.mockResolvedValue([]);

        const result = await getCardDecks("id-1");
        expect(result.includes).toEqual([]);
        expect(result.excludes).toEqual([]);
    });

    it("propagates errors from the DB layer", async () => {
        db.getDecksWithCardFilter.mockRejectedValue(new Error("DB down"));
        db.getDecksLogicalInverse.mockResolvedValue([]);

        await expect(getCardDecks("id-1")).rejects.toThrow("DB down");
    });
});
