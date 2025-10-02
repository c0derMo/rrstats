import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";
import { $fetch } from "ofetch";

const compToExport = "rr14";

export interface HitmapsTournamentMatch {
    id: number;
    challongeMatchId: number;
    matchScheduledAt: string;
    matchCompletedAt: string;
    competitors: {
        id: number;
        bracketId: number;
        discordId: string;
        challongePlayerId: number;
        challongeName: string;
        countryCode: string;
    }[];
    gameModeMatchId: string;
    maps: {
        competitorId: number;
        competitorName: string;
        selectionType: "Ban" | "Pick" | "Random";
        mapSlug: string;
    }[];
    platform: string;
    round: number | null;
}

function formatRound(round: number) {
    if (round < 0) {
        return `LB Round ${-round}`;
    }
    return `Round ${round}`;
}

async function main() {
    let request: { matches: HitmapsTournamentMatch[] };

    try {
        request = await $fetch<{ matches: HitmapsTournamentMatch[] }>(
            `https://tournamentsapi.hitmaps.com/api/events/${compToExport}/statistics?statsKey=MatchHistory`,
        );
    } catch {
        console.log("Request failed");
        return;
    }

    const headers = [
        { key: "round", header: "ROUND" },
        { key: "match", header: "MATCH" },
    ];

    let maxMaps = 0;

    const rows: Record<string, string>[] = [];
    for (const match of request.matches) {
        const filteredMaps = match.maps.filter(
            (m) => m.selectionType !== "Ban",
        );
        maxMaps = Math.max(maxMaps, filteredMaps.length);
        const result = {
            round: formatRound(match.round!),
            match: `${match.competitors[0].challongeName} - ${match.competitors[1].challongeName}`,
        } as Record<string, string>;
        for (const map in filteredMaps) {
            result[`map-${map}`] = getMapBySlug(
                filteredMaps[map].mapSlug,
            )!.abbreviation;
        }
        rows.push(result);
    }

    for (let i = 0; i < maxMaps; i++) {
        headers.push({
            key: `map-${i}`,
            header: `MAP${i + 1}`,
        });
    }

    const output = stringify(rows, { header: true, columns: headers });
    await writeFile(`./all-maps-${compToExport}.csv`, output, "utf-8");
}

void main();
