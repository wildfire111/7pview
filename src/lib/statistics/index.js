/**
 * Statistics module index
 * Centralized exports for all statistical calculations
 */

// Confidence intervals
export {
    calculateMeanAndConfidenceInterval,
    calculateConfidenceInterval,
} from "./confidence-intervals.js";

// Performance metrics
export {
    calculatePerformanceDelta,
    calculateConservativeScore,
    rankCardsByPerformance,
} from "./performance-metrics.js";

// Date filtering
export {
    filterDecksByDateRange,
    getDateRangeFromDecks,
    formatDateForAPI,
    createDateRangeForPeriod,
} from "./date-filters.js";

// Legacy compatibility exports
export { calculateMeanAndConfidenceInterval as calcMeanAnd95CI } from "./confidence-intervals.js";
export { calculatePerformanceDelta as calcCardArrayDelta } from "./performance-metrics.js";
export { filterDecksByDateRange as filterDates } from "./date-filters.js";
