"use client";

import { useState, useEffect } from "react";
import DeckTable from "@/components/DeckTable";
import DateControls from "@/components/DateControls";
import StatBoxBlock from "@/components/StatBoxBlock";
import { calculatePerformanceDelta } from "@/lib/statistics";

// helpers
const z2 = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
    `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export default function ResultsDisplay({
    rawName,
    includes,
    excludes,
    searchParams,
}) {
    const [pointsInfo, setPointsInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch points data on mount
    useEffect(() => {
        async function fetchPoints() {
            try {
                const response = await fetch("/api/stats");
                if (response.ok) {
                    const data = await response.json();
                    setPointsInfo(data);
                }
            } catch (error) {
                console.error("Failed to fetch points:", error);
                // Set fallback data
                setPointsInfo({
                    lastChanged: new Date().toISOString(),
                    commitMessage: "Unable to fetch points data",
                    commitUrl: "#",
                });
            } finally {
                setLoading(false);
            }
        }

        fetchPoints();
    }, []); // Empty dependency array - only fetch once on mount

    if (loading || !pointsInfo) {
        return <div className="p-4">Loading statistics...</div>;
    }

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
    const block1stats = calculatePerformanceDelta(
        includes,
        excludes,
        earliest,
        latest
    );
    const block2date1year = new Date();
    block2date1year.setFullYear(block2date1year.getFullYear() - 1);
    const block2date = new Date(Math.max(block2date1year, earliest));
    const block2stats = calculatePerformanceDelta(
        includes,
        excludes,
        block2date,
        new Date()
    );

    const block3date = new Date(pointsInfo.lastChanged);
    const block3stats = calculatePerformanceDelta(
        includes,
        excludes,
        block3date,
        new Date()
    );
    const block4stats = calculatePerformanceDelta(
        includes,
        excludes,
        startOfDay(new Date(startISOParam)),
        endOfDay(new Date(endISOParam))
    );

    const filtered = includes.filter((r) => {
        const d = new Date(r.event_date);
        return d >= startDate && d <= endDate;
    });

    const paginatedRows = filtered.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(filtered.length / limit);

    return (
        <main>
            <div className="mb-4">
                <h1 className="text-2xl font-bold mb-2">{rawName}</h1>
                <StatBoxBlock
                    block1stats={block1stats}
                    block2stats={block2stats}
                    block3stats={block3stats}
                    block4stats={block4stats}
                />
            </div>
            <DateControls
                initialStartISO={toISO(earliest)}
                initialEndISO={toISO(latest)}
                minISO={toISO(earliest)}
                maxISO={toISO(latest)}
            />
            <DeckTable
                rows={paginatedRows}
                page={page}
                totalPages={totalPages}
                totalResults={filtered.length}
            />
        </main>
    );
}
