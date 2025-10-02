import { DataSource } from "typeorm";
import { Match } from "../model/Match";
import { DateTime } from "luxon";
import { Player } from "../model/Player";
import MapperService from "../controller/MapperService";
import { stringify } from "csv-stringify/sync";
import { writeFile } from "node:fs/promises";

const compToExport = "RR2";

function formatSpin(s: Spin) {
    return s.targetConditions
        .map((target) => {
            let targetS = `${target.target.name}: `;
            if (target.killMethod.selectedVariant != null) {
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

    const matches = await Match.find({ where: { competition: compToExport } });
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
            date: DateTime.fromMillis(match.timestamp).toISODate(),
            platform: match.platform,
            round: match.round,
            player1: playerLookupMap[match.playerOne],
            player2: playerLookupMap[match.playerTwo],
            score: `${match.playerOneScore}-${match.playerTwoScore}`,
            casters: match.shoutcasters?.join(", "),
            castLink: match.vodLink?.join(","),
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
        { key: "date", header: "DATE" },
        { key: "platform", header: "PLATFORM" },
        { key: "round", header: "ROUND" },
        { key: "player1", header: "PLAYER1" },
        { key: "player2", header: "PLAYER2" },
        { key: "score", header: "SCORE" },
        { key: "casters", header: "CASTERS" },
        { key: "castLink", header: "CASTLINK" },
    ];
    for (let i = 0; i < maxMapCount; i++) {
        headers.push(
            { key: `map${i + 1}`, header: `MAP${i + 1}` },
            { key: `spinMap${i + 1}`, header: `SPINMAP${i + 1}` },
            { key: `winnerMap${i + 1}`, header: `WINNERMAP${i + 1}` },
            { key: `pickerMap${i + 1}`, header: `PICKERMAP${i + 1}` },
            { key: `timeMap${i + 1}`, header: `TIMEMAP${i + 1}` },
        );
    }

    console.log(mappedMatches[0]);

    const output = stringify(mappedMatches, { header: true, columns: headers });
    await writeFile(`./${compToExport}.csv`, output, "utf-8");
}

void main();
