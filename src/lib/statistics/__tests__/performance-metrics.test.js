import { describe, it, expect } from "vitest";
import {
    calculatePerformanceDelta,
    calculateConservativeScore,
    rankCardsByPerformance,
} from "../performance-metrics.js";
import {
    validDeckArray,
    betterDeckArray,
    emptyDeckArray,
    smallEventDeckArray,
} from "./fixtures.js";

// ---------------------------------------------------------------------------
// calculatePerformanceDelta
// ---------------------------------------------------------------------------

describe("calculatePerformanceDelta", () => {
    const allTime = {
        start: new Date("2020-01-01"),
        end: new Date("2030-12-31"),
    };

    it("returns zero delta and zero counts for empty include and exclude arrays", () => {
        const result = calculatePerformanceDelta(
            emptyDeckArray,
            emptyDeckArray,
            allTime.start,
            allTime.end
        );
        expect(result.delta).toBe(0);
        expect(result.CI).toBe(0);
        expect(result.inc_count).toBe(0);
        expect(result.inv_count).toBe(0);
    });

    it("returns zero delta when only one group has insufficient data", () => {
        // includes has 1 valid deck after date filter; excludes empty → delta stays 0
        const singleDeck = [validDeckArray[0]];
        const result = calculatePerformanceDelta(
            singleDeck,
            emptyDeckArray,
            allTime.start,
            allTime.end
        );
        expect(result.delta).toBe(0);
    });

    it("returns zero delta when all decks are from small events", () => {
        const result = calculatePerformanceDelta(
            smallEventDeckArray,
            smallEventDeckArray,
            allTime.start,
            allTime.end
        );
        expect(result.delta).toBe(0);
    });

    it("returns negative delta when include decks perform better (lower placement)", () => {
        // betterDeckArray has lower placements (~0.15 mean) vs validDeckArray (~0.4 mean)
        // delta = include.mean - exclude.mean = 0.15 - 0.4 = negative
        const result = calculatePerformanceDelta(
            betterDeckArray,
            validDeckArray,
            allTime.start,
            allTime.end
        );
        expect(result.delta).toBeLessThan(0);
    });

    it("returns positive delta when include decks perform worse (higher placement)", () => {
        const result = calculatePerformanceDelta(
            validDeckArray,
            betterDeckArray,
            allTime.start,
            allTime.end
        );
        expect(result.delta).toBeGreaterThan(0);
    });

    it("inc_count and inv_count reflect decks within the date range", () => {
        const narrowRange = {
            start: new Date("2023-01-01"),
            end: new Date("2023-12-31"),
        };
        const result = calculatePerformanceDelta(
            validDeckArray,
            betterDeckArray,
            narrowRange.start,
            narrowRange.end
        );
        // validDeckArray has 6 events in 2023; betterDeckArray has 5 events in 2023
        expect(result.inc_count).toBe(6);
        expect(result.inv_count).toBe(5);
    });

    it("returns zero counts when date range excludes all decks", () => {
        const result = calculatePerformanceDelta(
            validDeckArray,
            validDeckArray,
            new Date("2000-01-01"),
            new Date("2000-12-31")
        );
        expect(result.inc_count).toBe(0);
        expect(result.inv_count).toBe(0);
        expect(result.delta).toBe(0);
    });

    it("legacy fields incExcCount and invCount match inc_count and inv_count", () => {
        const result = calculatePerformanceDelta(
            validDeckArray,
            betterDeckArray,
            allTime.start,
            allTime.end
        );
        expect(result.incExcCount).toBe(result.inc_count);
        expect(result.invCount).toBe(result.inv_count);
    });

    it("CI is the marginOfError of the include group", () => {
        const result = calculatePerformanceDelta(
            validDeckArray,
            betterDeckArray,
            allTime.start,
            allTime.end
        );
        // CI should be a positive finite number when there is valid data
        expect(result.CI).toBeGreaterThan(0);
        expect(Number.isFinite(result.CI)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// calculateConservativeScore
// ---------------------------------------------------------------------------

describe("calculateConservativeScore", () => {
    it("returns delta + confidenceInterval", () => {
        expect(calculateConservativeScore(0.1, 0.05)).toBeCloseTo(0.15);
    });

    it("works with negative delta", () => {
        expect(calculateConservativeScore(-0.2, 0.05)).toBeCloseTo(-0.15);
    });

    it("works with zero delta", () => {
        expect(calculateConservativeScore(0, 0.1)).toBeCloseTo(0.1);
    });

    it("works with zero CI", () => {
        expect(calculateConservativeScore(0.3, 0)).toBeCloseTo(0.3);
    });

    it("works when both are zero", () => {
        expect(calculateConservativeScore(0, 0)).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// rankCardsByPerformance
// ---------------------------------------------------------------------------

describe("rankCardsByPerformance", () => {
    it("returns empty array for empty input", () => {
        expect(rankCardsByPerformance([])).toEqual([]);
    });

    it("assigns rank 1 to single card", () => {
        const cards = [{ conservative_score: 0.3, inc_count: 10 }];
        const result = rankCardsByPerformance(cards);
        expect(result[0].rank).toBe(1);
    });

    it("ranks card with lowest conservative_score as rank 1", () => {
        const cards = [
            { conservative_score: 0.5, inc_count: 10, name: "B" },
            { conservative_score: 0.2, inc_count: 10, name: "A" },
            { conservative_score: 0.8, inc_count: 10, name: "C" },
        ];
        const result = rankCardsByPerformance(cards);
        expect(result[0].name).toBe("A");
        expect(result[0].rank).toBe(1);
        expect(result[1].name).toBe("B");
        expect(result[1].rank).toBe(2);
        expect(result[2].name).toBe("C");
        expect(result[2].rank).toBe(3);
    });

    it("breaks ties by inc_count descending (higher count = better rank)", () => {
        const cards = [
            { conservative_score: 0.4, inc_count: 5, name: "Low" },
            { conservative_score: 0.4, inc_count: 20, name: "High" },
        ];
        const result = rankCardsByPerformance(cards);
        expect(result[0].name).toBe("High");
        expect(result[0].rank).toBe(1);
        expect(result[1].name).toBe("Low");
        expect(result[1].rank).toBe(2);
    });

    it("assigns sequential ranks with no gaps", () => {
        const cards = [
            { conservative_score: 0.1, inc_count: 10 },
            { conservative_score: 0.3, inc_count: 10 },
            { conservative_score: 0.2, inc_count: 10 },
        ];
        const result = rankCardsByPerformance(cards);
        const ranks = result.map((c) => c.rank).sort((a, b) => a - b);
        expect(ranks).toEqual([1, 2, 3]);
    });

    it("does not modify other card properties", () => {
        const cards = [
            { conservative_score: 0.1, inc_count: 10, name: "Test", extra: "value" },
        ];
        const result = rankCardsByPerformance(cards);
        expect(result[0].name).toBe("Test");
        expect(result[0].extra).toBe("value");
    });
});
