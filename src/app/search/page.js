"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import CardSearchInput from "@/components/CardSearchInput";
import ResultsDisplay from "@/components/ResultsDisplay";
import NotFound from "@/components/NotFound";

function SearchPage() {
    const searchParams = useSearchParams();
    const [inputs, setInputs] = useState([{ id: 1, value: "", include: true }]);
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastSearchCriteria, setLastSearchCriteria] = useState(null);

    useEffect(() => {
        const includes = searchParams.get("includes")
            ? searchParams
                  .get("includes")
                  .split("|")
                  .map((s) => s.trim())
                  .filter(Boolean)
            : [];
        const excludes = searchParams.get("excludes")
            ? searchParams
                  .get("excludes")
                  .split("|")
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

            fetchSearchResults(includes, excludes);
        }
    }, [searchParams]);

    const fetchSearchResults = async (includes, excludes) => {
        if (includes.length === 0 && excludes.length === 0) {
            setSearchResults(null);
            setLastSearchCriteria(null);
            return;
        }

        // Store search criteria for NotFound component
        setLastSearchCriteria({ includes, excludes });
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

            const searchData = await response.json();

            if (!response.ok) {
                // Handle the case where some cards were not found
                if (
                    response.status === 404 &&
                    searchData.missingIncludes !== undefined
                ) {
                    setSearchResults({
                        hasResults: false,
                        error: "cards_not_found",
                        missingIncludes: searchData.missingIncludes || [],
                        missingExcludes: searchData.missingExcludes || [],
                    });
                } else {
                    throw new Error(
                        searchData.error || "Search request failed"
                    );
                }
            } else {
                setSearchResults(searchData);
            }
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
        if (includes.length) params.set("includes", includes.join("|"));
        if (excludes.length) params.set("excludes", excludes.join("|"));

        window.history.pushState({}, "", `/search?${params.toString()}`);
        fetchSearchResults(includes, excludes);
    };

    const currentIncludes = searchParams.get("includes")
        ? searchParams
              .get("includes")
              .split("|")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
    const currentExcludes = searchParams.get("excludes")
        ? searchParams
              .get("excludes")
              .split("|")
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    if (currentIncludes.length === 0 && currentExcludes.length === 0) {
        return (
            <div className="flex flex-col lg:flex-row min-h-screen gap-6">
                <aside className="w-full lg:sticky lg:top-0 lg:h-screen lg:w-120 lg:shrink-0 border-b lg:border-r lg:border-b-0 border-white/20">
                    <div className="py-4">
                        <div className="p-4 lg:p-6 space-y-4">
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
                            Use the search form{" "}
                            <span className="lg:hidden">above</span>
                            <span className="hidden lg:inline">
                                on the left
                            </span>{" "}
                            to find decks that include or exclude specific
                            cards.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen gap-6">
            <aside className="w-full lg:sticky lg:top-0 lg:h-screen lg:w-120 lg:shrink-0 border-b lg:border-r lg:border-b-0 border-white/20">
                <div className="py-4">
                    <div className="p-4 lg:p-6 space-y-4">
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
                    searchResults.error === "cards_not_found" ? (
                        <div className="p-4">
                            <NotFound
                                title="Search Not Found"
                                message="The following cards were not found in our database:"
                                missingIncludes={searchResults.missingIncludes}
                                missingExcludes={searchResults.missingExcludes}
                                suggestions={[
                                    "Check for typos and try again. If your card is not in Scryfall you will also see this error.",
                                ]}
                            />
                        </div>
                    ) : (
                        <div className="p-4">
                            <NotFound
                                title="No Decks Found"
                                message="No decks in our database match your search criteria."
                                searchCriteria={lastSearchCriteria}
                                suggestions={[
                                    "Check for typos and try again. If your card is not in Scryfall you will also see this error.",
                                ]}
                            />
                        </div>
                    )
                ) : (
                    <ResultsDisplay
                        rawName={(() => {
                            const includeCards =
                                lastSearchCriteria?.includes || [];
                            const excludeCards =
                                lastSearchCriteria?.excludes || [];

                            const lines = [];
                            if (includeCards.length > 0) {
                                lines.push(
                                    `Include: ${includeCards.join(", ")}`
                                );
                            }
                            if (excludeCards.length > 0) {
                                lines.push(
                                    `Exclude: ${excludeCards.join(", ")}`
                                );
                            }
                            return lines.join("\n");
                        })()}
                        includes={searchResults.includes}
                        excludes={searchResults.excludes}
                        searchParams={searchParams}
                    />
                )}
            </main>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-4">Loading search...</div>}>
            <SearchPage />
        </Suspense>
    );
}
