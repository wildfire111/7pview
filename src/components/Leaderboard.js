import React from "react";
import Link from "next/link";
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Skeleton,
    Tooltip,
} from "@heroui/react";
import { Info } from "lucide-react";

const Leaderboard = ({
    title,
    data,
    isLoading = false,
    showCount = 10,
    period = "period",
}) => {
    // Loading skeleton (kept for cases where we still need it)
    if (isLoading) {
        return (
            <Card className="w-full">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center w-full">
                        <Skeleton className="h-6 w-32 rounded-lg" />
                        <Skeleton className="h-4 w-20 rounded-lg" />
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="space-y-3">
                        {[...Array(showCount)].map((_, i) => (
                            <div
                                key={i}
                                className="flex justify-between items-center p-2"
                            >
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-8 rounded" />
                                    <Skeleton className="h-4 w-32 rounded" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-16 rounded" />
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        );
    }

    // No data state
    if (!data || !data.top_cards || data.top_cards.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-center w-full">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <Chip size="sm" variant="flat" color="default">
                            No data
                        </Chip>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="text-center py-8 text-gray-500">
                        <p>No cards found for this period</p>
                    </div>
                </CardBody>
            </Card>
        );
    }

    const displayCards = data.top_cards.slice(0, showCount);

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                    </div>
                    <Chip size="sm" variant="flat" color="primary">
                        Top {showCount}
                    </Chip>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-0">
                <Table
                    aria-label={`${title} leaderboard`}
                    classNames={{
                        wrapper: "shadow-none",
                        th: "bg-transparent text-default-500 border-b border-divider",
                        td: "border-b border-divider/50",
                    }}
                >
                    <TableHeader>
                        <TableColumn className="w-12">#</TableColumn>
                        <TableColumn>CARD</TableColumn>
                        <TableColumn className="w-24 text-center">
                            <div className="flex items-center justify-center gap-1">
                                DELTA
                                <Tooltip
                                    content={
                                        <div className="px-1 py-2 max-w-xs">
                                            <div className="text-small font-bold">
                                                Delta:
                                            </div>
                                            <div className="text-tiny">
                                                Delta represents the difference
                                                in placing in percentage between
                                                all decks containing this card
                                                versus all the decks that don't
                                                contain it. Positive values
                                                indicate the card performs
                                                better than average. Find out
                                                more at{" "}
                                                <Link
                                                    href="/about"
                                                    className="text-blue-300 hover:underline"
                                                >
                                                    the About page
                                                </Link>
                                                .
                                            </div>
                                        </div>
                                    }
                                    placement="top"
                                    delay={0}
                                    closeDelay={0}
                                    classNames={{
                                        base: "py-2 px-3 shadow-xl text-white bg-neutral-800 border border-neutral-700 rounded-lg",
                                        arrow: "bg-neutral-800",
                                    }}
                                >
                                    <Info
                                        size={12}
                                        className="text-default-400 hover:text-default-600 cursor-help"
                                    />
                                </Tooltip>
                            </div>
                        </TableColumn>
                    </TableHeader>
                    <TableBody>
                        {displayCards.map((card, index) => {
                            return (
                                <TableRow key={card.scryfall_id}>
                                    <TableCell>
                                        <span className="font-medium text-sm">
                                            {card.rank}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <Link
                                                href={`/card/${encodeURIComponent(
                                                    card.name
                                                )}`}
                                                className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                            >
                                                {card.name}
                                            </Link>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="text-center">
                                            <p className="text-sm font-medium">
                                                {(card.delta * 100).toFixed(2) *
                                                    -1 >=
                                                0
                                                    ? "+"
                                                    : ""}
                                                {(card.delta * 100).toFixed(2) *
                                                    -1}
                                                %
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                ±{(card.CI * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );
};

export default Leaderboard;
