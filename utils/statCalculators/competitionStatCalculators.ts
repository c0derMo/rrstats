import { ICompetition, ICompetitionPlacement } from "../interfaces/ICompetition";
import { IMatch } from "../interfaces/IMatch";

function filterPlacements(placements: ICompetitionPlacement[], competitions: ICompetition[]): ICompetitionPlacement[] {
    return placements.filter(p => {
        const competition = competitions.find(comp => comp.tag === p.competition);
        if (competition === undefined) {
            throw new Error(`bestPlacement called with missing competition for placement for ${p.competition}`);
        }
        return p.placement !== undefined && competition.officialCompetition
    });
}

export function bestRRPlacement(placements: ICompetitionPlacement[], competitions: ICompetition[]): number | undefined {
    const usablePlacements = filterPlacements(placements, competitions);

    if (usablePlacements.length <= 0) {
        return undefined
    }

    let bestPlacement = usablePlacements[0].placement!;
    for (const placement of usablePlacements) {
        if (placement.placement! < bestPlacement) {
            bestPlacement = placement.placement!;
        }
    }

    return bestPlacement;
}

export function amountRRWins(placements: ICompetitionPlacement[], competitions: ICompetition[]): number {
    const usablePlacements = filterPlacements(placements, competitions);

    let wins = 0;
    for (const placement of usablePlacements) {
        if (placement.placement === 1) {
            wins++;
        }
    }

    return wins;
}

export function amountRRs(matches: IMatch[]): number {
    const rrs = new Set<string>();
    for (const match of matches) {
        rrs.add(match.competition);
    }
    return rrs.size;
}

export function averageRRPlacement(placements: ICompetitionPlacement[], competitions: ICompetition[]): number | undefined {
    const usablePlacements = filterPlacements(placements, competitions);

    if (usablePlacements.length === 0) {
        return undefined;
    }

    let average = 0;
    for (const placement of usablePlacements) {
        average += placement.placement!;
    }

    return average / usablePlacements.length;
}