"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import Leaderboard from "./Leaderboard";

const LeaderboardsDisplay = ({ leaderboardData, error }) => {
    // Error state
    if (error && !leaderboardData) {
        return (
            <div className="w-full">
                <Card className="mb-6">
                    <CardHeader>
                        <div>
                            <h2 className="text-2xl font-bold">
                                Best Performing Pointed Cards
                            </h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="text-center py-12 text-red-500">
                            <p className="text-lg font-medium">
                                Failed to Load Leaderboards
                            </p>
                            <p className="text-sm mt-2 text-gray-500">
                                {error}
                            </p>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // No data state
    if (!leaderboardData) {
        return (
            <div className="w-full">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">
                        Pointed Card Leaderboards
                    </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {[...Array(3)].map((_, i) => (
                        <Leaderboard
                            key={i}
                            title="Loading..."
                            isLoading={true}
                            showCount={10}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold">
                    Pointed Card Leaderboards
                </h2>
            </div>

            {/* Main leaderboards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Leaderboard
                    title="All Time"
                    data={leaderboardData.allTime}
                    showCount={10}
                    period="all-time"
                />

                <Leaderboard
                    title="Last Year"
                    data={leaderboardData.lastYear}
                    showCount={10}
                    period="year"
                />

                <Leaderboard
                    title="Since Last Update"
                    data={leaderboardData.sinceUpdate}
                    showCount={10}
                    period="since-update"
                />
            </div>
        </div>
    );
};

export default LeaderboardsDisplay;
