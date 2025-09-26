"use client";

import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Button,
    Autocomplete,
    AutocompleteItem,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SiteNavbar() {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [debounced, setDebounced] = useState("");
    // suggestions are objects now: { id, label }
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestLoading, setIsSuggestLoading] = useState(false);
    const [isResolving, setIsResolving] = useState(false);

    // debounce the input
    useEffect(() => {
        const t = setTimeout(() => setDebounced(query.trim()), 250);
        return () => clearTimeout(t);
    }, [query]);

    // fetch suggestions on debounce
    useEffect(() => {
        if (!debounced) {
            setSuggestions([]);
            return;
        }
        const controller = new AbortController();
        const run = async () => {
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
                // map strings -> objects HeroUI can key by
                setSuggestions(names.map((n) => ({ id: n, label: n })));
            } catch (err) {
                if (err?.name !== "AbortError") {
                    console.error("Autocomplete failed", err);
                }
                setSuggestions([]);
            } finally {
                setIsSuggestLoading(false);
            }
        };
        run();
        return () => controller.abort();
    }, [debounced]);

    const resolveAndRoute = (name) => {
        const q = name.trim();
        if (!q) return;
        router.push(`/card/${encodeURIComponent(q)}`);
    };

    const onSelectionChange = (key) => {
        const name = key ? String(key) : "";
        if (!name) return;
        setQuery(name);
        resolveAndRoute(name);
    };

    const onSubmit = () => resolveAndRoute(query);

    return (
        <Navbar
            isBlurred
            maxWidth="lg"
            position="sticky"
            className="bg-primary-900 text-white"
        >
            <NavbarBrand>
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-white"
                >
                    <span>7PView</span>
                </Link>
            </NavbarBrand>

            <NavbarContent justify="end">
                <NavbarItem>
                    <div className="flex items-center gap-1">
                        <Autocomplete
                            aria-label="Card search"
                            allowsCustomValue
                            menuTrigger="input"
                            inputValue={query}
                            onInputChange={setQuery}
                            onSelectionChange={onSelectionChange}
                            isLoading={isSuggestLoading}
                            placeholder="Search card..."
                            startContent={
                                <span className="text-gray-400">🔍</span>
                            }
                            className="w-72 md:w-96"
                            classNames={{
                                input: "text-white placeholder:text-gray-400",
                                inputWrapper:
                                    "bg-primary-800 border-primary-700",
                                listboxWrapper: "bg-primary-800",
                                popoverContent:
                                    "bg-primary-800 text-white border border-primary-700",
                            }}
                            items={suggestions}
                        >
                            {(item) => (
                                <AutocompleteItem
                                    key={item.id}
                                    value={item.label}
                                >
                                    {item.label}
                                </AutocompleteItem>
                            )}
                        </Autocomplete>

                        <Button
                            color="secondary"
                            variant="flat"
                            isLoading={isResolving}
                            onPress={onSubmit}
                        >
                            Search
                        </Button>
                    </div>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    );
}
