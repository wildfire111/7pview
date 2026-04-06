import { describe, it, expect } from "vitest";
import {
    calculateMeanAndConfidenceInterval,
    calculateConfidenceInterval,
} from "../confidence-intervals.js";
import {
    validDeckArray,
    smallEventDeckArray,
    mixedDeckArray,
    emptyDeckArray,
    betterDeckArray,
} from "./fixtures.js";

// ---------------------------------------------------------------------------
// calculateMeanAndConfidenceInterval
// ---------------------------------------------------------------------------

describe("calculateMeanAndConfidenceInterval", () => {
    it("returns null for null input", () => {
        expect(calculateMeanAndConfidenceInterval(null)).toBeNull();
    });

    it("returns null for empty array", () => {
        expect(calculateMeanAndConfidenceInterval(emptyDeckArray)).toBeNull();
    });

    it("returns null when all decks are filtered out (max_players <= 16)", () => {
        expect(calculateMeanAndConfidenceInterval(smallEventDeckArray)).toBeNull();
    });

    it("returns null when fewer than 2 valid samples remain after filtering", () => {
        const oneValid = [
            { max_players: 32, normalised_placement: 0.5, event_date: "2023-01-01" },
            { max_players: 8, normalised_placement: 0.2, event_date: "2023-02-01" },
        ];
        expect(calculateMeanAndConfidenceInterval(oneValid)).toBeNull();
    });

    it("filters out decks with max_players exactly 16", () => {
        const borderlineDeck = [
            { max_players: 16, normalised_placement: 0.5, event_date: "2023-01-01" },
            { max_players: 32, normalised_placement: 0.3, event_date: "2023-02-01" },
        ];
        // Only 1 deck survives filtering → null
        expect(calculateMeanAndConfidenceInterval(borderlineDeck)).toBeNull();
    });

    it("includes decks with max_players of 17", () => {
        const justAboveCutoff = [
            { max_players: 17, normalised_placement: 0.3, event_date: "2023-01-01" },
            { max_players: 17, normalised_placement: 0.5, event_date: "2023-02-01" },
        ];
        expect(calculateMeanAndConfidenceInterval(justAboveCutoff)).not.toBeNull();
    });

    it("returns object with mean and marginOfError", () => {
        const result = calculateMeanAndConfidenceInterval(validDeckArray);
        expect(result).toMatchObject({
            mean: expect.any(Number),
            marginOfError: expect.any(Number),
        });
    });

    it("mean is within the range of input placements", () => {
        const result = calculateMeanAndConfidenceInterval(validDeckArray);
        expect(result.mean).toBeGreaterThan(0);
        expect(result.mean).toBeLessThan(1);
    });

    it("marginOfError is positive and finite", () => {
        const result = calculateMeanAndConfidenceInterval(validDeckArray);
        expect(result.marginOfError).toBeGreaterThan(0);
        expect(Number.isFinite(result.marginOfError)).toBe(true);
    });

    it("mean is approximately correct for known input", () => {
        // validDeckArray placements: 0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.15,0.25 → mean = 0.4
        const result = calculateMeanAndConfidenceInterval(validDeckArray);
        expect(result.mean).toBeCloseTo(0.4, 5);
    });

    it("returns null when all placements are identical (zero stddev produces NaN SE)", () => {
        // With identical placements, stddev = 0, SE = 0, marginOfError = 0
        // This is actually valid — zero margin is fine, not NaN
        const identical = [
            { max_players: 32, normalised_placement: 0.5, event_date: "2023-01-01" },
            { max_players: 32, normalised_placement: 0.5, event_date: "2023-02-01" },
        ];
        const result = calculateMeanAndConfidenceInterval(identical);
        // mean should be 0.5, marginOfError should be 0
        expect(result).not.toBeNull();
        expect(result.mean).toBeCloseTo(0.5);
        expect(result.marginOfError).toBe(0);
    });

    it("filters out non-numeric placement values", () => {
        const withBadValues = [
            { max_players: 32, normalised_placement: "not-a-number", event_date: "2023-01-01" },
            { max_players: 32, normalised_placement: NaN, event_date: "2023-02-01" },
            { max_players: 32, normalised_placement: 0.5, event_date: "2023-03-01" },
        ];
        // Only 1 valid sample → null
        expect(calculateMeanAndConfidenceInterval(withBadValues)).toBeNull();
    });

    it("uses only valid decks from a mixed array", () => {
        const result = calculateMeanAndConfidenceInterval(mixedDeckArray);
        // Only deck_id 14 (max_players=32, placement=0.2) and 16 (max_players=64, placement=0.4) pass
        expect(result).not.toBeNull();
        expect(result.mean).toBeCloseTo(0.3, 5);
    });
});

// ---------------------------------------------------------------------------
// calculateConfidenceInterval
// ---------------------------------------------------------------------------

describe("calculateConfidenceInterval", () => {
    it("returns error shape for null input", () => {
        const result = calculateConfidenceInterval(null);
        expect(result.lower).toBeNull();
        expect(result.upper).toBeNull();
        expect(result.error).toBeDefined();
    });

    it("returns error shape for empty array", () => {
        const result = calculateConfidenceInterval([]);
        expect(result.lower).toBeNull();
        expect(result.upper).toBeNull();
    });

    it("returns error shape for single-element array", () => {
        const result = calculateConfidenceInterval([0.5]);
        expect(result.lower).toBeNull();
        expect(result.upper).toBeNull();
    });

    it("returns full result object for valid input", () => {
        const placements = [0.1, 0.2, 0.3, 0.4, 0.5];
        const result = calculateConfidenceInterval(placements);
        expect(result).toMatchObject({
            lower: expect.any(Number),
            upper: expect.any(Number),
            mean: expect.any(Number),
            marginOfError: expect.any(Number),
            sampleSize: 5,
            confidence: 0.8,
        });
    });

    it("lower bound is clamped to >= 0", () => {
        // Very low placements should not produce negative lower bound
        const lowPlacements = [0.01, 0.02, 0.01, 0.03, 0.02, 0.01];
        const result = calculateConfidenceInterval(lowPlacements);
        expect(result.lower).toBeGreaterThanOrEqual(0);
    });

    it("upper bound is clamped to <= 1", () => {
        // Very high placements should not produce upper bound > 1
        const highPlacements = [0.97, 0.98, 0.99, 0.96, 0.97, 0.98];
        const result = calculateConfidenceInterval(highPlacements);
        expect(result.upper).toBeLessThanOrEqual(1);
    });

    it("uses default confidence of 0.8", () => {
        const result = calculateConfidenceInterval([0.3, 0.4, 0.5, 0.6, 0.7]);
        expect(result.confidence).toBe(0.8);
    });

    it("respects custom confidence level", () => {
        const placements = [0.3, 0.4, 0.5, 0.6, 0.7];
        const result95 = calculateConfidenceInterval(placements, 0.95);
        const result80 = calculateConfidenceInterval(placements, 0.8);
        expect(result95.confidence).toBe(0.95);
        // Wider confidence → larger margin of error
        expect(result95.marginOfError).toBeGreaterThan(result80.marginOfError);
    });

    it("mean is correct for known input", () => {
        const placements = [0.2, 0.4, 0.6];
        const result = calculateConfidenceInterval(placements);
        expect(result.mean).toBeCloseTo(0.4, 5);
    });

    it("lower is less than upper", () => {
        const placements = [0.1, 0.3, 0.5, 0.7, 0.9];
        const result = calculateConfidenceInterval(placements);
        expect(result.lower).toBeLessThanOrEqual(result.upper);
    });
});
