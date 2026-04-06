/**
 * Shared test fixtures for statistics module tests
 */

// 10 valid decks: large events (>16 players), placements spread 0.1–0.9
export const validDeckArray = [
    { deck_id: 1, max_players: 32, normalised_placement: 0.1, event_date: "2023-01-15" },
    { deck_id: 2, max_players: 64, normalised_placement: 0.2, event_date: "2023-03-10" },
    { deck_id: 3, max_players: 32, normalised_placement: 0.3, event_date: "2023-05-20" },
    { deck_id: 4, max_players: 128, normalised_placement: 0.4, event_date: "2023-07-01" },
    { deck_id: 5, max_players: 32, normalised_placement: 0.5, event_date: "2023-09-14" },
    { deck_id: 6, max_players: 64, normalised_placement: 0.6, event_date: "2023-11-05" },
    { deck_id: 7, max_players: 32, normalised_placement: 0.7, event_date: "2024-01-22" },
    { deck_id: 8, max_players: 64, normalised_placement: 0.8, event_date: "2024-03-08" },
    { deck_id: 9, max_players: 32, normalised_placement: 0.15, event_date: "2024-05-19" },
    { deck_id: 10, max_players: 128, normalised_placement: 0.25, event_date: "2024-07-30" },
];

// All decks from small events (max_players <= 16) — all filtered out by CI calculation
export const smallEventDeckArray = [
    { deck_id: 11, max_players: 8, normalised_placement: 0.1, event_date: "2023-01-15" },
    { deck_id: 12, max_players: 16, normalised_placement: 0.5, event_date: "2023-06-01" },
    { deck_id: 13, max_players: 12, normalised_placement: 0.9, event_date: "2024-01-01" },
];

// Mix of valid and small-event decks
export const mixedDeckArray = [
    { deck_id: 14, max_players: 32, normalised_placement: 0.2, event_date: "2023-02-01" },
    { deck_id: 15, max_players: 8, normalised_placement: 0.5, event_date: "2023-04-01" },
    { deck_id: 16, max_players: 64, normalised_placement: 0.4, event_date: "2023-08-01" },
    { deck_id: 17, max_players: 16, normalised_placement: 0.9, event_date: "2023-10-01" },
];

// Empty array
export const emptyDeckArray = [];

// A second valid deck array with slightly better (lower) placements — for delta testing
export const betterDeckArray = [
    { deck_id: 21, max_players: 32, normalised_placement: 0.05, event_date: "2023-01-15" },
    { deck_id: 22, max_players: 64, normalised_placement: 0.1, event_date: "2023-03-10" },
    { deck_id: 23, max_players: 32, normalised_placement: 0.15, event_date: "2023-05-20" },
    { deck_id: 24, max_players: 128, normalised_placement: 0.2, event_date: "2023-07-01" },
    { deck_id: 25, max_players: 32, normalised_placement: 0.25, event_date: "2023-09-14" },
];
