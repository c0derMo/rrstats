import { Competition } from "../model/Competition";
import { Match } from "../model/Match";
import ld from "lodash";
import consola from "consola";
import { Log } from "~/utils/FunctionTimer";
import { DefaultedMap } from "~/utils/DefaultedMap";

const logger = consola.withTag("rrstats:elo");

export default class EloController {
    private competitionList: string[] = [];
    private rookieMatches: Record<string, number> = {};
    private lastTournament: Record<string, string> = {};
    private returneeMatches: Record<string, number> = {};
    private eloCache: Record<string, number[]> = {};
    private playedTournaments: DefaultedMap<string, string[]> =
        new DefaultedMap(() => []);

    private static instance: EloController | null = null;

    private constructor() {}

    static getInstance(): EloController {
        if (EloController.instance == null) {
            EloController.instance = new EloController();
        }
        return EloController.instance;
    }

    async fetchCompetitions(): Promise<void> {
        const competitions = await Competition.find({
            where: { officialCompetition: true },
            order: {
                startingTimestamp: "ASC",
            },
        });
        this.competitionList = competitions.map((comp) => comp.tag);
    }

    public async getEloOfMatch(match: Match): Promise<number[]> {
        const matchK = EloController.getKFactorOfMatch(match);
        const playerOneK = this.getKFactorOfPlayer(
            match.competition,
            match.playerOne,
        );
        const playerTwoK = this.getKFactorOfPlayer(
            match.competition,
            match.playerTwo,
        );

        const playerOneElo = ld.last(this.eloCache[match.playerOne])!;
        const playerTwoElo = ld.last(this.eloCache[match.playerTwo])!;

        const expectedA =
            1 / (1 + Math.pow(10, (playerTwoElo - playerOneElo) / 400));
        const expectedB =
            1 / (1 + Math.pow(10, (playerOneElo - playerTwoElo) / 400));

        let actualA = 0.5;
        let actualB = 0.5;
        if (match.playerOneScore > match.playerTwoScore) {
            actualA = 1;
            actualB = 0;
        } else if (match.playerTwoScore > match.playerOneScore) {
            actualB = 1;
            actualA = 0;
        }

        const eloChangeA = (matchK + playerOneK) * (actualA - expectedA);
        const eloChangeB = (matchK + playerTwoK) * (actualB - expectedB);

        return [eloChangeA, eloChangeB];
    }

    @Log("EloController.recalculateAllElos")
    public async recalculateAllElos() {
        if (this.competitionList.length === 0) {
            logger.warn(
                "EloController.recalculateAllElos called with empty competition list",
            );
        }

        this.eloCache = {};
        this.playedTournaments = new DefaultedMap(() => []);

        const matches = await Match.find({
            order: { timestamp: "ASC" },
        });

        const nonForfeitMatches = matches.filter(
            (match) => match.playerOneScore + match.playerTwoScore > 1,
        );

        let updatedMatches = 0;
        for (const match of nonForfeitMatches) {
            const isUpdated = await this.recalculateMatch(match);
            if (isUpdated) {
                updatedMatches += 1;
            }
        }

        for (const player in this.eloCache) {
            const decayedElo = this.calculateDecay(
                ld.last(this.eloCache[player])!,
                this.playedTournaments.get(player),
            );
            if (decayedElo !== ld.last(this.eloCache[player])) {
                this.eloCache[player].push(decayedElo);
            }
        }

        logger.log("Updated the elo of %d matches.", updatedMatches);
    }

    async recalculateMatch(match: Match) {
        if (this.eloCache[match.playerOne] == null) {
            this.eloCache[match.playerOne] = [1000];
        }
        if (this.eloCache[match.playerTwo] == null) {
            this.eloCache[match.playerTwo] = [1000];
        }
        if (
            !this.playedTournaments
                .get(match.playerOne)
                .includes(match.competition)
        ) {
            if (this.playedTournaments.get(match.playerOne).length > 0) {
                const decayedElo = this.calculateDecay(
                    ld.last(this.eloCache[match.playerOne])!,
                    this.playedTournaments.get(match.playerOne),
                    match.competition,
                );
                if (decayedElo !== ld.last(this.eloCache[match.playerOne])) {
                    this.eloCache[match.playerOne].push(decayedElo);
                }
            }
            this.playedTournaments.get(match.playerOne).push(match.competition);
        }
        if (
            !this.playedTournaments
                .get(match.playerTwo)
                .includes(match.competition)
        ) {
            if (this.playedTournaments.get(match.playerTwo).length > 0) {
                const decayedElo = this.calculateDecay(
                    ld.last(this.eloCache[match.playerTwo])!,
                    this.playedTournaments.get(match.playerTwo),
                    match.competition,
                );
                if (decayedElo !== ld.last(this.eloCache[match.playerTwo])) {
                    this.eloCache[match.playerTwo].push(decayedElo);
                }
            }
            this.playedTournaments.get(match.playerTwo).push(match.competition);
        }

        const updatedElo = await this.getEloOfMatch(match);
        let isUpdated = false;
        if (!ld.isEqual(match.eloChange, updatedElo)) {
            match.eloChange = updatedElo;
            await match.save();
            isUpdated = true;
        }

        this.eloCache[match.playerOne].push(
            round(ld.last(this.eloCache[match.playerOne])! + updatedElo[0]),
        );
        this.eloCache[match.playerTwo].push(
            round(ld.last(this.eloCache[match.playerTwo])! + updatedElo[1]),
        );
        return isUpdated;
    }

