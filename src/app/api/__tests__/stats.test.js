import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/services", () => ({
    getPointsData: vi.fn(),
}));

import { GET } from "../stats/route.js";
import * as services from "@/lib/services";

beforeEach(() => vi.clearAllMocks());

describe("GET /api/stats", () => {
    it("returns 200 with correct shape on success", async () => {
        services.getPointsData.mockResolvedValue({
            lastChanged: "2024-01-01T00:00:00Z",
            commitMessage: "Update points",
            commitUrl: "https://github.com/example",
            cards: [
                { name: "Sol Ring", points: 1, scryfall_id: "abc" },
                { name: "Black Lotus", points: 7, scryfall_id: "def" },
            ],
        });

        const res = await GET();
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.lastChanged).toBe("2024-01-01T00:00:00Z");
        expect(body.commitMessage).toBe("Update points");
        expect(body.commitUrl).toBe("https://github.com/example");
        expect(body.cards).toHaveLength(2);
        expect(body.totalCards).toBe(2);
    });

    it("totalCards equals cards.length", async () => {
        const cards = [{ name: "A", points: 1, scryfall_id: "1" }];
        services.getPointsData.mockResolvedValue({
            lastChanged: null,
            commitMessage: "",
            commitUrl: "",
            cards,
        });

        const res = await GET();
        const body = await res.json();
        expect(body.totalCards).toBe(cards.length);
    });

    it("returns 200 with totalCards 0 when cards is empty", async () => {
        services.getPointsData.mockResolvedValue({
            lastChanged: null,
            commitMessage: "",
            commitUrl: "",
            cards: [],
        });

        const res = await GET();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.totalCards).toBe(0);
    });

    it("returns 500 when getPointsData throws", async () => {
        services.getPointsData.mockRejectedValue(new Error("GitHub unreachable"));

        const res = await GET();
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Failed to fetch stats");
    });
});
