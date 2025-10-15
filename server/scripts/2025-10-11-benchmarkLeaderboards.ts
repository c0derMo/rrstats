import { DataSource, In } from "typeorm";
import { Match } from "../model/Match";
import { PlayedMap } from "../model/PlayedMap";
import { Competition, CompetitionPlacement } from "../model/Competition";
import { Player } from "../model/Player";
import { DateTime } from "luxon";
import { CountryMatches } from "../controller/leaderboardStatistics/country/Matches";
import { CountryPlayers } from "../controller/leaderboardStatistics/country/Players";
import { CountryTitles } from "../controller/leaderboardStatistics/country/Titles";
import { CountryWinrate } from "../controller/leaderboardStatistics/country/Winrate";
import { CountryWins } from "../controller/leaderboardStatistics/country/Wins";
import { MapAppearance } from "../controller/leaderboardStatistics/map/Appearances";
import { MapBanned } from "../controller/leaderboardStatistics/map/Banned";
import { MapPicked } from "../controller/leaderboardStatistics/map/Picked";
import { MapPlayed } from "../controller/leaderboardStatistics/map/Played";
import { MapRNG } from "../controller/leaderboardStatistics/map/RNG";
import { PlayerAchievements } from "../controller/leaderboardStatistics/player/Achievements";
import { PlayerAveragePlacement } from "../controller/leaderboardStatistics/player/AveragePlacement";
import { PlayerElo } from "../controller/leaderboardStatistics/player/Elo";
import { PlayerGFAppearances } from "../controller/leaderboardStatistics/player/GFAppearances";
import { PlayerMapsPlayed } from "../controller/leaderboardStatistics/player/MapsPlayed";
import { PlayerMapsWon } from "../controller/leaderboardStatistics/player/MapsWon";
import { PlayerMapsWonInARow } from "../controller/leaderboardStatistics/player/MapsWonInARow";
import { PlayerMapWinrate } from "../controller/leaderboardStatistics/player/MapWinrate";
import { PlayerMatchesCasted } from "../controller/leaderboardStatistics/player/MatchesCasted";
import { PlayerMatchesPlayed } from "../controller/leaderboardStatistics/player/MatchesPlayed";
import { PlayerMatchesWon } from "../controller/leaderboardStatistics/player/MatchesWon";
import { PlayerMatchesWonInARow } from "../controller/leaderboardStatistics/player/MatchesWonInARow";
import { PlayerReverseSweeps } from "../controller/leaderboardStatistics/player/ReverseSweeps";
import { PlayerRRAppearances } from "../controller/leaderboardStatistics/player/RRAppearances";
import { PlayerRRWCAppearances } from "../controller/leaderboardStatistics/player/RRWCAppearances";
import { PlayerSameMapWonInARow } from "../controller/leaderboardStatistics/player/SameMapWonInARow";
import { PlayerSpecificMapPlayed } from "../controller/leaderboardStatistics/player/SpecificMapPlayed";
import { PlayerSpecificMapWinrate } from "../controller/leaderboardStatistics/player/SpecificMapWinrate";
import { PlayerSweeps } from "../controller/leaderboardStatistics/player/Sweeps";
import { PlayerSweeps6 } from "../controller/leaderboardStatistics/player/Sweeps6";
import { PlayerTitlesWon } from "../controller/leaderboardStatistics/player/TitlesWon";
import { PlayerWinrate } from "../controller/leaderboardStatistics/player/Winrate";
import { PlayerWROpponentMaps } from "../controller/leaderboardStatistics/player/WROpponentMaps";
import { PlayerWROwnMaps } from "../controller/leaderboardStatistics/player/WROwnMaps";
import { Achievement } from "../model/Achievement";

