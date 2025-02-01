import { Competition } from "../model/Competition";
import { Match } from "../model/Match";
import ld from "lodash";
import consola from "consola";
import { Log } from "~/utils/FunctionTimer";
import { DefaultedMap } from "~/utils/DefaultedMap";
import { DateTime } from "luxon";
import {
    EventSubscriber,
    type EntitySubscriberInterface,
    type InsertEvent,
    type UpdateEvent,
    Not,
} from "typeorm";
import { Player } from "../model/Player";
import { DebouncedInvalidationFunction } from "~/utils/DebouncedInvalidationFunction";

const logger = consola.withTag("rrstats:elo");
const DAY_IN_MS = 86400000;

interface EloInfo {
    timestamp: number;
    elo: number;
}

export default class EloController {
    private competitionList: Competition[] = [];
    private rookieMatches: Record<string, number> = {};
    private lastTournament: Record<string, string> = {};
    private returneeMatches: Record<string, number> = {};
    private eloCache: Record<string, EloInfo[]> = {};
    private playedTournaments: DefaultedMap<string, string[]> =
        new DefaultedMap(() => []);
    private currentlyRecalculating: Promise<void> | null = null;

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
            where: { officialCompetition: true, updateWithHitmaps: Not(true) },
            order: {
                startingTimestamp: "ASC",
            },
        });
        this.competitionList = competitions;
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

        const playerOneElo = ld.last(this.eloCache[match.playerOne])!.elo;
        const playerTwoElo = ld.last(this.eloCache[match.playerTwo])!.elo;

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

        const eloChangeA = round((matchK + playerOneK) * (actualA - expectedA));
        const eloChangeB = round((matchK + playerTwoK) * (actualB - expectedB));

        return [eloChangeA, eloChangeB];
    }

    @Log("EloController.recalculateAllElos")
    public async recalculateAllElos(): Promise<void> {
        if (this.currentlyRecalculating != null) {
            return this.currentlyRecalculating;
        }
        this.currentlyRecalculating = this._recalculateAllElos();
        await this.currentlyRecalculating;
        this.currentlyRecalculating = null;
    }

    private async _recalculateAllElos() {
        if (this.competitionList.length === 0) {
            logger.warn(
                "EloController.recalculateAllElos called with empty competition list",
            );
        }

        // Reset everything
        this.eloCache = {};
        this.playedTournaments = new DefaultedMap(() => []);
        this.returneeMatches = {};
        this.lastTournament = {};
        this.rookieMatches = {};

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
            this.checkForDecay(player);
        }

        logger.log("Updated the elo of %d matches.", updatedMatches);
    }

    async recalculateMatch(match: Match) {
        if (this.eloCache[match.playerOne] == null) {
            this.eloCache[match.playerOne] = [
                { elo: 1000, timestamp: match.timestamp - DAY_IN_MS },
            ];
        }
        if (this.eloCache[match.playerTwo] == null) {
            this.eloCache[match.playerTwo] = [
                { elo: 1000, timestamp: match.timestamp - DAY_IN_MS },
            ];
        }
        if (
            !this.playedTournaments
                .get(match.playerOne)
                .includes(match.competition)
        ) {
            this.checkForDecay(match.playerOne, match.competition);
        }
        if (
            !this.playedTournaments
                .get(match.playerTwo)
                .includes(match.competition)
        ) {
            this.checkForDecay(match.playerTwo, match.competition);
        }

        const updatedElo = await this.getEloOfMatch(match);
        let isUpdated = false;
        if (
            match.eloChange[0] !== updatedElo[0] ||
            match.eloChange[1] !== updatedElo[1]
        ) {
            match.eloChange = updatedElo;
            await match.save();
            isUpdated = true;
        }

        this.eloCache[match.playerOne].push({
            elo: round(
                ld.last(this.eloCache[match.playerOne])!.elo + updatedElo[0],
            ),
            timestamp: match.timestamp,
        });
        this.eloCache[match.playerTwo].push({
            elo: round(
                ld.last(this.eloCache[match.playerTwo])!.elo + updatedElo[1],
            ),
            timestamp: match.timestamp,
        });
        return isUpdated;
    }

    getEloOfPlayer(playerUUID: string) {
        return ld.last(this.eloCache[playerUUID])?.elo ?? 1000;
    }

    getEloProgressionOfPlayer(playerUUID: string) {
        return [
            ...(this.eloCache[playerUUID] ?? [
                { elo: 1000, timestamp: DateTime.now().toMillis() },
            ]),
        ];
    }

    private checkForDecay(player: string, competition?: string) {
        if (this.playedTournaments.get(player).length > 0) {
            const lastElo = ld.last(this.eloCache[player])!;
            const decayedElo = this.calculateDecay(
                lastElo.elo,
                this.playedTournaments.get(player),
                competition,
            );
            if (decayedElo.length > 0) {
                this.eloCache[player].push(...decayedElo);
            }
        }

        if (competition != null) {
            this.playedTournaments.get(player).push(competition);
        }
    }

    private calculateDecay(
        elo: number,
        previousTournaments: string[],
        currentTournament?: string,
    ): EloInfo[] {
        let resultingElo = elo;
        let startingIndex = this.competitionList.length;
        if (currentTournament != null) {
            startingIndex = this.competitionList.findIndex(
                (tournament) => currentTournament === tournament.tag,
            );
            if (startingIndex < 0) {
                startingIndex = this.competitionList.length;
            }
        }

        const decays: EloInfo[] = [];

        let decayAmount = 0;
        while (
            startingIndex - decayAmount - 1 >= 0 &&
            !previousTournaments.includes(
                this.competitionList[startingIndex - decayAmount - 1].tag,
            )
        ) {
            decayAmount += 1;
        }

        for (let i = 0; i < decayAmount; i++) {
            resultingElo = this.getDecayedElo(i + 1, resultingElo);
            decays.push({
                elo: resultingElo,
                timestamp:
                    this.competitionList[startingIndex - decayAmount + i]
                        .startingTimestamp - DAY_IN_MS,
            });
        }
        return decays;
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
            (tournament) => tournament.tag === tourneyOne,
        );
        const tournamentTwoIndex = this.competitionList.findIndex(
            (tournament) => tournament.tag === tourneyTwo,
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

@EventSubscriber()
export class EloDatabaseListener implements EntitySubscriberInterface {
    private functionCaller = new DebouncedInvalidationFunction(() =>
        EloController.getInstance().recalculateAllElos(),
    );

    afterInsert(event: InsertEvent<unknown>): void {
        this.invalidateElo(event.entity);
    }

    afterUpdate(event: UpdateEvent<unknown>): void {
        this.invalidateElo(event.entity);
    }

    private invalidateElo(entity: unknown) {
        if (
            !(
                entity instanceof Player ||
                entity instanceof Match ||
                entity instanceof Competition
            )
        ) {
            return;
        }

        this.functionCaller.call();
    }
}
