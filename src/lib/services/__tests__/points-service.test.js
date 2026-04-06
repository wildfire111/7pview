import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// points-service has module-level cache — reset the module before each test
// so every test starts with a clean cache state
let getPointsData;

const mockFetch = vi.fn();

beforeEach(async () => {
    vi.resetModules();
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();

    // Re-mock database after resetModules
    vi.doMock("@/lib/database/index.js", () => ({
        getCardIdsByNames: vi.fn().mockResolvedValue(
            new Map([
                ["Sol Ring", "id-sol"],
                ["Black Lotus", "id-lotus"],
            ])
        ),
    }));

    const mod = await import("../points-service.js");
    getPointsData = mod.getPointsData;
});

afterEach(() => {
    vi.unstubAllGlobals();
});

// Helpers
const makeFileResponse = (text) =>
    Promise.resolve({ ok: true, text: () => Promise.resolve(text) });

const makeCommitResponse = (commit) =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([commit]) });

const makeErrorResponse = (status) =>
    Promise.resolve({ ok: false, status, statusText: "Error" });

const defaultCommit = {
    commit: { committer: { date: "2024-06-01T00:00:00Z" }, message: "Update points" },
    html_url: "https://github.com/example/commit/abc",
};

const defaultContent = "Sol Ring 1\nBlack Lotus 7\n";

function setupHappyPath() {
    mockFetch
        .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(defaultContent) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([defaultCommit]) });
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe("getPointsData — happy path", () => {
    it("returns correct shape on first fetch", async () => {
        setupHappyPath();
        const result = await getPointsData();

        expect(result).toMatchObject({
            lastChanged: "2024-06-01T00:00:00Z",
            commitMessage: "Update points",
            commitUrl: "https://github.com/example/commit/abc",
            cards: expect.any(Array),
            totalCards: expect.any(Number),
        });
    });

    it("cards contain name, points, and scryfall_id", async () => {
        setupHappyPath();
        const result = await getPointsData();

        expect(result.cards[0]).toMatchObject({
            name: expect.any(String),
            points: expect.any(Number),
            scryfall_id: expect.any(String),
        });
    });

    it("parses multiple cards from file content", async () => {
        setupHappyPath();
        const result = await getPointsData();
        expect(result.cards).toHaveLength(2);
    });
});

// ---------------------------------------------------------------------------
// Cache behaviour
// ---------------------------------------------------------------------------

describe("getPointsData — caching", () => {
    it("returns cached result on second call without re-fetching", async () => {
        setupHappyPath();

        const first = await getPointsData();
        const second = await getPointsData();

        // Same object reference = cache hit
        expect(second).toBe(first);
        // fetch should only have been called twice (file + commit), not four times
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("refetches after cache expires", async () => {
        setupHappyPath();
        await getPointsData(); // populate cache

        // Advance time past CACHE_DURATION (5 minutes)
        vi.spyOn(Date, "now").mockReturnValue(Date.now() + 6 * 60 * 1000);

        // Set up second fetch
        mockFetch
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(defaultContent) })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([defaultCommit]) });

        await getPointsData();

        // Should have fetched twice (2 calls each time)
        expect(mockFetch).toHaveBeenCalledTimes(4);

        vi.restoreAllMocks();
    });
});

// ---------------------------------------------------------------------------
// GitHub rate limiting
// ---------------------------------------------------------------------------

describe("getPointsData — GitHub rate limiting", () => {
    it("returns fallback commit info on 403", async () => {
        mockFetch
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(defaultContent) })
            .mockResolvedValueOnce({ ok: false, status: 403, statusText: "Forbidden" });

        const result = await getPointsData();
        expect(result.commitMessage).toBe("Unable to fetch commit info (rate limited)");
        expect(result.commitUrl).toBe("#");
    });

    it("returns fallback commit info on 429", async () => {
        mockFetch
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(defaultContent) })
            .mockResolvedValueOnce({ ok: false, status: 429, statusText: "Too Many Requests" });

        const result = await getPointsData();
        expect(result.commitUrl).toBe("#");
    });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe("getPointsData — error handling", () => {
    it("throws when file fetch fails and no cache exists", async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: "Server Error" });

        await expect(getPointsData()).rejects.toThrow("Failed to fetch points data");
    });

    it("returns stale cache when fetch fails and cache exists", async () => {
        setupHappyPath();
        const cached = await getPointsData();

        // Expire cache and make next fetch fail
        vi.spyOn(Date, "now").mockReturnValue(Date.now() + 6 * 60 * 1000);
        mockFetch.mockRejectedValue(new Error("Network error"));

        const result = await getPointsData();
        expect(result).toBe(cached);

        vi.restoreAllMocks();
    });

    it("throws non-rate-limit GitHub API errors", async () => {
        mockFetch
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(defaultContent) })
            .mockResolvedValueOnce({ ok: false, status: 500, statusText: "Server Error" });

        await expect(getPointsData()).rejects.toThrow("Failed to fetch points data");
    });
});

// ---------------------------------------------------------------------------
// parsePointsFile (tested via getPointsData with controlled content)
// ---------------------------------------------------------------------------

describe("parsePointsFile — line parsing", () => {
    it("skips lines with no space separator", async () => {
        mockFetch
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("NoSpace\nSol Ring 1\n") })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([defaultCommit]) });

        const result = await getPointsData();
        expect(result.cards).toHaveLength(1);
        expect(result.cards[0].name).toBe("Sol Ring");
    });

    it("skips lines where point value is not a number", async () => {
        mockFetch
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("Sol Ring abc\nBlack Lotus 7\n") })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([defaultCommit]) });

        const result = await getPointsData();
        expect(result.cards).toHaveLength(1);
        expect(result.cards[0].name).toBe("Black Lotus");
    });

    it("skips cards not found in the database", async () => {
        // Only Sol Ring is in the mock nameMap
        mockFetch
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("Sol Ring 1\nUnknown Card 3\n") })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([defaultCommit]) });

        const result = await getPointsData();
        const names = result.cards.map((c) => c.name);
        expect(names).toContain("Sol Ring");
        expect(names).not.toContain("Unknown Card");
    });

    it("returns empty cards array for empty file", async () => {
        mockFetch
            .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("") })
            .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([defaultCommit]) });

        const result = await getPointsData();
        expect(result.cards).toEqual([]);
        expect(result.totalCards).toBe(0);
    });
});
