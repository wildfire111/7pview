import { notFound } from "next/navigation";
import { getCardIdByName } from "@/lib/database";
import {
    getDecksIncludingExcluding,
    getDecksLogicalInverse,
} from "@/lib/database";
import ResultsDisplay from "@/components/ResultsDisplay";

export default async function Page({ params, searchParams }) {
    const { name } = await params;
    const resolvedSearchParams = await searchParams;

    // Safely decode the card name
    let cardName;
    try {
        cardName = decodeURIComponent(name);
    } catch (error) {
        return notFound();
    }

    // verify card via Scryfall fuzzy lookup so bad names 404 fast
    const url = new URL("https://api.scryfall.com/cards/named");
    url.searchParams.set("fuzzy", cardName);
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return notFound();
    if (!res.ok) return notFound();

    const card = await getCardIdByName(cardName).catch(() => null);
    if (!card?.card_id) return notFound();

    // Fetch lists. Pass raw rows to the component so it can do all calculating
    const includes = await getDecksIncludingExcluding([card.card_id], []);
    const excludes = await getDecksLogicalInverse([card.card_id], []);

    if (!includes?.length) {
        return (
            <div className="p-4">
                <h1>No decks found for {cardName}</h1>
            </div>
        );
    }

    return (
        <ResultsDisplay
            rawName={cardName}
            includes={includes}
            excludes={excludes}
            searchParams={resolvedSearchParams}
        />
    );
}
