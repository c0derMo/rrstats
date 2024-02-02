import { InvalidScores } from "./databaseChecks/InvalidScores";
import { MissingPlacements } from "./databaseChecks/MissingPlacements";
import { MissingPlayers } from "./databaseChecks/MissingPlayers";
import { MissingVODs } from "./databaseChecks/MissingVODs";
import { NoMatches } from "./databaseChecks/NoMatches";
import { RecordMatches } from "./databaseChecks/RecordMatches";
import { RecordSpins } from "./databaseChecks/RecordSpins";

export interface CheckResult {
    name: string;
    issues: string[];
    errors: string[];
}

export interface CheckInfo {
    id: string;
    name: string;
    description: string;
}

export interface DatabaseCheck {
    execute: (ignoredCompetitions: string[]) => Promise<CheckResult>;
    info: CheckInfo;
}

export default class DatabaseCheckController {
    private static readonly allChecks: DatabaseCheck[] = [
        new InvalidScores(),
        new MissingPlayers(),
        new NoMatches(),
        new MissingPlacements(),
        new RecordMatches(),
        new RecordSpins(),
        new MissingVODs(),
    ];

    static getChecks(): CheckInfo[] {
        return this.allChecks.map((check) => check.info);
    }

    static async runChecks(
        checks: string[],
        ignoredCompetitions: string[],
    ): Promise<CheckResult[]> {
        const checksToRun = this.allChecks.filter((check) =>
            checks.includes(check.info.id),
        );

        const result: CheckResult[] = [];
        for (const check of checksToRun) {
            result.push(await check.execute(ignoredCompetitions));
        }

        return result;
    }
}
