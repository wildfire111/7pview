import { notFound } from "next/navigation";
import { getCardIDByName } from "@/lib/api_helpers";
import { getDecksContainingCard } from "@/lib/api_helpers";
import { getDeckDetails } from "@/lib/api_helpers";

export default async function Page({ params }) {
    const { name } = await params;
    const rawName = decodeURIComponent(name);

    const url = new URL("https://api.scryfall.com/cards/named");
    url.searchParams.set("fuzzy", rawName);

    const res = await fetch(url, { cache: "no-store" });

    if (res.status === 404) {
        console.log("404 error for", name);
        return notFound();
    }
    if (!res.ok) {
        console.log("Error fetching card:", res.statusText);
        return notFound();
    }
    const cardID = await getCardIDByName(rawName);
    console.log("Fetched card ID:", cardID);

    const deck_ids = await getDecksContainingCard(cardID.card_id);
    const deck_details = await getDeckDetails(deck_ids);

    return (
        <div className="p-4">
            <h2 className="mb-4 text-2xl font-bold">
                Decks containing "{rawName}"
            </h2>
            {deck_details.length === 0 ? (
                <p>No decks found containing this card.</p>
            ) : (
                <ul className="space-y-4">
                    {deck_details.map((deck) => (
                        <li
                            key={deck.deck_id}
                            className="rounded-lg bg-primary-800 p-4 shadow"
                        >
                            <h3 className="text-xl font-semibold">
                                {deck.archetype_name}
                            </h3>
                            <p>
                                Player:{" "}
                                <span className="font-medium">
                                    {deck.player_name}
                                </span>
                            </p>
                            <p>
                                Event:{" "}
                                <span className="font-medium">
                                    {deck.event_name}
                                </span>{" "}
                                (
                                {new Date(deck.event_date).toLocaleDateString()}
                                )
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
