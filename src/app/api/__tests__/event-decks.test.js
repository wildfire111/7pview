import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database", () => ({
    query: vi.fn(),
}));

import { GET } from "../events/[eventId]/decks/route.js";
import * as db from "@/lib/database";

beforeEach(() => vi.clearAllMocks());

const makeContext = (eventId) => ({ params: Promise.resolve({ eventId }) });

const mockEvent = { id: 1, name: "GP London", date: "2024-06-01", num_players: 128 };
const mockDecks = [
    { deck_id: 10, moxfield_id: "abc", archetype: "Aggro", placement: 1, player_name: "Alice", player_id: 5 },
    { deck_id: 11, moxfield_id: "def", archetype: "Control", placement: 2, player_name: "Bob", player_id: 6 },
];

describe("GET /api/events/[eventId]/decks", () => {
    it("returns 400 for non-numeric eventId", async () => {
        const res = await GET(new Request("http://localhost/"), makeContext("abc"));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("Invalid event ID");
    });

    it("returns 400 for alphanumeric eventId", async () => {
        const res = await GET(new Request("http://localhost/"), makeContext("12abc"));
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toBe("Invalid event ID");
    });

    it("returns 404 when event is not found", async () => {
        db.query.mockResolvedValueOnce({ rows: [] }); // event lookup returns nothing

        const res = await GET(new Request("http://localhost/"), makeContext("99"));
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.error).toBe("Event not found");
    });

    it("returns 200 with event and decks on success", async () => {
        db.query
            .mockResolvedValueOnce({ rows: [mockEvent] })  // event lookup
            .mockResolvedValueOnce({ rows: mockDecks });   // decks lookup

        const res = await GET(new Request("http://localhost/"), makeContext("1"));
        expect(res.status).toBe(200);

        const body = await res.json();
        expect(body.event).toEqual(mockEvent);
        expect(body.decks).toHaveLength(2);
        expect(body.count).toBe(2);
    });

    it("count equals decks.length", async () => {
        db.query
            .mockResolvedValueOnce({ rows: [mockEvent] })
            .mockResolvedValueOnce({ rows: mockDecks });

        const res = await GET(new Request("http://localhost/"), makeContext("1"));
        const body = await res.json();
        expect(body.count).toBe(body.decks.length);
    });

    it("returns 200 with empty decks array when event has no decks", async () => {
        db.query
            .mockResolvedValueOnce({ rows: [mockEvent] })
            .mockResolvedValueOnce({ rows: [] });

        const res = await GET(new Request("http://localhost/"), makeContext("1"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.decks).toEqual([]);
        expect(body.count).toBe(0);
    });

    it("returns 500 when DB throws", async () => {
        db.query.mockRejectedValue(new Error("DB error"));

        const res = await GET(new Request("http://localhost/"), makeContext("1"));
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Failed to fetch decks for event");
    });
});
