/**
 * Statistics API client
 * Client-safe API calls for fetching statistics and points data
 */

/**
 * Fetch points information from the stats API
 * Safe to use on both client and server side
 * @returns {Promise<Object>} Points data from API
 */
export async function fetchPointsFromAPI() {
    const baseUrl =
        typeof window !== "undefined"
            ? "" // Browser: use relative URL
            : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Server: use full URL

    try {
        const response = await fetch(`${baseUrl}/api/stats`);

        if (!response.ok) {
            throw new Error(
                `API request failed: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        return {
            content: "", // Not needed for client usage
            cards: data.cards || [],
            lastChanged: data.lastChanged,
            commitMessage: data.commitMessage || "",
            commitUrl: data.commitUrl || "",
            totalCards: data.totalCards || 0,
        };
    } catch (error) {
        console.error("Points API client error:", error);
        throw new Error(`Failed to fetch points data: ${error.message}`);
    }
}

/**
 * Fetch leaderboard data from API
 * @param {Object} params - Query parameters for leaderboard API
 * @returns {Promise<Object>} Leaderboard data from API
 */
export async function fetchLeaderboardFromAPI(params = {}) {
    const baseUrl =
        typeof window !== "undefined"
            ? ""
            : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const queryParams = new URLSearchParams(params);

    try {
        const response = await fetch(
            `${baseUrl}/api/leaderboard?${queryParams}`
        );

        if (!response.ok) {
            throw new Error(
                `Leaderboard API request failed: ${response.status}`
            );
        }

        return response.json();
    } catch (error) {
        console.error("Leaderboard API client error:", error);
        throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }
}
