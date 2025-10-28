/**
 * Database operations index
 * Centralized exports for all database operations
 */

// Database connection and utilities
export { query, pool } from "./db.js";

// Card operations
export { getCardIdByName, getDecksContainingCard } from "./card-operations.js";

// Deck operations
export {
    getDeckDetails,
    getDecksWithCardFilter,
    getDeckResultsForStats,
    getDecksLogicalInverse,
} from "./deck-operations.js";

// Leaderboard queries
export { getLeaderboardCardData } from "./leaderboard-queries.js";

// Legacy compatibility exports (to be removed gradually)
export { getCardIdByName as getCardIDByName } from "./card-operations.js";
export { getDecksWithCardFilter as getDecksIncludingExcluding } from "./deck-operations.js";
