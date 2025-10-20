"use client";

import { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem, Button } from "@heroui/react";

export default function CardSearchInput({
    value = "",
    onChange, // (v: string) => void
    onSubmit, // (v: string) => void (optional)
    className = "w-72 md:w-96",
    debounceMs = 250,
    hideButton = false,
}) {
    const [query, setQuery] = useState(value ?? "");
    const [debounced, setDebounced] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestLoading, setIsSuggestLoading] = useState(false);
    const [isResolving, setIsResolving] = useState(false);

    // keep internal state in sync when parent updates `value`
    useEffect(() => {
        setQuery(value ?? "");
    }, [value]);

    // debounce input for API calls
    useEffect(() => {
        const t = setTimeout(
            () => setDebounced((query || "").trim()),
            debounceMs
        );
        return () => clearTimeout(t);
    }, [query, debounceMs]);

    // fetch Scryfall suggestions on debounced value
    useEffect(() => {
        if (!debounced) {
            setSuggestions([]);
            return;
        }
        const controller = new AbortController();

        (async () => {
            setIsSuggestLoading(true);
            try {
                const r = await fetch(
                    `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(
                        debounced
                    )}`,
                    { signal: controller.signal }
                );
                const j = await r.json();
                const names = Array.isArray(j?.data) ? j.data.slice(0, 20) : [];
                // Autocomplete expects items; each needs a stable key
                setSuggestions(names.map((n) => ({ id: n, label: n })));
            } catch (err) {
                if (err?.name !== "AbortError")
                    console.error("Autocomplete failed", err);
                setSuggestions([]);
            } finally {
                setIsSuggestLoading(false);
            }
        })();

        return () => controller.abort();
    }, [debounced]);

    const resolveAndSubmit = (name) => {
        const q = (name ?? "").trim();
        if (!q) return;
        setIsResolving(true);
        Promise.resolve(onSubmit?.(q)).finally(() => setIsResolving(false));
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Autocomplete
                aria-label="Card search"
                allowsCustomValue
                menuTrigger="input" // <-- opens list while typing
                items={suggestions} // <-- feed items
                inputValue={query} // controlled value
                onInputChange={(v) => {
                    // update local + parent
                    setQuery(v);
                    onChange?.(v);
                }}
                onSelectionChange={(key) => {
                    const v = key ? String(key) : "";
                    setQuery(v);
                    onChange?.(v);
                    resolveAndSubmit(v);
                }}
                isLoading={isSuggestLoading}
                placeholder="Search card..."
                startContent={<span className="text-foreground-500">🔍</span>}
                className="flex-1"
                classNames={{
                    base: "text-foreground",
                    inputWrapper:
                        "bg-content2 border border-divider data-[hover=true]:bg-content2 data-[focus=true]:bg-content2",
                    input: "text-foreground placeholder:text-foreground-500",
                    clearButton: "text-foreground-500",
                    listboxWrapper: "bg-content2",
                    popoverContent:
                        "bg-content2 text-foreground border border-divider shadow-medium",
                }}
            >
                {(item) => (
                    <AutocompleteItem key={item.id} value={item.label}>
                        {item.label}
                    </AutocompleteItem>
                )}
            </Autocomplete>

            {!hideButton && (
                <Button
                    color="secondary"
                    variant="flat"
                    isLoading={isResolving}
                    onPress={() => resolveAndSubmit(query)}
                >
                    Search
                </Button>
            )}
        </div>
    );
}
