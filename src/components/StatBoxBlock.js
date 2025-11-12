import StatBox from "./StatBox";

export default function StatBoxBlock({
    block1stats,
    block2stats,
    block3stats,
    block4stats,
}) {
    // Helper function to format statistics for display
    const formatStats = (stats) => ({
        value: (stats.delta * 100).toFixed(2) * -1 + "%",
        confidence: "±" + (stats.CI * 100).toFixed(2) + "%",
        count:
            stats.inc_count +
            "/" +
            (stats.inv_count + stats.inc_count) +
            " decks",
    });

    const stats1 = formatStats(block1stats);
    const stats2 = formatStats(block2stats);
    const stats3 = formatStats(block3stats);
    const stats4 = formatStats(block4stats);

    return (
        <div className="flex flex-wrap gap-3 justify-center">
            <StatBox
                topLabel="All Time"
                value={stats1.value}
                bottomLabel={stats1.confidence}
                countLabel={stats1.count}
            />
            <StatBox
                topLabel="Last Year"
                value={stats2.value}
                bottomLabel={stats2.confidence}
                countLabel={stats2.count}
            />
            <StatBox
                topLabel="Since Last Update"
                value={stats3.value}
                bottomLabel={stats3.confidence}
                countLabel={stats3.count}
            />
            <StatBox
                topLabel="Date Range"
                value={stats4.value}
                bottomLabel={stats4.confidence}
                countLabel={stats4.count}
            />
        </div>
    );
}
