import { PlayedMap } from "~~/server/model/PlayedMap";
import ld from "lodash";

export default defineEventHandler<Promise<PlayedMap[]>>(async (event) => {
    const query = getQuery<{
        map: number | null;
        take: number;
        skip: number;
        orderBy: string | null;
        sortingOrder: string | null;
        filter: string | null;
    }>(event);

    let queryBuilder = PlayedMap.createQueryBuilder("played_map")
        .where("played_map.spin IS NOT NULL")
        .andWhere("played_map.spin != ''")
        .innerJoinAndSelect("played_map.match", "match");

    if (query.map != null && query.map >= 0) {
        queryBuilder = queryBuilder.andWhere("played_map.map = :map", {
            map: query.map,
        });
    }

    if (
        query.orderBy != null &&
        query.sortingOrder != null &&
        query.sortingOrder !== "" &&
        query.orderBy !== ""
    ) {
        queryBuilder = queryBuilder.orderBy(
            query.orderBy,
            query.sortingOrder as "ASC" | "DESC",
        );
    }

    if (query.filter == null || query.map == null || query.map < 0) {
        queryBuilder = queryBuilder.limit(query.take).offset(query.skip);
    }

    let [spins, count] = await queryBuilder.getManyAndCount();

    if (query.filter != null) {
        const actualFilter = JSON.parse(query.filter);
        if (query.map == HitmanMap.BERLIN) {
            spins = filterBerlinSpins(spins, actualFilter);
        } else {
            spins = filterSpins(spins, actualFilter);
        }
        count = spins.length;
        spins = ld.take(ld.drop(spins, query.skip), query.take);
    }

    setResponseHeader(event, "X-Count", count);

    return spins;
});

function doesTargetFulfilFilter(
    filter: { disguise: string; method: string },
    target: Spin["targetConditions"][0]
): boolean {
    if (
        filter?.disguise != null &&
        filter.disguise !== "" &&
        filter.disguise !== target.disguise.name
    ) {
        return false;
    }
    if (filter?.method == null || filter.method === "") {
        return true;
    }

    const anyName = `Any ${target.killMethod.name}`;
    if (filter.method == anyName) {
        return true;
    }

    const variant = target.killMethod.selectedVariant;
    if (
        (variant != null &&
            variant !== "" &&
            filter.method !==
                `${variant} ${target.killMethod.name}`) ||
        ((variant == null || variant === "") &&
            filter.method !== target.killMethod.name)
    ) {
        return false;
    }
    return true;
}

export function filterSpins(
    spins: PlayedMap[],
    filter: Record<string, { disguise: string; method: string }>,
): PlayedMap[] {
    return spins.filter((spin) => {
        for (const target of spin.spin!.targetConditions) {
            const targetFilter = filter[target.target.name];
            if (!doesTargetFulfilFilter(targetFilter, target)) {
                return false;
            }
        }
        return true;
    });
}

export function filterBerlinSpins(
    spins: PlayedMap[],
    filter: Record<string, { disguise: string; method: string }>,
) {
    return spins.filter((spin) => {
        for (const target in filter) {
            const doesOneTargetFulfilFilter = spin.spin!.targetConditions.some((spinTarget) => {
                return doesTargetFulfilFilter(filter[target], spinTarget);
            });
            if (!doesOneTargetFulfilFilter) {
                return false;
            } 
        }
        return true;
    });
}