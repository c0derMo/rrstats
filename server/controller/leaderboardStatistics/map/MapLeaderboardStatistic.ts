import { BaseLeaderboardStatistic } from "../BaseLeaderboardStatistic";

export abstract class MapLeaderboardStatistic<
    T,
> extends BaseLeaderboardStatistic {
    protected mapCache: T | null;

    constructor() {
        super();
        this.mapCache = null;
    }

    abstract buildRows(filter?: Record<string, unknown>): LeaderboardRow[];

    override async get(
        filter?: Record<string, unknown>,
    ): Promise<LeaderboardRow[]> {
        if (this.mapCache == null) {
            await this.calculate();
        }

        return this.buildRows(filter);
    }

    override invalidate(): void {
        this.mapCache = null;
    }
}
