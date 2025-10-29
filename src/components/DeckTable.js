"use client";

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Link,
    Chip,
    Tooltip,
    Pagination,
} from "@heroui/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function DeckTable({ rawName, rows, page = 1, totalPages = 1 }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const goToPage = (p) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.set("page", String(p));
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const formatDate = (iso) =>
        new Date(iso).toLocaleDateString("en-AU", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    const toPct = (v) =>
        typeof v === "number" ? `${(v * 100).toFixed(1)}` : "N/A";

    const moxUrl = (id) => (id ? `https://www.moxfield.com/decks/${id}` : null);

    if (!rows?.length) {
        return (
            <p className="text-neutral-400 text-sm">
                No decks found containing this card.
            </p>
        );
    }

    return (
        <div className="bg-neutral-950 text-neutral-100 rounded-xl p-0">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                    Decks containing &quot;{rawName}&quot;
                </h2>

                <Pagination
                    total={totalPages}
                    page={page}
                    onChange={goToPage}
                    showControls
                    size="sm"
                    // style pagination pills + icons
                    classNames={{
                        base: "gap-2",
                        wrapper: "bg-transparent",
                        item: "bg-neutral-800 text-neutral-100 data-[active=true]:bg-blue-600 data-[active=true]:text-white",
                        cursor: "bg-blue-600 text-white",
                        next: "text-neutral-200",
                        prev: "text-neutral-200",
                    }}
                />
            </div>

            <Table
                aria-label="Deck results for card"
                classNames={{
                    wrapper:
                        "bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm",
                    th: "bg-neutral-850/100 text-neutral-300 font-semibold border-r border-neutral-800 last:border-r-0",
                    td: "bg-neutral-900 text-neutral-100 text-sm border-r border-neutral-800 last:border-r-0",
                    tr: "hover:bg-neutral-850",
                    thead: "sticky top-0 z-10",
                }}
            >
                <TableHeader>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Event</TableColumn>
                    <TableColumn>Player</TableColumn>
                    <TableColumn>Archetype</TableColumn>
                    <TableColumn>Placement</TableColumn>
                    <TableColumn>Normalised</TableColumn>
                    <TableColumn align="end">Moxfield</TableColumn>
                </TableHeader>

                <TableBody emptyContent="No rows">
                    {rows.map((d) => {
                        const url = moxUrl(d.moxfield_id);
                        return (
                            <TableRow key={String(d.deck_id)}>
                                <TableCell>
                                    {formatDate(d.event_date)}
                                </TableCell>

                                <TableCell>
                                    <Tooltip
                                        content={d.event_name}
                                        className="max-w-xs"
                                    >
                                        <span className="truncate max-w-[22ch] inline-block align-bottom text-neutral-200">
                                            {d.event_name}
                                        </span>
                                    </Tooltip>
                                </TableCell>

                                <TableCell className="text-neutral-200">
                                    {d.player_name}
                                </TableCell>

                                <TableCell>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        // override visuals so we don’t depend on theme tokens
                                        classNames={{
                                            base: "bg-neutral-800 text-neutral-100 border border-neutral-700",
                                            content: "px-2",
                                        }}
                                    >
                                        {d.archetype || "Unknown"}
                                    </Chip>
                                </TableCell>

                                <TableCell className="text-neutral-200">
                                    {d.raw_placement}/{d.max_players}
                                </TableCell>

                                <TableCell className="text-neutral-200">
                                    {toPct(d.normalised_placement)}
                                </TableCell>

                                <TableCell className="text-right">
                                    {url ? (
                                        <Button
                                            as={Link}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            size="sm"
                                            variant="flat"
                                            className="bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
                                        >
                                            Go
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="flat"
                                            className="bg-neutral-800 text-neutral-400 opacity-40"
                                            isDisabled
                                        >
                                            Go
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <div className="mt-4 flex justify-end">
                <Pagination
                    total={totalPages}
                    page={page}
                    onChange={goToPage}
                    showControls
                    size="sm"
                    classNames={{
                        base: "gap-2",
                        wrapper: "bg-transparent",
                        item: "bg-neutral-800 text-neutral-100 data-[active=true]:bg-blue-600 data-[active=true]:text-white",
                        cursor: "bg-blue-600 text-white",
                        next: "text-neutral-200",
                        prev: "text-neutral-200",
                    }}
                />
            </div>
        </div>
    );
}
