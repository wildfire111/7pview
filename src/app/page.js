import { fetchLeaderboardData } from "@/lib/services";
import LeaderboardsDisplay from "@/components/LeaderboardsDisplay";

export default async function HomePage() {
    // Fetch leaderboard data server-side
    let leaderboardData = null;
    let error = null;

    try {
        leaderboardData = await fetchLeaderboardData();
    } catch (err) {
        console.error("Failed to load leaderboards on server:", err);
        error = err.message || "Failed to load leaderboard data";
    }

    return (
        <main className="min-h-screen">
            {/* Simple Header */}
            <section className="px-6 py-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
                        Thoughtcast
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        7 Point Highlander Tournament Analytics
                    </p>
                </div>
            </section>

            {/* Leaderboards */}
            <section className="px-6 pb-16">
                <div className="max-w-7xl mx-auto">
                    <LeaderboardsDisplay
                        leaderboardData={leaderboardData}
                        error={error}
                    />
                </div>
            </section>
        </main>
    );
}
