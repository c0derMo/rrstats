import { DataSource } from "typeorm";
import { Match } from "../model/Match";
import { DateTime } from "luxon";
import type { Spin } from "~/utils/interfaces/IMatch";
import { createObjectCsvWriter } from "csv-writer";
import { Player } from "../model/Player";
import MapperService from "../controller/MapperService";
import { getMap } from "~/utils/mapUtils";

function formatSpin(s: Spin) {
    return s.targetConditions
        .map((target) => {
            let targetS = `${target.target.name}: `;
            if (target.killMethod.selectedVariant != null && target.killMethod.selectedVariant != "") {
                targetS += `${target.killMethod.selectedVariant} `;
            }
            targetS += `${target.killMethod.name} as ${target.disguise.name}`;
            if (target.complications.length > 0) {
                targetS += ` (${target.complications
                    .map((comp) => comp.name)
                    .join(",")})`;
            }

            return targetS;
        })
        .join(" // ");
}

async function main() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match, Player],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find();
    const players = await Player.find();
    const playerLookupMap = MapperService.createStringMapFromList(
        players,
        "uuid",
        "primaryName",
    );

    let maxMapCount = 0;

    const mappedMatches = matches.map((match) => {
        maxMapCount = Math.max(maxMapCount, match.playedMaps.length);
        const result = {
            competition: match.competition,
            date: DateTime.fromMillis(match.timestamp).toISODate(),
            platform: match.platform,
            round: match.round,
            player1: playerLookupMap[match.playerOne],
            player2: playerLookupMap[match.playerTwo],
            score: `${match.playerOneScore}-${match.playerTwoScore}`,
            casters: match.shoutcasters?.join(", "),
            castLink: match.vodLink,
        } as Record<string, unknown>;
        for (const mapIdxS in match.playedMaps) {
            const mapIdx = parseInt(mapIdxS);
            result[`map${mapIdx + 1}`] = getMap(
                match.playedMaps[mapIdx].map,
            )!.abbreviation;
            result[`spinMap${mapIdx + 1}`] =
                match.playedMaps[mapIdx].spin != null
                    ? formatSpin(match.playedMaps[mapIdx].spin as Spin)
                    : "";
            result[`winnerMap${mapIdx + 1}`] = match.playedMaps[mapIdx].winner;
            result[`pickerMap${mapIdx + 1}`] = match.playedMaps[mapIdx].picked;
            result[`timeMap${mapIdx + 1}`] = match.playedMaps[mapIdx].timeTaken;
        }
        return result;
    });

    const headers = [
        { id: "competition", title: "COMPETITION" },
        { id: "date", title: "DATE" },
        { id: "platform", title: "PLATFORM" },
        { id: "round", title: "ROUND" },
        { id: "player1", title: "PLAYER1" },
        { id: "player2", title: "PLAYER2" },
        { id: "score", title: "SCORE" },
        { id: "casters", title: "CASTERS" },
        { id: "castLink", title: "CASTLINK" },
    ];
    for (let i = 0; i < maxMapCount; i++) {
        headers.push(
            { id: `map${i + 1}`, title: `MAP${i + 1}` },
            { id: `spinMap${i + 1}`, title: `SPINMAP${i + 1}` },
            { id: `winnerMap${i + 1}`, title: `WINNERMAP${i + 1}` },
            { id: `pickerMap${i + 1}`, title: `PICKERMAP${i + 1}` },
            { id: `timeMap${i + 1}`, title: `TIMEMAP${i + 1}` },
        );
    }

    console.log(mappedMatches[0]);

    const writer = createObjectCsvWriter({
        path: `./matches.csv`,
        header: headers,
    });
    await writer.writeRecords(mappedMatches);
}

void main();
