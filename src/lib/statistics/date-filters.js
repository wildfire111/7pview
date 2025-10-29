/**
 * Date filtering utilities
 * Handles date-based filtering for deck and event data
 */

/**
 * Filter deck results by date range
 * @param {Object[]} decks - Array of deck objects with event_date field
 * @param {Date} startDate - Start date for filtering (inclusive)
 * @param {Date} endDate - End date for filtering (inclusive)
 * @returns {Object[]} Filtered array of decks within date range
 */
export function filterDecksByDateRange(decks, startDate, endDate) {
    if (!decks?.length) return [];

    return decks.filter((deck) => {
        if (!deck.event_date) return false;

        const deckDate = new Date(deck.event_date);
        return deckDate >= startDate && deckDate <= endDate;
    });
}

/**
 * Get date range from deck data
 * @param {Object[]} decks - Array of deck objects with event_date field
 * @returns {Object} Object with earliest and latest dates
 */
export function getDateRangeFromDecks(decks) {
    if (!decks?.length) {
        return { earliest: null, latest: null };
    }

    const dates = decks
        .map((deck) => new Date(deck.event_date))
        .filter((date) => !isNaN(date.getTime()));

    if (dates.length === 0) {
        return { earliest: null, latest: null };
    }

    return {
        earliest: new Date(Math.min(...dates)),
        latest: new Date(Math.max(...dates)),
    };
}

/**
 * Format date for API/SQL usage
 * @param {Date} date - Date to format
 * @returns {string} Date in YYYY-MM-DD format
 */
export function formatDateForAPI(date) {
    return date.toISOString().split("T")[0];
}

/**
 * Create date range for common time periods
 * @param {string} period - Time period ('all-time', 'last-year', 'last-month', etc.)
 * @param {Date} [referenceDate] - Reference date for calculations (default: now)
 * @returns {Object} Object with startDate and endDate
 */
export function createDateRangeForPeriod(period, referenceDate = new Date()) {
    const endDate = new Date(referenceDate);
    let startDate;

    switch (period) {
        case "last-year":
            startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case "last-month":
            startDate = new Date(endDate);
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case "last-week":
            startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 7);
            break;
        case "all-time":
        default:
            startDate = new Date("2020-01-01");
            break;
    }

    return { startDate, endDate };
}
