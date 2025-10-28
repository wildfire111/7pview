/**
 * Points service
 * Handles GitHub API integration and points data processing
 */

import { getCardIdByName } from "@/lib/database/index.js";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cachedData = null;
let lastFetchTime = 0;

/**
 * Fetch points data from GitHub repository with caching
 * @returns {Promise<Object>} Points data with parsed cards and metadata
 */
export async function getPointsData() {
    const now = Date.now();

    // Return cached data if still valid
    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
        return cachedData;
    }

    const REPO_CONFIG = {
        owner: "Fryyyyy",
        repo: "decklist",
        path: "js/cards/highlander.txt",
        branch: "master",
    };

    try {
        // Fetch file content and commit information in parallel
        const [content, commitInfo] = await Promise.all([
            fetchFileContent(REPO_CONFIG),
            fetchCommitInfo(REPO_CONFIG),
        ]);

        // Parse the points file content
        const parsedCards = await parsePointsFile(content);

        const result = {
            content,
            cards: parsedCards,
            lastChanged: commitInfo?.commit?.committer?.date || null,
            commitMessage: commitInfo?.commit?.message || "",
            commitUrl: commitInfo?.html_url || "",
            totalCards: parsedCards.length,
        };

        // Update cache
        cachedData = result;
        lastFetchTime = now;

        return result;
    } catch (error) {
        console.error("Points service error:", error);

        // Return cached data if available, even if expired, rather than failing
        if (cachedData) {
            console.warn("Returning cached data due to GitHub API error");
            return cachedData;
        }

        throw new Error(`Failed to fetch points data: ${error.message}`);
    }
}

/**
 * Fetch file content from GitHub
 * @param {Object} config - Repository configuration
 * @returns {Promise<string>} File content
 */
async function fetchFileContent(config) {
    const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.path}`;

    const response = await fetch(rawUrl);
    if (!response.ok) {
        throw new Error(
            `Failed to fetch file content: ${response.status} ${response.statusText}`
        );
    }

    return response.text();
}

/**
 * Fetch latest commit information for the file
 * @param {Object} config - Repository configuration
 * @returns {Promise<Object>} Commit information
 */
async function fetchCommitInfo(config) {
    const apiUrl = `https://api.github.com/repos/${config.owner}/${
        config.repo
    }/commits?path=${encodeURIComponent(config.path)}&sha=${
        config.branch
    }&per_page=1`;

    const response = await fetch(apiUrl, {
        headers: {
            "User-Agent": "7pview-app",
        },
        next: { revalidate: 600 }, // Cache for 10 minutes using Next.js caching
    });

    if (!response.ok) {
        // If we hit rate limit or other errors, return a fallback
        if (response.status === 429 || response.status === 403) {
            console.warn(
                `GitHub API rate limited (${response.status}), using fallback data`
            );
            return {
                commit: {
                    committer: { date: new Date().toISOString() },
                    message: "Unable to fetch commit info (rate limited)",
                },
                html_url: "#",
            };
        }
        throw new Error(
            `Failed to fetch commit info: ${response.status} ${response.statusText}`
        );
    }

    const [commit] = await response.json();
    return commit;
}

/**
 * Parse points file content to extract card data
 * @param {string} content - Raw file content
 * @returns {Promise<Object[]>} Array of parsed card objects
 */
async function parsePointsFile(content) {
    const parsedCards = [];
    const lines = content.split("\n").filter((line) => line.trim());

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Parse line format: "Card Name Points"
        const lastSpaceIndex = trimmedLine.lastIndexOf(" ");
        if (lastSpaceIndex === -1) continue;

        const cardName = trimmedLine.substring(0, lastSpaceIndex).trim();
        const pointsStr = trimmedLine.substring(lastSpaceIndex + 1).trim();
        const points = parseInt(pointsStr, 10);

        if (!cardName || isNaN(points)) continue;

        // Resolve card name to Scryfall ID
        try {
            const cardInfo = await getCardIdByName(cardName);
            if (cardInfo.card_id) {
                parsedCards.push({
                    name: cardName,
                    points: points,
                    scryfall_id: cardInfo.card_id,
                });
            }
        } catch (err) {
            console.warn(`Could not resolve card: ${cardName}`, err.message);
        }
    }

    return parsedCards;
}
