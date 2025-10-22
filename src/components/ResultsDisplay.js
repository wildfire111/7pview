import DeckTable from "@/components/DeckTable";
import DateControls from "@/components/DateControls";
import StatBoxBlock from "@/components/StatBoxBlock";
import { calcCardArrayDelta } from "@/lib/calcs";
import { getPoints } from "@/lib/api_helpers";

// helpers
const z2 = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
    `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export default async function ResultsDisplay({
    rawName,
    includes,
    excludes,
    searchParams,
}) {
    const earliest = includes.reduce((min, r) => {
        const d = new Date(r.event_date);
        return d < min ? d : min;
    }, new Date(includes[0].event_date));

    const latest = includes.reduce((max, r) => {
        const d = new Date(r.event_date);
        return d > max ? d : max;
    }, new Date(includes[0].event_date));

    const sp = searchParams || {};
    const pageParam = Array.isArray(sp?.page) ? sp.page[0] : sp?.page;
    const page = Math.max(1, Number(pageParam || 1));
    const limit = 10;

    const startISOParam =
        typeof sp?.start === "string" ? sp.start : toISO(earliest);
    const endISOParam = typeof sp?.end === "string" ? sp.end : toISO(latest);

    const startDate = startOfDay(new Date(startISOParam));
    const endDate = endOfDay(new Date(endISOParam));

    // stats
    const block1stats = await calcCardArrayDelta(
        includes,
        excludes,
        earliest,
        latest
    );
    const block2date1year = new Date();
    block2date1year.setFullYear(block2date1year.getFullYear() - 1);
    const block2date = new Date(Math.max(block2date1year, earliest));
    const block2stats = await calcCardArrayDelta(
        includes,
        excludes,
        block2date,
        new Date()
    );
    const pointsInfo = await getPoints();
    const block3date = new Date(pointsInfo.lastChanged);
    const block3stats = await calcCardArrayDelta(
        includes,
        excludes,
        block3date,
        new Date()
    );
    const block4stats = await calcCardArrayDelta(
        includes,
        excludes,
        startOfDay(new Date(startISOParam)),
        endOfDay(new Date(endISOParam))
    );

    const filtered = includes.filter((r) => {
        const d = new Date(r.event_date);
        return d >= startDate && d <= endDate;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const sliceStart = (safePage - 1) * limit;
    const rows = filtered.slice(sliceStart, sliceStart + limit);

    return (
        <div className="p-4 space-y-4">
            <StatBoxBlock
                block1stats={block1stats}
                block2stats={block2stats}
                block3stats={block3stats}
                block4stats={block4stats}
            />

            {/* Date controls in a flex row */}
            <div className="flex flex-wrap items-center gap-4">
                <DateControls
                    initialStartISO={toISO(earliest)}
                    initialEndISO={toISO(latest)}
                    minISO={toISO(earliest)}
                    maxISO={toISO(latest)}
                />
            </div>

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
