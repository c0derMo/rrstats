export abstract class BaseLeaderboardStatistic {
    protected cache: LeaderboardRow[] | null;

    constructor() {
        this.cache = null;
    }

    abstract basedOn(): (
        "player" | "match" | "map" | "comp" | "placement" | "achievement"
    )[];
    abstract getTableDefinition(): LeaderboardTableDefinition;
    abstract calculate(): Promise<void>;

    async get(_?: Record<string, unknown>): Promise<LeaderboardRow[]> {
        if (this.cache == null) {
            await this.calculate();
        }
        return this.cache ?? [];
    }

    invalidate() {
        this.cache = null;
    }

    protected sortAndInferPlacementByValue(
        rows: LeaderboardRow[],
        order: "ASC" | "DESC" = "DESC",
    ) {
        rows.sort((a, b) => b.value - a.value);
        if (order === "ASC") {
            rows.reverse();
        }

        rows.forEach((row) => {
            const placement =
                rows.findIndex((compare) => compare.value === row.value) + 1;
            row.order = placement;
        });
    }
}
