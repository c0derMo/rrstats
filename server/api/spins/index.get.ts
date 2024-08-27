import { PlayedMap } from "~/server/model/PlayedMap";
import take from "lodash/take";
import drop from "lodash/drop";

export default defineEventHandler(async (event) => {
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
        .andWhere('played_map.spin != ""')
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
        spins = filterSpins(spins, actualFilter);
        count = spins.length;
        spins = take(drop(spins, query.skip), query.take);
    }

    setResponseHeader(event, "X-Count", count);

    return spins;
});

export function filterSpins(
    spins: PlayedMap[],
    filter: Record<string, { disguise: string; method: string }>,
): PlayedMap[] {
    return spins.filter((spin) => {
        for (const target of spin.spin!.targetConditions) {
            const targetFilter = filter[target.target.name];
            if (
                targetFilter?.disguise != null &&
                targetFilter.disguise !== "" &&
                targetFilter.disguise !== target.disguise.name
            ) {
                return false;
            }
            if (targetFilter?.method == null || targetFilter.method === "") {
                continue;
            }

            const anyName = `Any ${target.killMethod.name}`;
            if (targetFilter.method == anyName) {
                continue;
            }

            const variant = target.killMethod.selectedVariant;
            if (
                variant != null &&
                variant !== "" &&
                targetFilter.method !== `${variant} ${target.killMethod.name}`
            ) {
                return false;
            } else if (
                (variant == null || variant === "") &&
                targetFilter.method !== target.killMethod.name
            ) {
                return false;
            }
        }
        return true;
    });
}
