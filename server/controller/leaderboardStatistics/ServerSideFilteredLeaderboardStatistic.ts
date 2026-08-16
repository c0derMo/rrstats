import ld from "lodash";
import { BaseLeaderboardStatistic } from "./BaseLeaderboardStatistic";

export interface FilterableLeaderboardRows {
    filter: Record<string, unknown>,
    rows: LeaderboardRow[]
}

export abstract class ServerSideFilteredLeaderboardStatistic extends BaseLeaderboardStatistic {
    protected filterableCache: FilterableLeaderboardRows[] | null;

    constructor() {
        super();
        this.filterableCache = null;
    }

    override async get(filter?: Record<string, unknown>): Promise<LeaderboardRow[]> {
        if (this.filterableCache == null) {
            await this.calculate();
        }

        const row = this.filterableCache?.find((option) => ld.isEqual(option.filter, filter ?? {}));
        return row?.rows ?? [];
    }

    override invalidate(): void {
        this.filterableCache = null;
    }
}