import { Competition } from "../model/Competition";
import { Match } from "../model/Match";
import ld from "lodash";
import consola from "consola";
import { DateTime } from "luxon";
import {
    EventSubscriber,
    type EntitySubscriberInterface,
    type InsertEvent,
    type UpdateEvent,
    MoreThan,
} from "typeorm";
import { Player } from "../model/Player";
import { isReady } from "../readyListener";

const logger = consola.withTag("rrstats:elo");
const DAY_IN_MS = 86400000;

interface EloInfo {
    timestamp: number;
    elo: number;
}

class PlayerElo {
    private readonly eloList: EloInfo[];
    private readonly playedTournaments: Set<string>;
    private rookieMatches: number;
    private lastTournament: string;
    private returneeMatches: number;

    constructor() {
        this.eloList = [];
        this.rookieMatches = 20;
        this.lastTournament = "";
        this.returneeMatches = 0;
        this.playedTournaments = new Set();
    }

    public getCurrentElo(): number {
        return ld.last(this.eloList)?.elo ?? 1000;
    }

    public getEloHistory(): EloInfo[] {
        return this.eloList.length > 0
            ? this.eloList
            : [
                  {
                      elo: 1000,
                      timestamp: DateTime.now().toMillis(),
                  },
              ];
    }

    public checkForDecay(currentTournament?: string): void {
        const compList = EloController.getInstance().getCompetitionList();
        let startingIndex = compList.length;

        if (currentTournament != null) {
            startingIndex = compList.findIndex(
                (tournament) => currentTournament === tournament.tag,
            );
            if (startingIndex < 0) {
                startingIndex = compList.length;
            }
        }

        let decayAmount = 0;
        let checkIndex = 0;
        while (
            startingIndex - checkIndex - 1 >= 0 &&
            !this.playedTournaments.has(
                compList[startingIndex - checkIndex - 1].tag,
            )
        ) {
            if (
                compList[startingIndex - checkIndex - 1].updateWithHitmaps ===
                false
            ) {
                decayAmount += 1;
            }
            checkIndex += 1;
        }

        for (let i = 0; i < decayAmount; i++) {
            const decayedElo = calculateDecayedElo(i + 1, this.getCurrentElo());
            this.addAbsoluteEloPoint(
                decayedElo,
                compList[startingIndex - decayAmount + i].startingTimestamp -
                    DAY_IN_MS,
            );
        }
    }

    public addPlayedTournament(comp: string): void {
        if (this.playedTournaments.size == 0) {
            this.playedTournaments.add(comp);
            return;
        }
        if (!this.playedTournaments.has(comp)) {
            this.checkForDecay(comp);
            this.playedTournaments.add(comp);
        }
    }

    public addEloPoint(eloChange: number, timestamp: number): void {
        if (this.eloList.length === 0) {
            this.eloList.push({ elo: 1000, timestamp: timestamp - DAY_IN_MS });
        }
        this.eloList.push({ elo: this.getCurrentElo() + eloChange, timestamp });
        this.eloList.sort((a, b) => a.timestamp - b.timestamp);
    }

    public getKFactor(tournament: string) {
        if (this.lastTournament !== tournament) {
            const tourneyDiff =
                EloController.getInstance().getTournamentDifference(
                    this.lastTournament,
                    tournament,
                );
            if (tourneyDiff > 2) {
                this.returneeMatches = 10;
            }
            this.lastTournament = tournament;
        }

        let k = 0;
        if (this.returneeMatches > 0) {
            this.returneeMatches -= 1;
            if (this.returneeMatches >= 5) {
                k = 20;
            } else {
                k = 10;
            }
        }
        if (this.rookieMatches > 0) {
            this.rookieMatches -= 1;
            if (this.rookieMatches >= 10) {
                k = 30;
            } else {
                k = 15;
            }
        }

        return k;
    }

    private addAbsoluteEloPoint(elo: number, timestamp: number): void {
        if (this.eloList.length === 0) {
            this.eloList.push({ elo: 1000, timestamp: timestamp - DAY_IN_MS });
        }
        this.eloList.push({ elo: elo, timestamp });
        this.eloList.sort((a, b) => a.timestamp - b.timestamp);
    }
}

export default class EloController {
    private readonly playerElos: DefaultedMap<string, PlayerElo> =
        new DefaultedMap(() => new PlayerElo());
    private competitionList: Competition[] = [];
    private currentlyRecalculating: Promise<void> | null = null;

    private static instance: EloController | null = null;

    private constructor() {}

    static getInstance(): EloController {
        EloController.instance ??= new EloController();
        return EloController.instance;
    }

    async fetchCompetitions(): Promise<void> {
        const competitions = await Competition.find({
            where: { officialCompetition: true },
            order: {
                startingTimestamp: "ASC",
            },
        });
        this.competitionList = competitions;
    }

