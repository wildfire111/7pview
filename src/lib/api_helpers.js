import { query } from "@/lib/db";

export async function getCardIDByName(name) {
    try {
        const { rows } = await query(
            "SELECT id FROM cards WHERE name = $1 LIMIT 1",
            [name]
        );
        const cardId = rows[0]?.id ?? null;
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
//  table_name |  column_name   | data_type
// ------------+----------------+-----------
//  cards      | id             | integer
//  cards      | name           | text
//  cards      | scryfall_id    | text
//  deck_cards | deck_id        | integer
//  deck_cards | card_id        | integer
//  deck_cards | board          | text
//  deck_cards | quantity       | integer
//  decks      | id             | integer
//  decks      | player_id      | integer
//  decks      | event_id       | integer
//  decks      | archetype_name | text
//  decks      | moxfield_id    | text
//  events     | id             | integer
//  events     | name           | text
//  events     | date           | date
//  players    | id             | integer
//  players    | name           | text
export async function getDeckDetails(deck_array) {
    if (deck_array.length === 0) return [];
    let deck_detail_array = [];
    try {
        for (let i = 0; i < deck_array.length; i++) {
            const deck_id = deck_array[i];
            const { rows } = await query(
                `SELECT d.id AS deck_id, 
                d.archetype_name, 
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
