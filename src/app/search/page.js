"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import CardSearchInput from "@/components/CardSearchInput";
import ResultsDisplay from "@/components/ResultsDisplay";

export default function Page() {
    const searchParams = useSearchParams();
    const [inputs, setInputs] = useState([{ id: 1, value: "", include: true }]);
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);

    // Initialize inputs from URL params
    useEffect(() => {
        const includes = searchParams.get("includes")
            ? searchParams
                  .get("includes")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : [];
        const excludes = searchParams.get("excludes")
            ? searchParams
                  .get("excludes")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : [];

        if (includes.length > 0 || excludes.length > 0) {
            const allInputs = [
                ...includes.map((value, index) => ({
                    id: index + 1,
                    value,
                    include: true,
                })),
                ...excludes.map((value, index) => ({
                    id: includes.length + index + 1,
                    value,
                    include: false,
                })),
            ];

            // Add empty input at the end if we have any inputs
            if (allInputs.length > 0) {
                allInputs.push({
                    id: allInputs.length + 1,
                    value: "",
                    include: true,
                });
            }

            setInputs(
                allInputs.length > 0
                    ? allInputs
                    : [{ id: 1, value: "", include: true }]
            );

            // Fetch search results
            fetchSearchResults(includes, excludes);
        }
    }, [searchParams]);

    const fetchSearchResults = async (includes, excludes) => {
        if (includes.length === 0 && excludes.length === 0) {
            setSearchResults(null);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    includes,
                    excludes,
                }),
            });

            if (!response.ok) {
                throw new Error("Search request failed");
            }

            const searchData = await response.json();
            setSearchResults(searchData);
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults({ hasResults: false, includes: [], excludes: [] });
        } finally {
            setLoading(false);
        }
    };
    const addInput = () => {
        setInputs((prev) => [
            ...prev,
            { id: prev.length + 1, value: "", include: true },
        ]);
    };

    const updateInput = (id, value) => {
        setInputs((prev) =>
            prev.map((inp) => (inp.id === id ? { ...inp, value } : inp))
        );
    };

    const toggleInclude = (id) => {
        setInputs((prev) =>
            prev.map((inp) =>
                inp.id === id ? { ...inp, include: !inp.include } : inp
            )
        );
    };

    const handleSubmit = () => {
        const includes = inputs
            .filter((i) => i.include && i.value)
            .map((i) => i.value);
        const excludes = inputs
            .filter((i) => !i.include && i.value)
            .map((i) => i.value);

        if (includes.length === 0 && excludes.length === 0) return;

        const params = new URLSearchParams();
        if (includes.length) params.set("includes", includes.join(","));
        if (excludes.length) params.set("excludes", excludes.join(","));

        // Update URL without full page reload
        window.history.pushState({}, "", `/search?${params.toString()}`);

        // Trigger search
        fetchSearchResults(includes, excludes);
    };

    // Get current search parameters for display
    const currentIncludes = searchParams.get("includes")
        ? searchParams
              .get("includes")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
    const currentExcludes = searchParams.get("excludes")
        ? searchParams
              .get("excludes")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    // If no params provided, show the search interface
    if (currentIncludes.length === 0 && currentExcludes.length === 0) {
        return (
            <div className="flex min-h-screen gap-6">
                <aside className="sticky top-0 h-screen w-120 shrink-0 border-r border-white/20">
                    <div className="py-4">
                        <div className="p-6 space-y-4">
                            <h1 className="text-xl font-semibold">
                                Advanced Search
                            </h1>

                            <div className="flex flex-col gap-3">
                                {inputs.map((inp, index) => {
                                    const isLast = index === inputs.length - 1;
                                    const label = inp.include ? "INC" : "EXC";
                                    const color = inp.include
                                        ? "success"
                                        : "danger";

                                    return (
                                        <div
                                            key={inp.id}
                                            className="flex items-center gap-2"
                                        >
                                            <Button
                                                color={color}
                                                variant="flat"
                                                radius="full"
                                                className="min-w-[4rem]"
                                                onPress={() =>
                                                    toggleInclude(inp.id)
                                                }
                                            >
                                                {label}
                                            </Button>

                                            <CardSearchInput
                                                value={inp.value}
                                                onChange={(v) =>
                                                    updateInput(inp.id, v)
                                                }
                                                hideButton={true}
                                            />

                                            {isLast && (
                                                <Button
                                                    isIconOnly
                                                    radius="full"
                                                    variant="flat"
                                                    color="primary"
                                                    onPress={addInput}
                                                    aria-label="Add another card"
                                                >
                                                    <Plus size={18} />
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-3">
                                <Button
                                    color="secondary"
                                    onPress={handleSubmit}
                                    isLoading={loading}
                                >
                                    Search All
                                </Button>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 py-4 overflow-auto">
                    <div className="p-4 text-neutral-300">
                        <p>
                            Use the search form on the left to find decks that
                            include or exclude specific cards.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen gap-6">
            <aside className="sticky top-0 h-screen w-120 shrink-0 border-r border-white/20">
                <div className="py-4">
                    <div className="p-6 space-y-4">
                        <h1 className="text-xl font-semibold">
                            Advanced Search
                        </h1>

                        <div className="flex flex-col gap-3">
                            {inputs.map((inp, index) => {
                                const isLast = index === inputs.length - 1;
                                const label = inp.include ? "INC" : "EXC";
                                const color = inp.include
                                    ? "success"
                                    : "danger";

                                return (
                                    <div
                                        key={inp.id}
                                        className="flex items-center gap-2"
                                    >
                                        <Button
                                            color={color}
                                            variant="flat"
                                            radius="full"
                                            className="min-w-[4rem]"
                                            onPress={() =>
                                                toggleInclude(inp.id)
                                            }
                                        >
                                            {label}
                                        </Button>

                                        <CardSearchInput
                                            value={inp.value}
                                            onChange={(v) =>
                                                updateInput(inp.id, v)
                                            }
                                            hideButton={true}
                                        />

                                        {isLast && (
                                            <Button
                                                isIconOnly
                                                radius="full"
                                                variant="flat"
                                                color="primary"
                                                onPress={addInput}
                                                aria-label="Add another card"
                                            >
                                                <Plus size={18} />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-3">
                            <Button
                                color="secondary"
                                onPress={handleSubmit}
                                isLoading={loading}
                            >
                                Search All
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 py-4 overflow-auto">
                {loading ? (
                    <div className="p-4 text-neutral-300">
                        <p>Loading search results...</p>
                    </div>
                ) : searchResults === null ? (
                    <div className="p-4 text-neutral-300">
                        <p>No search performed yet.</p>
                    </div>
                ) : !searchResults.hasResults ? (
                    <div className="p-4">
                        <h1>No decks found matching these filters.</h1>
                    </div>
                ) : (
                    <ResultsDisplay
                        rawName={`Custom Search`}
                        includes={searchResults.includes}
                        excludes={searchResults.excludes}
                        searchParams={searchParams}
                    />
                )}
            </main>
        </div>
    );
}
