import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();

import { fetchPointsFromAPI, fetchLeaderboardFromAPI } from "../stats-client.js";

beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
});

afterEach(() => vi.unstubAllGlobals());

const makeOkResponse = (data) => ({
    ok: true,
    json: () => Promise.resolve(data),
});

const makeErrorResponse = (status = 500) => ({
    ok: false,
    status,
    statusText: "Error",
});

// ---------------------------------------------------------------------------
// fetchPointsFromAPI
// ---------------------------------------------------------------------------

describe("fetchPointsFromAPI", () => {
    it("returns correct shape on success", async () => {
        mockFetch.mockResolvedValue(makeOkResponse({
            cards: [{ name: "Sol Ring", points: 1, scryfall_id: "abc" }],
            lastChanged: "2024-01-01T00:00:00Z",
            commitMessage: "Update points",
            commitUrl: "https://github.com/example",
            totalCards: 1,
        }));

        const result = await fetchPointsFromAPI();
        expect(result).toMatchObject({
            content: "",
            cards: expect.any(Array),
            lastChanged: "2024-01-01T00:00:00Z",
            commitMessage: "Update points",
            commitUrl: "https://github.com/example",
            totalCards: 1,
        });
    });

    it("content is always empty string", async () => {
        mockFetch.mockResolvedValue(makeOkResponse({ cards: [], lastChanged: null }));
        const result = await fetchPointsFromAPI();
        expect(result.content).toBe("");
    });

    it("cards defaults to [] when API returns no cards field", async () => {
        mockFetch.mockResolvedValue(makeOkResponse({ lastChanged: null }));
        const result = await fetchPointsFromAPI();
        expect(result.cards).toEqual([]);
    });

    it("commitMessage defaults to empty string", async () => {
        mockFetch.mockResolvedValue(makeOkResponse({ cards: [] }));
        const result = await fetchPointsFromAPI();
        expect(result.commitMessage).toBe("");
    });

    it("throws when response is not ok", async () => {
        mockFetch.mockResolvedValue(makeErrorResponse(503));
        await expect(fetchPointsFromAPI()).rejects.toThrow("Failed to fetch points data");
    });

    it("throws on network error", async () => {
        mockFetch.mockRejectedValue(new Error("Network failure"));
        await expect(fetchPointsFromAPI()).rejects.toThrow("Failed to fetch points data");
    });
});

// ---------------------------------------------------------------------------
// fetchLeaderboardFromAPI
// ---------------------------------------------------------------------------

describe("fetchLeaderboardFromAPI", () => {
    it("returns parsed JSON on success", async () => {
        const data = { allTime: { total_cards: 10 } };
        mockFetch.mockResolvedValue(makeOkResponse(data));

        const result = await fetchLeaderboardFromAPI();
        expect(result).toEqual(data);
    });

    it("serializes params as query string", async () => {
        mockFetch.mockResolvedValue(makeOkResponse({}));
        await fetchLeaderboardFromAPI({ period: "all-time", limit: "10" });

        const calledUrl = mockFetch.mock.calls[0][0];
        expect(calledUrl).toContain("period=all-time");
        expect(calledUrl).toContain("limit=10");
    });

    it("works with no params (defaults to empty object)", async () => {
        mockFetch.mockResolvedValue(makeOkResponse({}));
        await expect(fetchLeaderboardFromAPI()).resolves.toBeDefined();
    });

    it("throws when response is not ok", async () => {
        mockFetch.mockResolvedValue(makeErrorResponse(404));
        await expect(fetchLeaderboardFromAPI()).rejects.toThrow("Failed to fetch leaderboard");
    });

    it("throws on network error", async () => {
        mockFetch.mockRejectedValue(new Error("Network failure"));
        await expect(fetchLeaderboardFromAPI()).rejects.toThrow("Failed to fetch leaderboard");
    });
});