    getEloOfPlayer(playerUUID: string) {
        return ld.last(this.eloCache[playerUUID]) ?? 1000;
    }

    getEloProgressionOfPlayer(playerUUID: string) {
        return [...(this.eloCache[playerUUID] ?? 1000)];
    }

    calculateDecay(
        elo: number,
        previousTournaments: string[],
        currentTournament?: string,
    ): number {
        let resultingElo = elo;
        let startingIndex = this.competitionList.length;
        if (currentTournament != null) {
            startingIndex = this.competitionList.findIndex(
                (tournament) => currentTournament === tournament,
            );
        }

        let i = 1;
        while (
            !previousTournaments.includes(
                this.competitionList[startingIndex - i],
            ) &&
            startingIndex - i >= 0
        ) {
            resultingElo = this.getDecayedElo(i, resultingElo);
            i += 1;
        }
        return resultingElo;
    }

    getDecayedElo(skippedTournaments: number, elo: number): number {
        if (elo <= 1000) {
            return elo;
        }

        let decayAmount = 0;
        const eloToDecay = elo - 1000;
        switch (skippedTournaments) {
            case 0:
                return elo;
            case 1:
                decayAmount = eloToDecay * 0.06;
                break;
            case 2:
                decayAmount = eloToDecay * 0.1;
                break;
            case 3:
                decayAmount = eloToDecay * 0.14;
                break;
            default:
                decayAmount = eloToDecay * 0.18;
                break;
        }

        decayAmount = round(Math.min(Math.max(decayAmount, 5), 50));
        const resultingElo = Math.max(1000, elo - decayAmount);
        return resultingElo;
    }

    private static getKFactorOfMatch(match: Match): number {
        if (match.competition.startsWith("RRWC")) {
            if (
                match.round.includes("Final") &&
                !match.round.includes("Quarter")
            ) {
                return 45;
            }
            if (match.round.includes("Group")) {
                return 25;
            }
            return 35;
        }

        if (match.round.includes("Final")) {
            return 40;
        }
        return 30;
    }

    private getKFactorOfPlayer(tournament: string, playerUUID: string): number {
        // Initializing rookie boost
        if (this.rookieMatches[playerUUID] == null) {
            this.rookieMatches[playerUUID] = 20;
        }

        // Initializing returnee boost
        if (this.lastTournament[playerUUID] == null) {
            this.lastTournament[playerUUID] = tournament;
        } else if (this.lastTournament[playerUUID] !== tournament) {
            const tourneyDiff = this.getTournamentDifference(
                this.lastTournament[playerUUID],
                tournament,
            );
            if (tourneyDiff > 2) {
                this.returneeMatches[playerUUID] = 10;
            }
            this.lastTournament[playerUUID] = tournament;
        }

        let k = 0;
        if (
            this.returneeMatches[playerUUID] != null &&
            this.returneeMatches[playerUUID] > 0
        ) {
            this.returneeMatches[playerUUID] -= 1;
            if (this.returneeMatches[playerUUID] >= 5) {
                k = 20;
            } else {
                k = 10;
            }
        }

        if (this.rookieMatches[playerUUID] > 0) {
            this.lastTournament[playerUUID] = tournament;
            this.rookieMatches[playerUUID] -= 1;
            if (this.rookieMatches[playerUUID] >= 10) {
                k = 30;
            } else {
                k = 15;
            }
        }

        return k;
    }

    private getTournamentDifference(
        tourneyOne: string,
        tourneyTwo: string,
    ): number {
        const tournamentOneIndex = this.competitionList.findIndex(
            (tournament) => tournament === tourneyOne,
        );
        const tournamentTwoIndex = this.competitionList.findIndex(
            (tournament) => tournament === tourneyTwo,
        );
        return Math.abs(tournamentOneIndex - tournamentTwoIndex);
    }
}

/**
 * Banker's rounding to the nearest integer
 * @param toRound Number to round
 * @returns Rounded number
 */
function round(toRound: number): number {
    const n = +toRound.toFixed(8);
    const i = Math.floor(n);
    const f = n - i;
    const e = 1e-8;
    if (f > 0.5 - e && f < 0.5 + e) {
        return i % 2 == 0 ? i : i + 1;
    } else {
        return Math.round(n);
    }
}
