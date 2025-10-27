"use client";

import { useState, useEffect, useMemo } from "react";
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

export default function ResultsDisplay({
    rawName,
    includes,
    excludes,
    searchParams,
}) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // Memoize the calculated dates to prevent infinite re-renders
    const { earliest, latest, startDate, endDate, page } = useMemo(() => {
        if (!includes?.length) {
            const now = new Date();
            return {
                earliest: now,
                latest: now,
                startDate: now,
                endDate: now,
                page: 1,
            };
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
        const pageParam = sp.get?.("page");
        const page = Math.max(1, Number(pageParam || 1));

        const startISOParam = sp.get?.("start") || toISO(earliest);
        const endISOParam = sp.get?.("end") || toISO(latest);

        const startDate = startOfDay(new Date(startISOParam));
        const endDate = endOfDay(new Date(endISOParam));

        return { earliest, latest, startDate, endDate, page };
    }, [includes, excludes, searchParams]);

    const limit = 10;

    // Fetch stats when component mounts or data changes
    useEffect(() => {
        const fetchStats = async () => {
            if (!includes?.length) return;

            setLoading(true);
            try {
                const block2date1year = new Date();
                block2date1year.setFullYear(block2date1year.getFullYear() - 1);
                const block2date = new Date(
                    Math.max(block2date1year, earliest)
                );

                const response = await fetch("/api/stats", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        includes,
                        excludes,
                        dateRanges: {
                            earliest: earliest.toISOString(),
                            latest: latest.toISOString(),
                            block2date: block2date.toISOString(),
                            startDate: startDate.toISOString(),
                            endDate: endDate.toISOString(),
                        },
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch stats");
                }

                const statsData = await response.json();
                setStats(statsData);
            } catch (error) {
                console.error("Stats fetch error:", error);
                setStats({
                    block1stats: {
                        delta: 0,
                        incExcCount: 0,
                        invCount: 0,
                        CI: 0,
                    },
                    block2stats: {
                        delta: 0,
                        incExcCount: 0,
                        invCount: 0,
                        CI: 0,
                    },
                    block3stats: {
                        delta: 0,
                        incExcCount: 0,
                        invCount: 0,
                        CI: 0,
                    },
                    block4stats: {
                        delta: 0,
                        incExcCount: 0,
                        invCount: 0,
                        CI: 0,
                    },
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [includes, excludes, earliest, latest, startDate, endDate]);

    const filtered = includes.filter((r) => {
        const d = new Date(r.event_date);
        return d >= startDate && d <= endDate;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const sliceStart = (safePage - 1) * limit;
    const rows = filtered.slice(sliceStart, sliceStart + limit);

    if (loading || !stats) {
        return (
            <div className="p-4 space-y-4">
                <div className="animate-pulse">
                    <div className="h-24 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <StatBoxBlock
                block1stats={stats.block1stats}
                block2stats={stats.block2stats}
                block3stats={stats.block3stats}
                block4stats={stats.block4stats}
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
