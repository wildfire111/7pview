"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardBody,
    Spinner,
    Chip,
    Tooltip,
} from "@heroui/react";
import { Calendar, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch("/api/events");
                if (!response.ok) {
                    throw new Error("Failed to fetch events");
                }
                const data = await response.json();
                setEvents(data.events);
            } catch (error) {
                console.error("Error fetching events:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getPlayerCountColor = (numPlayers) => {
        if (numPlayers <= 16) return "danger";
        return "default";
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center min-h-[400px]">
                    <Spinner size="lg" label="Loading events..." />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardBody>
                        <div className="text-center py-8">
                            <h2 className="text-xl font-semibold text-red-400 mb-2">
                                Error Loading Events
                            </h2>
                            <p className="text-neutral-400">{error}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Events</h1>
                <p className="text-neutral-400">
                    Browse all Highlander events.
                </p>
                <div className="mt-4 text-sm text-neutral-500">
                    Total Events: {events.length}
                </div>
            </div>

            <Card>
                <CardBody className="p-0">
                    <Table
                        aria-label="Events table"
                        classNames={{
                            wrapper: "min-h-[400px]",
                        }}
                    >
                        <TableHeader>
                            <TableColumn key="name" className="text-left">
                                EVENT NAME
                            </TableColumn>
                            <TableColumn key="date" className="text-left">
                                DATE
                            </TableColumn>
                            <TableColumn key="players" className="text-center">
                                PLAYERS
                            </TableColumn>
                            <TableColumn key="actions" className="text-center">
                                ACTIONS
                            </TableColumn>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <span className="font-medium">
                                            {event.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar
                                                size={16}
                                                className="text-neutral-400"
                                            />
                                            <span>
                                                {formatDate(event.date)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center">
                                            {event.num_players <= 16 ? (
                                                <Tooltip
                                                    content={
                                                        <div className="text-center">
                                                            <div>
                                                                Small event:
                                                                Events with 16
                                                                or fewer players
                                                                are not included
                                                                in performance
                                                                calculations.
                                                            </div>
                                                            <div>
                                                                If the player
                                                                count is
                                                                incorrect,
                                                                please contact
                                                                hello@thoughtca.st
                                                                and it will be
                                                                updated.
                                                            </div>
                                                        </div>
                                                    }
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Chip
                                                            color={getPlayerCountColor(
                                                                event.num_players
                                                            )}
                                                            variant="flat"
                                                            startContent={
                                                                <Users
                                                                    size={14}
                                                                />
                                                            }
                                                        >
                                                            {event.num_players}
                                                        </Chip>
                                                        <AlertTriangle
                                                            size={16}
                                                            className="text-warning"
                                                        />
                                                    </div>
                                                </Tooltip>
                                            ) : (
                                                <Chip
                                                    color={getPlayerCountColor(
                                                        event.num_players
                                                    )}
                                                    variant="flat"
                                                    startContent={
                                                        <Users size={14} />
                                                    }
                                                >
                                                    {event.num_players}
                                                </Chip>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                href={`/events/${event.id}`}
                                                className="text-primary hover:text-primary-400 text-sm font-medium transition-colors"
                                            >
                                                View Decks
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}
