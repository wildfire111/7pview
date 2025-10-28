/**
 * DEPRECATED: This component has been replaced by server-side rendering
 * See: LeaderboardsDisplay.js and leaderboard-server.js
 *
 * This file is kept for reference but should not be used in production.
 * The new architecture eliminates client-side API calls and DNS errors.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Button, Spinner } from "@heroui/react";
import { RefreshCw, Calendar, TrendingUp } from "lucide-react";
import Leaderboard from "./Leaderboard";
import { fetchLeaderboardData } from "@/lib/services";

const HomepageLeaderboards = () => {
    const [leaderboardData, setLeaderboardData] = useState({
        allTime: null,
        lastYear: null,
        sinceUpdate: null,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadLeaderboards = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("Fetching leaderboard data...");
            const data = await fetchLeaderboardData();

            setLeaderboardData(data);

            setLastUpdated(new Date());
            console.log("Leaderboard data loaded successfully");
        } catch (err) {
            console.error("Failed to load leaderboards:", err);
            setError(err.message || "Failed to load leaderboard data");
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadLeaderboards();
    }, []);

    const handleRefresh = () => {
        loadLeaderboards();
    };

    // Error state
    if (error && !leaderboardData.allTime) {
        return (
            <div className="w-full">
                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">
                                Performance Leaderboards
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Card performance across different time periods
                            </p>
                        </div>
                        <Button
                            color="primary"
                            variant="flat"
                            onPress={handleRefresh}
                            startContent={<RefreshCw size={16} />}
                            isLoading={loading}
                        >
                            Retry
                        </Button>
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

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold">
                    Pointed Card Leaderboards
                </h2>
            </div>

            {/* Loading state for initial load */}
            {loading && !leaderboardData.allTime && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Leaderboard
                            key={i}
                            title="Loading..."
                            isLoading={true}
                            showCount={10}
                        />
                    ))}
                </div>
            )}

            {/* Main leaderboards grid */}
            {!loading || leaderboardData.allTime ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Leaderboard
                        title="All Time"
                        data={leaderboardData.allTime}
                        isLoading={loading && !leaderboardData.allTime}
                        error={error}
                        showCount={10}
                        period="all-time"
                    />

                    <Leaderboard
                        title="Last Year"
                        data={leaderboardData.lastYear}
                        isLoading={loading && !leaderboardData.lastYear}
                        error={error}
                        showCount={10}
                        period="year"
                    />

                    <Leaderboard
                        title="Since Last Update"
                        data={leaderboardData.sinceUpdate}
                        isLoading={loading && !leaderboardData.sinceUpdate}
                        error={error}
                        showCount={10}
                        period="since-update"
                    />
                </div>
            ) : null}
        </div>
    );
};

export default HomepageLeaderboards;
