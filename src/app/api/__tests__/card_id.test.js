import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/database", () => ({
    getCardIdByName: vi.fn(),
}));

import { GET } from "../card_id/route.js";
import * as db from "@/lib/database";

const makeRequest = (name) =>
    new Request(`http://localhost/api/card_id${name !== undefined ? `?name=${encodeURIComponent(name)}` : ""}`);

beforeEach(() => vi.clearAllMocks());

describe("GET /api/card_id", () => {
    it("returns { card_id: null } with no DB call when name param is missing", async () => {
        const res = await GET(new Request("http://localhost/api/card_id"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.card_id).toBeNull();
        expect(db.getCardIdByName).not.toHaveBeenCalled();
    });

    it("returns { card_id: null } with no DB call when name is whitespace only", async () => {
        const res = await GET(makeRequest("   "));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.card_id).toBeNull();
        expect(db.getCardIdByName).not.toHaveBeenCalled();
    });

    it("returns card_id when card is found", async () => {
        db.getCardIdByName.mockResolvedValue({ card_id: "abc-123" });

        const res = await GET(makeRequest("Sol Ring"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.card_id).toBe("abc-123");
    });

    it("returns { card_id: null } when card is not found", async () => {
        db.getCardIdByName.mockResolvedValue({ card_id: null });

        const res = await GET(makeRequest("Nonexistent Card"));
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.card_id).toBeNull();
    });

    it("returns 500 when DB throws", async () => {
        db.getCardIdByName.mockRejectedValue(new Error("DB down"));

        const res = await GET(makeRequest("Sol Ring"));
        expect(res.status).toBe(500);
        const body = await res.json();
        expect(body.error).toBe("Failed to fetch card ID");
    });
});
