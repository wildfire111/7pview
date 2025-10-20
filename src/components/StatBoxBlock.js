import StatBox from "./StatBox";
export default function StatBoxBlock({
    block1stats,
    block2stats,
    block3stats,
    block4stats,
}) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
            <StatBox
                topLabel="All Time"
                value={(block1stats.delta * 100).toFixed(2) * -1 + "%"}
                bottomLabel={"±" + (block1stats.CI * 100).toFixed(2) + "%"}
                countLabel={
                    block1stats.inc_count +
                    "/" +
                    (block1stats.inv_count + block1stats.inc_count) +
                    " decks"
                }
            />
            <StatBox
                topLabel="Last Year"
                value={(block2stats.delta * 100).toFixed(2) * -1 + "%"}
                bottomLabel={"±" + (block2stats.CI * 100).toFixed(2) + "%"}
                countLabel={
                    block2stats.inc_count +
                    "/" +
                    (block2stats.inv_count + block2stats.inc_count) +
                    " decks"
                }
            />
            <StatBox
                topLabel="Last 3 Months"
                value={(block3stats.delta * 100).toFixed(2) * -1 + "%"}
                bottomLabel={"±" + (block3stats.CI * 100).toFixed(2) + "%"}
                countLabel={
                    block3stats.inc_count +
                    "/" +
                    (block3stats.inv_count + block3stats.inc_count) +
                    " decks"
                }
            />
            <StatBox
                topLabel="Date Range"
                value={(block4stats.delta * 100).toFixed(2) * -1 + "%"}
                bottomLabel={"±" + (block4stats.CI * 100).toFixed(2) + "%"}
                countLabel={
                    block4stats.inc_count +
                    "/" +
                    (block4stats.inv_count + block4stats.inc_count) +
                    " decks"
                }
            />
        </div>
    );
}
