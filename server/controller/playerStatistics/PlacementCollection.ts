import {
    ICompetition,
    ICompetitionPlacement,
} from "~/utils/interfaces/ICompetition";

type CacheKey = "bestPlacement";

export default class PlacementCollection {
    private placements: ICompetitionPlacement[];
    private competitions: ICompetition[];
    private cache: Map<CacheKey, unknown>;

    constructor(
        placements: ICompetitionPlacement[],
        competitions: ICompetition[],
    ) {
        this.placements = placements;
        this.competitions = competitions;
        this.cache = new Map();
    }

    private getCachedOrCalculate<T>(key: CacheKey, calculator: () => T): T {
        if (!this.cache.has(key)) {
            this.cache.set(key, calculator());
        }
        return this.cache.get(key) as T;
    }

    bestPlacement(): number | undefined {
        return this.getCachedOrCalculate("bestPlacement", () => {
            const officialPlacements = this.placements
                .filter((placement) =>
                    isPlacementOfOfficialCompetition(
                        placement,
                        this.competitions,
                    ),
                )
                .filter(isNumericPlacement);

            if (officialPlacements.length <= 0) return undefined;
            return officialPlacements
                .map((placement) => placement.placement)
                .reduce((prev, cur) => {
                    return Math.min(prev!, cur!);
                }, Number.MAX_SAFE_INTEGER);
        });
    }
}

// Filter functions
function isOfficialCompetition(competition: ICompetition): boolean {
    return competition.officialCompetition;
}

function isPlacementOfOfficialCompetition(
    placement: ICompetitionPlacement,
    competitions: ICompetition[],
): boolean {
    const competition = competitions.find(
        (comp) => comp.tag === placement.competition,
    );
    return competition != null && isOfficialCompetition(competition);
}

function isNumericPlacement(placement: ICompetitionPlacement): boolean {
    return placement.placement != null;
}
