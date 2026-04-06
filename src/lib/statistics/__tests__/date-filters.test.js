import { describe, it, expect } from "vitest";
import {
    filterDecksByDateRange,
    getDateRangeFromDecks,
    formatDateForAPI,
    createDateRangeForPeriod,
} from "../date-filters.js";
import { validDeckArray, emptyDeckArray } from "./fixtures.js";

// ---------------------------------------------------------------------------
// filterDecksByDateRange
// ---------------------------------------------------------------------------

describe("filterDecksByDateRange", () => {
    const start = new Date("2023-01-01");
    const end = new Date("2023-12-31");

    it("returns empty array for null input", () => {
        expect(filterDecksByDateRange(null, start, end)).toEqual([]);
    });

    it("returns empty array for empty input", () => {
        expect(filterDecksByDateRange(emptyDeckArray, start, end)).toEqual([]);
    });

    it("excludes decks with missing event_date", () => {
        const decks = [
            { deck_id: 1, event_date: null },
            { deck_id: 2, event_date: undefined },
            { deck_id: 3, event_date: "2023-06-01" },
        ];
        const result = filterDecksByDateRange(decks, start, end);
        expect(result).toHaveLength(1);
        expect(result[0].deck_id).toBe(3);
    });

    it("includes deck exactly on start date boundary", () => {
        const decks = [{ deck_id: 1, event_date: "2023-01-01" }];
        const result = filterDecksByDateRange(decks, start, end);
        expect(result).toHaveLength(1);
    });

    it("includes deck exactly on end date boundary", () => {
        const decks = [{ deck_id: 1, event_date: "2023-12-31" }];
        const result = filterDecksByDateRange(decks, start, end);
        expect(result).toHaveLength(1);
    });

    it("excludes deck one day before start", () => {
        const decks = [{ deck_id: 1, event_date: "2022-12-31" }];
        const result = filterDecksByDateRange(decks, start, end);
        expect(result).toHaveLength(0);
    });

    it("excludes deck one day after end", () => {
        const decks = [{ deck_id: 1, event_date: "2024-01-01" }];
        const result = filterDecksByDateRange(decks, start, end);
        expect(result).toHaveLength(0);
    });

    it("returns only decks within range from validDeckArray", () => {
        // validDeckArray has 6 decks in 2023 and 4 in 2024
        const result = filterDecksByDateRange(validDeckArray, start, end);
        expect(result).toHaveLength(6);
    });

    it("returns all decks when range covers entire array span", () => {
        const wideStart = new Date("2020-01-01");
        const wideEnd = new Date("2030-12-31");
        const result = filterDecksByDateRange(validDeckArray, wideStart, wideEnd);
        expect(result).toHaveLength(validDeckArray.length);
    });
});

// ---------------------------------------------------------------------------
// getDateRangeFromDecks
// ---------------------------------------------------------------------------

describe("getDateRangeFromDecks", () => {
    it("returns null dates for empty input", () => {
        expect(getDateRangeFromDecks(emptyDeckArray)).toEqual({
            earliest: null,
            latest: null,
        });
    });

    it("returns null dates for null input", () => {
        expect(getDateRangeFromDecks(null)).toEqual({
            earliest: null,
            latest: null,
        });
    });

    it("returns same date for earliest and latest with single deck", () => {
        const decks = [{ event_date: "2023-06-15" }];
        const { earliest, latest } = getDateRangeFromDecks(decks);
        expect(earliest.toISOString().slice(0, 10)).toBe("2023-06-15");
        expect(latest.toISOString().slice(0, 10)).toBe("2023-06-15");
    });

    it("returns correct earliest and latest for multiple decks", () => {
        const { earliest, latest } = getDateRangeFromDecks(validDeckArray);
        // validDeckArray spans 2023-01-15 to 2024-07-30
        expect(earliest.toISOString().slice(0, 10)).toBe("2023-01-15");
        expect(latest.toISOString().slice(0, 10)).toBe("2024-07-30");
    });

    it("filters out decks with invalid date strings", () => {
        const decks = [
            { event_date: "not-a-date" },
            { event_date: "2023-03-01" },
            { event_date: "2023-09-01" },
        ];
        const { earliest, latest } = getDateRangeFromDecks(decks);
        expect(earliest.toISOString().slice(0, 10)).toBe("2023-03-01");
        expect(latest.toISOString().slice(0, 10)).toBe("2023-09-01");
    });

    it("returns null dates when all dates are invalid", () => {
        const decks = [{ event_date: "bad" }, { event_date: "also-bad" }];
        const { earliest, latest } = getDateRangeFromDecks(decks);
        expect(earliest).toBeNull();
        expect(latest).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// formatDateForAPI
// ---------------------------------------------------------------------------

describe("formatDateForAPI", () => {
    it("returns date in YYYY-MM-DD format", () => {
        const date = new Date("2023-07-15T12:30:00Z");
        const result = formatDateForAPI(date);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("does not include time component", () => {
        const date = new Date("2023-07-15T23:59:59Z");
        const result = formatDateForAPI(date);
        expect(result).not.toContain("T");
        expect(result).not.toContain(":");
    });

    it("pads month and day with leading zeros", () => {
        const date = new Date("2023-01-05T00:00:00Z");
        const result = formatDateForAPI(date);
        expect(result).toBe("2023-01-05");
    });
});

// ---------------------------------------------------------------------------
// createDateRangeForPeriod
// ---------------------------------------------------------------------------

describe("createDateRangeForPeriod", () => {
    const ref = new Date("2024-06-15T12:00:00Z");

    it("all-time returns startDate of 2020-01-01", () => {
        const { startDate } = createDateRangeForPeriod("all-time", ref);
        expect(startDate.toISOString().slice(0, 10)).toBe("2020-01-01");
    });

    it("unknown period falls back to all-time behaviour", () => {
        const { startDate } = createDateRangeForPeriod("unknown-period", ref);
        expect(startDate.toISOString().slice(0, 10)).toBe("2020-01-01");
    });

    it("last-year returns startDate exactly 1 year before reference", () => {
        const { startDate, endDate } = createDateRangeForPeriod("last-year", ref);
        expect(startDate.getFullYear()).toBe(ref.getFullYear() - 1);
        expect(startDate.getMonth()).toBe(ref.getMonth());
        expect(startDate.getDate()).toBe(ref.getDate());
        expect(endDate.getTime()).toBe(ref.getTime());
    });

    it("last-month returns startDate exactly 1 month before reference", () => {
        const { startDate } = createDateRangeForPeriod("last-month", ref);
        expect(startDate.getFullYear()).toBe(ref.getFullYear());
        expect(startDate.getMonth()).toBe(ref.getMonth() - 1);
        expect(startDate.getDate()).toBe(ref.getDate());
    });

    it("last-week returns startDate exactly 7 days before reference", () => {
        const { startDate } = createDateRangeForPeriod("last-week", ref);
        const diffMs = ref.getTime() - startDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        expect(diffDays).toBeCloseTo(7, 5);
    });

    it("endDate equals the reference date for all periods", () => {
        for (const period of ["last-year", "last-month", "last-week", "all-time"]) {
            const { endDate } = createDateRangeForPeriod(period, ref);
            expect(endDate.getTime()).toBe(ref.getTime());
        }
    });

    it("uses current time when no reference date is provided", () => {
        const before = Date.now();
        const { endDate } = createDateRangeForPeriod("all-time");
        const after = Date.now();
        expect(endDate.getTime()).toBeGreaterThanOrEqual(before);
        expect(endDate.getTime()).toBeLessThanOrEqual(after);
    });
});
