import { jStat } from "jstat";

export async function calcCardArrayDelta(
    incExcRows,
    inverseRows,
    startDate,
    endDate
) {
    let incExcFiltered = filterDates(incExcRows, startDate, endDate);
    let invFiltered = filterDates(inverseRows, startDate, endDate);

    const incExcNormAndCI = calcMeanAnd95CI(incExcFiltered, startDate, endDate);
    const invNormAndCI = calcMeanAnd95CI(invFiltered, startDate, endDate);
    let delta;
    let marginOfError;
    if (!incExcNormAndCI || !invNormAndCI) {
        delta = 0;
        marginOfError = 0;
    } else {
        delta = incExcNormAndCI.mean - invNormAndCI.mean;
        marginOfError = incExcNormAndCI.marginOfError;
    }
    return {
        delta,
        incExcCount: incExcFiltered.length,
        invCount: invFiltered.length,
        CI: marginOfError,
        inc_count: incExcFiltered.length,
        inv_count: invFiltered.length,
    };
}

export function filterDates(rows, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const withinRange = (dateStr) => {
        const d = new Date(dateStr);
        return d >= start && d <= end;
    };

    return rows.filter((r) => withinRange(r.event_date));
}

export function calcMeanAnd95CI(deckArray) {
    if (!deckArray?.length) return null;
    const placements = deckArray
        .filter((r) => Number(r.max_players) > 16)
        .map((r) => Number(r.normalised_placement));
    if (!placements.length) return null;

    const mean = jStat.mean(placements);
    const stddev = jStat.stdev(placements, true);
    const marginOfError = (1.96 * stddev) / Math.sqrt(placements.length);

    return { mean, marginOfError };
}
