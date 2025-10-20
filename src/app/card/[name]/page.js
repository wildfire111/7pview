import { notFound } from "next/navigation";
import {
    getCardIDByName,
    getDecksIncludingExcluding,
    getDecksLogicalInverse,
} from "@/lib/api_helpers";
import { calcCardArrayDelta } from "@/lib/calcs";
import DeckTable from "@/components/DeckTable";
import DateControls from "@/components/DateControls";
import StatBoxBlock from "@/components/StatBoxBlock";

// helpers
const z2 = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
    `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export default async function Page({ params, searchParams }) {
    const { name } = await params;
    const rawName = decodeURIComponent(name);

    const sp = await searchParams;
    const pageParam = Array.isArray(sp?.page) ? sp.page[0] : sp?.page;
    const page = Math.max(1, Number(pageParam || 1));
    const limit = 10;

    // verify card
    const url = new URL("https://api.scryfall.com/cards/named");
    url.searchParams.set("fuzzy", rawName);
    const res = await fetch(url, { cache: "no-store" });
    if (res.status === 404) return notFound();
    if (!res.ok) return notFound();

    const card = await getCardIDByName(rawName).catch(() => null);
    if (!card?.card_id) return notFound();

    //BOXES
    const incExcRows = await getDecksIncludingExcluding([card.card_id], []);
    const invRows = await getDecksLogicalInverse([card.card_id], []);
    if (!incExcRows?.length) {
        return (
            <div className="p-4">
                <h1>No decks found for {rawName}</h1>
            </div>
        );
    }
    // bounds from data
    const earliest = incExcRows.reduce((min, r) => {
        const d = new Date(r.event_date);
        return d < min ? d : min;
    }, new Date(incExcRows[0].event_date));

    const latest = incExcRows.reduce((max, r) => {
        const d = new Date(r.event_date);
        return d > max ? d : max;
    }, new Date(incExcRows[0].event_date));

    // selected dates from URL or defaults
    const startISOParam =
        typeof sp?.start === "string" ? sp.start : toISO(earliest);
    const endISOParam = typeof sp?.end === "string" ? sp.end : toISO(latest);

    // inclusive window
    const startDate = startOfDay(new Date(startISOParam));
    const endDate = endOfDay(new Date(endISOParam));

    // delta in window
    const block1stats = await calcCardArrayDelta(
        incExcRows,
        invRows,
        earliest,
        latest
    );
    const block2date1year = new Date();
    block2date1year.setFullYear(block2date1year.getFullYear() - 1);
    const block2date = new Date(Math.max(block2date1year, earliest));
    const block2stats = await calcCardArrayDelta(
        incExcRows,
        invRows,
        block2date,
        new Date()
    );
    const block3date = new Date();
    block3date.setMonth(block3date.getMonth() - 3);
    const block3stats = await calcCardArrayDelta(
        incExcRows,
        invRows,
        block3date,
        new Date()
    );
    const block4stats = await calcCardArrayDelta(
        incExcRows,
        invRows,
        startOfDay(new Date(startISOParam)),
        endOfDay(new Date(endISOParam))
    );

    // table respects window
    const filteredIncExc = incExcRows.filter((r) => {
        const d = new Date(r.event_date);
        return d >= startDate && d <= endDate;
    });

    // paginate filtered
    const total = filteredIncExc.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const rows = filteredIncExc.slice(start, start + limit);

    return (
        <div className="p-4 space-y-4">
            {/* top stat boxes */}
            <StatBoxBlock
                block1stats={block1stats}
                block2stats={block2stats}
                block3stats={block3stats}
                block4stats={block4stats}
            />

            <DateControls
                initialStartISO={toISO(earliest)}
                initialEndISO={toISO(latest)}
                minISO={toISO(earliest)}
                maxISO={toISO(latest)}
            />
            {rows.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No decks in this date range.
                </p>
            ) : (
                <DeckTable
                    rawName={rawName}
                    rows={rows}
                    page={safePage}
                    totalPages={totalPages}
                />
            )}
        </div>
    );
}
