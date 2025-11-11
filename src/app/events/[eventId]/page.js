"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardBody,
    CardHeader,
    Spinner,
    Chip,
    Button,
    Breadcrumbs,
    BreadcrumbItem,
} from "@heroui/react";
import { Calendar, Users, Trophy, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EventDetailPage() {
    const params = useParams();
    const eventId = params.eventId;

    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEventDecks = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}/decks`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Event not found");
                    }
                    throw new Error("Failed to fetch event data");
                }
                const data = await response.json();
                setEventData(data);
            } catch (error) {
                console.error("Error fetching event data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEventDecks();
        }
    }, [eventId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getPlacementColor = (placement, totalPlayers) => {
        if (placement <= 8) return "success"; // Top 8
        return "default";
    };

    const getPlacementSuffix = (placement) => {
        const lastDigit = placement % 10;
        const lastTwoDigits = placement % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
            return "th";
        }

        switch (lastDigit) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center min-h-[400px]">
                    <Spinner size="lg" label="Loading event data..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link href="/events">
                        <Button
                            variant="light"
                            startContent={<ArrowLeft size={16} />}
                            className="mb-4"
                        >
                            Back to Events
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardBody>
                        <div className="text-center py-8">
                            <h2 className="text-xl font-semibold text-red-400 mb-2">
                                Error Loading Event
                            </h2>
                            <p className="text-neutral-400">{error}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const { event, decks } = eventData;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumbs>
                    <BreadcrumbItem>
                        <Link href="/events">Events</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>{event.name}</BreadcrumbItem>
                </Breadcrumbs>
            </div>

            {/* Event Header */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                {event.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span>{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={16} />
                                    <span>{event.num_players} players</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy size={16} />
                                    <span>{decks.length} decks</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link href="/events">
                                <Button
                                    variant="light"
                                    startContent={<ArrowLeft size={16} />}
                                >
                                    Back to Events
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Decks Table */}
            <Card>
                <CardBody className="p-0">
                    <Table
                        aria-label="Event decks table"
                        classNames={{
                            wrapper: "min-h-[400px]",
                        }}
                    >
                        <TableHeader>
                            <TableColumn
                                key="placement"
                                className="text-center w-20"
                            >
                                PLACE
                            </TableColumn>
                            <TableColumn key="player" className="text-left">
                                PLAYER
                            </TableColumn>
                            <TableColumn key="archetype" className="text-left">
                                ARCHETYPE
                            </TableColumn>
                            <TableColumn key="actions" className="text-center">
                                ACTIONS
                            </TableColumn>
                        </TableHeader>
                        <TableBody>
                            {decks.map((deck) => (
                                <TableRow key={deck.deck_id}>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            <Chip
                                                color={getPlacementColor(
                                                    deck.placement,
                                                    event.num_players
                                                )}
                                                variant="flat"
                                                size="sm"
                                            >
                                                {deck.placement}
                                                {getPlacementSuffix(
                                                    deck.placement
                                                )}
                                            </Chip>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">
                                            {deck.player_name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {deck.archetype ||
                                                "Unknown Archetype"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            {deck.moxfield_id && (
                                                <Link
                                                    href={`https://www.moxfield.com/decks/${deck.moxfield_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        color="primary"
                                                        endContent={
                                                            <ExternalLink
                                                                size={14}
                                                            />
                                                        }
                                                    >
                                                        Moxfield
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {decks.length === 0 && (
                <Card className="mt-6">
                    <CardBody>
                        <div className="text-center py-8">
                            <h3 className="text-lg font-semibold text-neutral-400 mb-2">
                                No Decks Found
                            </h3>
                            <p className="text-neutral-500">
                                This event doesn&apos;t have any deck data
                                available.
                            </p>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
