import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database/db.js", () => ({ query: vi.fn() }));

import { getLeaderboardCardData } from "../leaderboard-queries.js";
import * as db from "@/lib/database/db.js";

beforeEach(() => vi.clearAllMocks());

const start = new Date("2024-01-01");
const end = new Date("2024-12-31");

const makeCardRow = (id) => ({
    scryfall_id: id,
    card_name: `Card ${id}`,
    total_appearances: 10,
    avg_normalized_placement: 0.25,
    placement_details: [],
});

// ---------------------------------------------------------------------------
// Result structure
// ---------------------------------------------------------------------------

describe("getLeaderboardCardData — result structure", () => {
    it("returns success:true with cards and metadata", async () => {
        const rows = [makeCardRow("id-1"), makeCardRow("id-2")];
        db.query.mockResolvedValue({ rows });

        const result = await getLeaderboardCardData(start, end);

        expect(result.success).toBe(true);
        expect(result.cards).toEqual(rows);
        expect(result.metadata.total_cards).toBe(2);
        expect(result.metadata.date_range.start).toBe("2024-01-01");
        expect(result.metadata.date_range.end).toBe("2024-12-31");
    });

    it("returns empty cards array and total_cards:0 when no rows found", async () => {
        db.query.mockResolvedValue({ rows: [] });

        const result = await getLeaderboardCardData(start, end);

        expect(result.success).toBe(true);
        expect(result.cards).toEqual([]);
        expect(result.metadata.total_cards).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

describe("getLeaderboardCardData — date parameters", () => {
    it("formats dates as YYYY-MM-DD strings in query params", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getLeaderboardCardData(new Date("2023-06-15"), new Date("2023-09-30"));

        expect(db.query).toHaveBeenCalledWith(
            expect.any(String),
            expect.arrayContaining(["2023-06-15", "2023-09-30"])
        );
    });
});

// ---------------------------------------------------------------------------
// cardFilter
// ---------------------------------------------------------------------------

describe("getLeaderboardCardData — cardFilter", () => {
    it("adds a third query param when cardFilter is provided", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getLeaderboardCardData(start, end, ["id-1", "id-2"]);

        const [, params] = db.query.mock.calls[0];
        expect(params).toHaveLength(3);
        expect(params[2]).toEqual(["id-1", "id-2"]);
    });

    it("uses only two query params when cardFilter is null", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getLeaderboardCardData(start, end, null);

        const [, params] = db.query.mock.calls[0];
        expect(params).toHaveLength(2);
    });

    it("uses only two query params when cardFilter is omitted", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getLeaderboardCardData(start, end);

        const [, params] = db.query.mock.calls[0];
        expect(params).toHaveLength(2);
    });

    it("uses only two query params when cardFilter is an empty array", async () => {
        db.query.mockResolvedValue({ rows: [] });

        await getLeaderboardCardData(start, end, []);

        const [, params] = db.query.mock.calls[0];
        expect(params).toHaveLength(2);
    });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("getLeaderboardCardData — error handling", () => {
    it("throws when the DB query fails", async () => {
        db.query.mockRejectedValue(new Error("connection lost"));

        await expect(getLeaderboardCardData(start, end)).rejects.toThrow(
            "Failed to fetch leaderboard card data"
        );
    });
});
