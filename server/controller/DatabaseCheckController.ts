import { InvalidScores } from "./databaseChecks/InvalidScores";
import { MissingPlacements } from "./databaseChecks/MissingPlacements";
import { MissingPlayers } from "./databaseChecks/MissingPlayers";
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
    execute: () => Promise<CheckResult>;
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
    ];

    static getChecks(): CheckInfo[] {
        return this.allChecks.map((check) => check.info);
    }

    static async runChecks(checks: string[]): Promise<CheckResult[]> {
        const checksToRun = this.allChecks.filter((check) =>
            checks.includes(check.info.id),
        );

        const result: CheckResult[] = [];
        for (const check of checksToRun) {
            result.push(await check.execute());
        }

        return result;
    }
}