    public getCompetitionList(): ICompetition[] {
        return [...this.competitionList];
    }

    public async getEloOfMatch(match: IMatch): Promise<number[]> {
        const matchK = EloController.getKFactorOfMatch(match);
        const playerOneK = this.playerElos
            .get(match.playerOne)
            .getKFactor(match.competition);
        const playerTwoK = this.playerElos
            .get(match.playerTwo)
            .getKFactor(match.competition);

        const playerOneElo = this.playerElos
            .get(match.playerOne)
            .getCurrentElo();
        const playerTwoElo = this.playerElos
            .get(match.playerTwo)
            .getCurrentElo();

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
        this.playerElos.clear();

        const matches = await Match.createQueryBuilder("match")
            .select([
                "match.playerOne",
                "match.playerTwo",
                "match.playerOneScore",
                "match.playerTwoScore",
                "match.competition",
                "match.eloChange",
                "match.timestamp",
                "match.round",
                "match.uuid",
            ])
            .orderBy("match.timestamp", "ASC")
            .getMany();

        let updatedMatches = 0;
        for (const match of filterForfeitMatches(matches)) {
            const isUpdated = await this.recalculateMatch(match);
            if (isUpdated) {
                await Match.createQueryBuilder("match")
                    .update()
                    .set({ eloChange: match.eloChange })
                    .where("match.uuid = :uuid", { uuid: match.uuid })
                    .execute();
                updatedMatches += 1;
            }
        }

        this.playerElos.forEach((_, elo) => elo.checkForDecay());

        logger.log("Updated the elo of %d matches.", updatedMatches);
    }

    async recalculateMatch(match: IMatch) {
        this.playerElos
            .get(match.playerOne)
            .addPlayedTournament(match.competition);
        this.playerElos
            .get(match.playerTwo)
            .addPlayedTournament(match.competition);

        const updatedElo = await this.getEloOfMatch(match);
        let isUpdated = false;
        if (
            match.eloChange?.[0] !== updatedElo[0] ||
            match.eloChange?.[1] !== updatedElo[1]
        ) {
            match.eloChange = updatedElo;
            isUpdated = true;
        }

        this.playerElos
            .get(match.playerOne)
            .addEloPoint(updatedElo[0], match.timestamp);
        this.playerElos
            .get(match.playerTwo)
            .addEloPoint(updatedElo[1], match.timestamp);
        return isUpdated;
    }

    getEloOfPlayer(playerUUID: string) {
        if (!this.playerElos.has(playerUUID)) {
            return 1000;
        }
        return this.playerElos.get(playerUUID).getCurrentElo();
    }

    getEloProgressionOfPlayer(playerUUID: string): EloInfo[] {
        if (!this.playerElos.has(playerUUID)) {
            return [{ elo: 1000, timestamp: DateTime.now().toMillis() }];
        }
        return this.playerElos.get(playerUUID).getEloHistory();
    }

    private static getKFactorOfMatch(match: IMatch): number {
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

        if (match.round.includes("Final") && !match.round.includes("Quarter")) {
            return 40;
        }
        return 30;
    }

    public getTournamentDifference(
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

function calculateDecayedElo(skippedTournaments: number, elo: number): number {
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

@EventSubscriber()
export class EloDatabaseListener implements EntitySubscriberInterface {
    private readonly matchesToIgnore: Set<string> = new Set();

    private readonly functionCaller = new DebouncedInvalidationFunction(() =>
        EloController.getInstance().recalculateAllElos(),
    );
    private readonly compCaller = new DebouncedInvalidationFunction(() =>
        EloController.getInstance().fetchCompetitions(),
    );

    async beforeInsert(event: InsertEvent<unknown>): Promise<void> {
        if (event.entity instanceof Match) {
            const newerMatches = await Match.countBy({
                timestamp: MoreThan(event.entity.timestamp),
            });
            if (newerMatches <= 0) {
                await EloController.getInstance().recalculateMatch(
                    event.entity,
                );
                this.matchesToIgnore.add(event.entity.uuid);
            }
        }
    }

    afterInsert(event: InsertEvent<unknown>): void {
        this.invalidateElo(event.entity);
    }

    afterUpdate(event: UpdateEvent<unknown>): void {
        this.invalidateElo(event.entity);
    }

    private invalidateElo(entity: unknown) {
        if (!isReady()) {
            return;
        }
        if (
            !(
                entity instanceof Player ||
                entity instanceof Match ||
                entity instanceof Competition
            )
        ) {
            return;
        }

        if (entity instanceof Match && this.matchesToIgnore.has(entity.uuid)) {
            this.matchesToIgnore.delete(entity.uuid);
            return;
        }

        if (entity instanceof Competition) {
            this.compCaller.call();
        }

        this.functionCaller.call();
    }
}
