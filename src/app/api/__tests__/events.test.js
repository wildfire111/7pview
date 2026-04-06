import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database", () => ({
    query: vi.fn(),
}));

import { GET } from "../events/route.js";
import * as db from "@/lib/database";

beforeEach(() => vi.clearAllMocks());

const mockEvents = [
    { id: 1, name: "GP London", date: "2024-06-01", num_players: 128 },
    { id: 2, name: "GP Paris", date: "2024-05-01", num_players: 64 },
];

describe("GET /api/events", () => {
    it("returns 200 with events array and count", async () => {
        db.query.mockResolvedValue({ rows: mockEvents });

        const res = await GET();
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.events).toHaveLength(2);
        expect(body.count).toBe(2);
        expect(body.events[0].name).toBe("GP London");
    });

    it("count matches events.length", async () => {
        db.query.mockResolvedValue({ rows: mockEvents });

        const res = await GET();
        const body = await res.json();
        expect(body.count).toBe(body.events.length);
    });

    it("returns empty events and count 0 when DB has no rows", async () => {
        db.query.mockResolvedValue({ rows: [] });

        const res = await GET();
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.events).toEqual([]);
        expect(body.count).toBe(0);
    });

    it("returns 500 when DB throws", async () => {
        db.query.mockRejectedValue(new Error("connection refused"));

        const res = await GET();
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Failed to fetch events");
    });
});
