import { notFound } from "next/navigation";
import { getCardIdByName } from "@/lib/database";
import {
    getDecksIncludingExcluding,
    getDecksLogicalInverse,
} from "@/lib/database";
import ResultsDisplay from "@/components/ResultsDisplay";

export default async function Page({ params, searchParams }) {
    const { name } = await params;
    const rawName = decodeURIComponent(name);

    // verify card via Scryfall fuzzy lookup so bad names 404 fast
    const url = new URL("https://api.scryfall.com/cards/named");
    url.searchParams.set("fuzzy", rawName);
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return notFound();
    if (!res.ok) return notFound();

    const card = await getCardIdByName(rawName).catch(() => null);
    if (!card?.card_id) return notFound();

    // Fetch lists. Pass raw rows to the component so it can do all calculating
    const includes = await getDecksIncludingExcluding([card.card_id], []);
    const excludes = await getDecksLogicalInverse([card.card_id], []);

    if (!includes?.length) {
        return (
            <div className="p-4">
                <h1>No decks found for {rawName}</h1>
            </div>
        );
    }

    return (
        <ResultsDisplay
            rawName={rawName}
            includes={includes}
            excludes={excludes}
            searchParams={searchParams}
        />
    );
}
