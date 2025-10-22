import { notFound } from "next/navigation";
import {
    getDecksIncludingExcluding,
    getDecksLogicalInverse,
    getCardIDByName,
} from "@/lib/api_helpers";
import ResultsDisplay from "@/components/ResultsDisplay";

export default async function Page({ searchParams }) {
    const sp = await searchParams;
    const includes = sp?.includes
        ? sp.includes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
    const excludes = sp?.excludes
        ? sp.excludes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    // If no params provided, show a hint
    if (includes.length === 0 && excludes.length === 0) {
        return (
            <div className="p-4 text-neutral-300">
                <p>
                    Add <code>?includes=CardA,CardB</code> and/or{" "}
                    <code>&excludes=CardX,CardY</code> to the URL to see
                    filtered decks.
                </p>
            </div>
        );
    }

    // fetch rows
    const includesIDs = await Promise.all(
        includes.map(async (id) => (await getCardIDByName(id)).card_id)
    );

    const excludesIDs = await Promise.all(
        excludes.map(async (id) => (await getCardIDByName(id)).card_id)
    );

    const incExcRows = await getDecksIncludingExcluding(
        includesIDs,
        excludesIDs
    );
    const invRows = await getDecksLogicalInverse(includesIDs, excludesIDs);
    console.log("Included/Excluded Rows:", incExcRows.length);
    console.log("Inverse Rows:", invRows.length);

    if (!incExcRows?.length) {
        return (
            <div className="p-4">
                <h1>No decks found matching these filters.</h1>
            </div>
        );
    }

    return (
        <ResultsDisplay
            rawName={`Custom Search`}
            includes={incExcRows}
            excludes={invRows}
            searchParams={searchParams}
        />
    );
}
