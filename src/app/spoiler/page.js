"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Tabs,
    Tab,
    Chip,
    Skeleton,
    Button,
} from "@heroui/react";
import Image from "next/image";
import Link from "next/link";

export default function SpoilerPage() {
    const [pointsData, setPointsData] = useState(null);
    const [cardsByPoints, setCardsByPoints] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState("");

    useEffect(() => {
        fetchPointsData();
    }, []);

    const fetchPointsData = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/stats");
            if (!response.ok) {
                throw new Error("Failed to fetch points data");
            }

            const data = await response.json();
            setPointsData(data);

            // Group cards by their point values
            const grouped = {};
            if (data.cards) {
                data.cards.forEach((card) => {
                    const points = card.points;
                    if (!grouped[points]) {
                        grouped[points] = [];
                    }
                    grouped[points].push(card);
                });
            }

            // Sort each group alphabetically by card name
            Object.keys(grouped).forEach((points) => {
                grouped[points].sort((a, b) => a.name.localeCompare(b.name));
            });

            setCardsByPoints(grouped);

            // Set default tab to highest point value
            const sortedPoints = Object.keys(grouped)
                .map((p) => parseInt(p))
                .sort((a, b) => b - a);
            if (sortedPoints.length > 0 && !selectedTab) {
                setSelectedTab(String(sortedPoints[0]));
            }
        } catch (err) {
            console.error("Error fetching points data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScryfallImageUrl = (scryfallId) => {
        if (!scryfallId || scryfallId.length < 2) {
            return null;
        }
        return `https://cards.scryfall.io/normal/front/${scryfallId.slice(
            0,
            1
        )}/${scryfallId.slice(1, 2)}/${scryfallId}.jpg`;
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="mb-6">
                    <Skeleton className="h-8 w-64 rounded-lg mb-2" />
                    <Skeleton className="h-4 w-96 rounded-lg" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-6xl">
                <Card className="border-danger">
                    <CardBody>
                        <p className="text-danger">
                            Error loading spoiler: {error}
                        </p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const sortedPointValues = Object.keys(cardsByPoints)
        .map((p) => parseInt(p))
        .sort((a, b) => b - a); // Sort points descending (highest first)

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold">
                        Visual Points Spoiler
                    </h1>
                    <Button
                        color="primary"
                        variant="flat"
                        onPress={fetchPointsData}
                        isLoading={loading}
                        size="sm"
                    >
                        Refresh
                    </Button>
                </div>
                <p className="text-foreground-600">
                    All pointed cards organized by their point values.
                    {pointsData && (
                        <span className="ml-2">
                            Total: {pointsData.totalCards} cards
                        </span>
                    )}
                    {pointsData?.lastChanged && (
                        <span className="ml-2 text-foreground-500">
                            • Last updated:{" "}
                            {new Date(
                                pointsData.lastChanged
                            ).toLocaleDateString()}
                        </span>
                    )}
                </p>
            </div>

            {sortedPointValues.length === 0 ? (
                <Card>
                    <CardBody>
                        <p className="text-center text-foreground-500">
                            No pointed cards found.
                        </p>
                    </CardBody>
                </Card>
            ) : (
                <Tabs
                    selectedKey={selectedTab}
                    onSelectionChange={setSelectedTab}
                    aria-label="Point values"
                    variant="underlined"
                    classNames={{
                        tabList:
                            "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                        cursor: "w-full bg-primary",
                        tab: "max-w-fit px-0 h-12",
                        tabContent: "group-data-[selected=true]:text-primary",
                    }}
                >
                    {sortedPointValues.map((points) => (
                        <Tab
                            key={String(points)}
                            title={
                                <Chip color="primary" variant="flat" size="md">
                                    {points} {points === 1 ? "Point" : "Points"}
                                </Chip>
                            }
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-6">
                                {cardsByPoints[points].map((card) => (
                                    <CardImage
                                        key={card.scryfall_id}
                                        card={card}
                                        getScryfallImageUrl={
                                            getScryfallImageUrl
                                        }
                                    />
                                ))}
                            </div>
                        </Tab>
                    ))}
                </Tabs>
            )}
        </div>
    );
}

function CardImage({ card, getScryfallImageUrl }) {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const imageUrl = getScryfallImageUrl(card.scryfall_id);

    return (
        <div className="relative group">
            <Link href={`/card/${encodeURIComponent(card.name)}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <CardBody className="p-0">
                        {imageLoading && (
                            <Skeleton className="w-full aspect-[5/7] rounded-lg" />
                        )}
                        {!imageError && imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={card.name}
                                width={300}
                                height={420}
                                className={`w-full h-auto object-cover transition-opacity ${
                                    imageLoading ? "opacity-0" : "opacity-100"
                                }`}
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                                priority={false}
                            />
                        ) : (
                            <div className="w-full aspect-[5/7] bg-content2 flex items-center justify-center">
                                <div className="text-center p-4">
                                    <p className="text-sm font-medium text-foreground-600">
                                        {card.name}
                                    </p>
                                    <p className="text-xs text-foreground-500 mt-1">
                                        Image not available
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </Link>

            {/* Tooltip with card name on hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                {card.name}
            </div>
        </div>
    );
}