const statistics = [
    new PlayerWinrate(),
    new PlayerMapWinrate(),
    new PlayerRRAppearances(),
    new PlayerRRWCAppearances(),
    new PlayerAveragePlacement(),
    new PlayerGFAppearances(),
    new PlayerTitlesWon(),
    new PlayerMatchesPlayed(),
    new PlayerMatchesWon(),
    new PlayerMapsPlayed(),
    new PlayerMapsWon(),
    new PlayerWROwnMaps(),
    new PlayerWROpponentMaps(),
    new PlayerMatchesWonInARow(),
    new PlayerMapsWonInARow(),
    new PlayerSameMapWonInARow(),
    new PlayerSweeps6(),
    new PlayerSweeps(),
    new PlayerReverseSweeps(),
    new PlayerSpecificMapPlayed(),
    new PlayerSpecificMapWinrate(),
    new PlayerElo(),
    new PlayerAchievements(),
    new PlayerMatchesCasted(),

    new CountryPlayers(),
    new CountryMatches(),
    new CountryWins(),
    new CountryWinrate(),
    new CountryTitles(),

    new MapPicked(),
    new MapBanned(),
    new MapPlayed(),
    new MapRNG(),
    new MapAppearance(),
];

async function main() {
    const dataSource = new DataSource({
        type: "better-sqlite3",
        database: "./rrstats.db",
        entities: [
            Player,
            Competition,
            CompetitionPlacement,
            PlayedMap,
            Match,
            Achievement,
        ],
    });
    await dataSource.initialize();
    console.log("Database connection established.");

    // Query ALL THE THINGS
    let queryStart = DateTime.now();
    const players = await Player.find();
    const playerTime = DateTime.now().diff(queryStart).toMillis();
    queryStart = DateTime.now();
    const matches = await Match.find({
        order: { timestamp: "ASC" },
    });
    const matchTime = DateTime.now().diff(queryStart).toMillis();
    queryStart = DateTime.now();
    const _optimizedMatches = await Match.find({
        select: [
            "uuid",
            "playerOne",
            "playerOneScore",
            "playerTwo",
            "playerTwoScore",
            "competition",
        ],
        relations: { playedMaps: false },
        order: { timestamp: "ASC" },
    });
    const optimizedMatchTime = DateTime.now().diff(queryStart).toMillis();
    queryStart = DateTime.now();
    const _maps = await PlayedMap.createQueryBuilder("map")
        .innerJoin("map.match", "match")
        .select([
            "map.uuid",
            "map.map",
            "map.winner",
            "match.playerOne",
            "match.playerTwo",
        ])
        .orderBy("match.timestamp", "ASC")
        .getMany();
    const optimizedMapTime = DateTime.now().diff(queryStart).toMillis();
    queryStart = DateTime.now();
    const competitions = await Competition.find({
        where: { officialCompetition: true },
        order: { startingTimestamp: "DESC" },
    });
    const compTime = DateTime.now().diff(queryStart).toMillis();
    queryStart = DateTime.now();
    const placements = await CompetitionPlacement.find({
        where: { competition: In(competitions.map((comp) => comp.tag)) },
    });
    const placementTime = DateTime.now().diff(queryStart).toMillis();

    const queryTime = playerTime + matchTime + compTime + placementTime;
    console.log(
        `Testing map query: ${optimizedMapTime}ms, ${JSON.stringify(_maps[0])}`,
    );
    console.log(
        `Queried ${players.length} players (${playerTime}ms), ${matches.length} matches (${matchTime}ms, ${optimizedMatchTime}ms optimized), ${competitions.length} competitions (${compTime}ms), ${placements.length} placements (${placementTime}ms)`,
    );
    console.log(
        `Query time (will not be added to all benchmarks): ${queryTime}ms`,
    );

    for (const statistic of statistics) {
        const start = DateTime.now();
        const result = statistic.calculate(
            players,
            matches,
            placements,
            competitions,
        );
        if (result instanceof Promise) {
            await result;
        }
        const time = DateTime.now().diff(start).toMillis();
        console.log(`${statistic.name}: ${time}ms`);
    }
}

void main();
