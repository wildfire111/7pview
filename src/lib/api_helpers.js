import { query } from "@/lib/db";

export async function getCardIDByName(name) {
    try {
        const { rows } = await query(
            "SELECT scryfall_id FROM cards WHERE name = $1 LIMIT 1",
            [name]
        );
        const cardId = rows[0]?.scryfall_id ?? null;
        return { card_id: cardId };
    } catch (err) {
        console.error("DB error:", err);
        throw err;
    }
}

export async function getDecksContainingCard(cardId) {
    try {
        const { rows } = await query(
            `SELECT d.id AS deck_id
            from decks d
            JOIN deck_cards dc ON d.id = dc.deck_id
            WHERE dc.card_id = $1`,
            [cardId]
        );
        return rows.map((r) => r.deck_id);
    } catch (err) {
        console.error("DB error:", err);
        throw err;
    }
}

export async function getDeckDetails(deck_array) {
    if (deck_array.length === 0) return [];
    let deck_detail_array = [];
    try {
        for (let i = 0; i < deck_array.length; i++) {
            const deck_id = deck_array[i];
            const { rows } = await query(
                `SELECT d.id AS deck_id, 
                d.archetype, 
                p.name AS player_name, 
                e.name AS event_name, 
                e.date AS event_date
            FROM decks d
            JOIN players p ON d.player_id = p.id
            JOIN events e ON d.event_id = e.id
            WHERE d.id = $1`,
                [deck_id]
            );
            if (rows.length > 0) {
                deck_detail_array.push(rows[0]);
            }
        }

        return deck_detail_array;
    } catch (err) {
        console.error("DB error:", err);
        throw err;
    }
}

export async function getDecksIncludingExcluding(includeList, excludeList) {
    //One sql query to return a list of normalised placings (deck placing/event size) for decks
    // containing all of the cards in cardIDList
    console.log(
        "Fetching decks with includes:",
        includeList,
        "excludes:",
        excludeList
    );
    try {
        const sqlQuery = `
            /* First we unpack the include and exclude card lists into table rows */
            WITH include(card_id) AS ( 
                SELECT unnest($1::text[])
            ),
            exclude(card_id) AS (
                SELECT unnest($2::text[])
            ),

            /* Decks that contain all the included cards; if include is empty, take all decks */
            deck_hit AS (
                SELECT d.id AS deck_id
                FROM decks d
                WHERE (SELECT COUNT(*) FROM include) = 0
                UNION
                SELECT dc.deck_id
                FROM deck_cards dc
                JOIN include w ON w.card_id = dc.card_id
                GROUP BY dc.deck_id
                HAVING COUNT(DISTINCT w.card_id) = (SELECT COUNT(*) FROM include)
            ),

            /* Decks that contain none of the excluded cards (if exclude is empty, this passes everyone) */
            deck_clean AS (
                SELECT d.id
                FROM decks d
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM deck_cards dc
                    JOIN exclude b ON b.card_id = dc.card_id
                    WHERE dc.deck_id = d.id
                )
            )

            SELECT d.id AS deck_id,
                d.moxfield_id,
                d.archetype,
                p.name  AS player_name,
                e.name  AS event_name,
                e.date  AS event_date,
                d.placement AS raw_placement,
                (d.placement::float / e.num_players::float) AS normalised_placement,
                e.num_players AS max_players
            FROM deck_hit dh
            JOIN deck_clean c ON c.id = dh.deck_id
            JOIN decks d      ON d.id = dh.deck_id
            JOIN events e     ON e.id = d.event_id
            JOIN players p    ON p.id = d.player_id
            ORDER BY e.date DESC, e.name DESC, d.placement ASC;

            `;
        const { rows } = await query(sqlQuery, [includeList, excludeList]);
        return rows;
    } catch (err) {
        console.error("DB error:", err);
        throw err;
    }
}

export async function getDecksLogicalInverse(includeList, excludeList) {
    // A = decks that satisfy include ∧ no excludes
    const A = await getDecksIncludingExcluding(includeList, excludeList);

    // U = all decks  (requires removing the early return)
    const U = await getDecksIncludingExcluding([], []);

    // U \ A = logical complement
    const aIds = new Set(A.map((d) => d.deck_id));
    const inverse = U.filter((d) => !aIds.has(d.deck_id));

    return inverse;
}

export async function getPoints() {
    const owner = "Fryyyyy";
    const repo = "decklist";
    const path = "js/cards/highlander.txt";
    const branch = "master";

    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const textResp = await fetch(rawUrl);
    if (!textResp.ok) {
        throw new Error(
            `Couldn't fetch file content. Status: ${textResp.status} ${textResp.statusText}`
        );
    }
    const content = await textResp.text();

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(
        path
    )}&sha=${branch}&per_page=1`;

    const commitResp = await fetch(apiUrl);
    if (!commitResp.ok) {
        const errorBody = await commitResp.text().catch(() => "Unknown error");
        throw new Error(
            `Couldn't fetch commit info. Status: ${commitResp.status} ${commitResp.statusText}. Response: ${errorBody}`
        );
    }

    const commits = await commitResp.json();
    const commit = commits[0];

    return {
        content,
        lastChanged: commit?.commit?.committer?.date || null,
        commitMessage: commit?.commit?.message || "",
        commitUrl: commit?.html_url || "",
    };
}
