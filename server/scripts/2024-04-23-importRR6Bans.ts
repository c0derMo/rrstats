import { DataSource } from "typeorm";
import { Match } from "../model/Match";
import { readFile } from "fs/promises";
import { Player } from "../model/Player";
import MapperService from "../controller/MapperService";
import { type HitmanMap, getAllMaps, getMap } from "~/utils/mapUtils";
import { ChoosingPlayer } from "~/utils/interfaces/IMatch";

function transformPlayerName(oldName: string): string {
    switch (oldName) {
        case "T_Nort23":
            return "Toby Norton";
        case "ashton00122":
            return "Kobalt00122";
        case "Rocky":
            return "Rockyhorse6000";
        case "MattySpice":
            return "MattySpice04";
        case "Script":
            return "TheScriptDesk";
        case "foxy":
            return "Foxyzinhu";
        case "Max Masters":
            return "MaxMasters";
        default:
            return oldName;
    }
}

function findBansByPlayers(
    allMatches: string[],
    playerOne: string,
    playerTwo: string,
): string[] {
    for (const match of allMatches) {
        const quoteIndex = match.indexOf(`"`);
        const splitMatch = match
            .substring(0, quoteIndex > 0 ? quoteIndex : undefined)
            .split(",");
        if (splitMatch.length < 8) continue;

        if (splitMatch[5] !== playerOne) continue;
        if (splitMatch[7] !== playerTwo) continue;

        return [
            splitMatch[splitMatch.length - 3],
            splitMatch[splitMatch.length - 2],
        ];
    }
    return [];
}

function getMapByAbbreviation(abbrev: string): HitmanMap {
    for (const map of getAllMaps()) {
        if (getMap(map)!.abbreviation === abbrev) {
            return map;
        }
    }
    throw new Error(`No map found for abbreviation: ${abbrev}`);
}

async function run() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "rrstats.db",
        entities: [Match, Player],
    });

    await dataSource.initialize();
    console.log("Database connection established.");

    const matches = await Match.find({ where: { competition: "RR6" } });
    console.log(`${matches.length} matches of RR6 loaded.`);

    const csvMatches = await readFile(
        "./Roulette Rivals 6 - Day by Day.csv",
        "utf-8",
    );
    const splitMatches = csvMatches.split("\n");
    console.log(`Loaded csv with ${splitMatches.length} lines`);

    const players = await Player.find();
    const playerLookupMap = MapperService.createStringMapFromList(
        players,
        "uuid",
        "primaryName",
    );

    for (const match of matches) {
        const playerOne = transformPlayerName(playerLookupMap[match.playerOne]);
        const playerTwo = transformPlayerName(playerLookupMap[match.playerTwo]);

        if (match.bannedMaps.length > 0) {
            console.log(
                `${playerOne} - ${playerTwo} (${match.round}): Preexisting bans`,
            );
            continue;
        }

        const extractedBans = findBansByPlayers(
            splitMatches,
            playerOne,
            playerTwo,
        );
        if (extractedBans.length <= 0) {
            console.log(
                `${playerOne} - ${playerTwo} (${match.round}): No bans found`,
            );
            continue;
        }

        match.bannedMaps.push(
            {
                map: getMapByAbbreviation(extractedBans[0]),
                picked: ChoosingPlayer.PLAYER_ONE,
            },
            {
                map: getMapByAbbreviation(extractedBans[1]),
                picked: ChoosingPlayer.PLAYER_TWO,
            },
        );
        console.log(
            `${playerOne} - ${playerTwo} (${match.round}): 1-${extractedBans[0]} 2-${extractedBans[1]}`,
        );

        await match.save();
    }
}

void run();
