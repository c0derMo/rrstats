import { DateTime } from "luxon";
import objectHash from "object-hash";
import { And, In, IsNull, Not } from "typeorm";
import HitmapsSpinIntegration from "~/server/controller/integrations/HitmapsSpinIntegration";
import { PlayedMap } from "~/server/model/PlayedMap";
import type { Spin } from "~/utils/interfaces/IMatch";
import { type HitmanMap, getMap } from "~/utils/mapUtils";
import { calculatePossibleSpinAmount } from "~/utils/spinCountCalculator";

interface SpinStats {
    total: number;
    uniqueSpins: number;
    mostRepeated: {
        count: number;
        spins: PlayedMap[][];
    };
    quickest: PlayedMap[];
    slowest: PlayedMap[];
    average: number | null;
    averageLastYear: number | null;
    possibleSpinFactors: {
        methods: number;
        disguises: number;
        ntkos: number;
    } | null;
}

export default defineEventHandler<Promise<SpinStats>>(async (event) => {
    const query = getQuery<{
        map: string | null;
    }>(event);

    let mapOrUndefined: number | undefined = undefined;
    if (query.map != null && parseInt(query.map) >= 0) {
        mapOrUndefined = parseInt(query.map);
    }

    const [spins, count] = await PlayedMap.findAndCountBy({
        map: mapOrUndefined,
        spin: And(Not(""), Not(IsNull())),
    });

    const uniqueSpinMap = new Map<
        string,
        { count: number; matches: PlayedMap[] }
    >();

    for (const spin of spins) {
        const hashedSpin = quickerHashSpin(spin.spin!);

        let count = 0;
        let matches = [] as PlayedMap[];
        if (uniqueSpinMap.has(hashedSpin)) {
            ({ count, matches } = uniqueSpinMap.get(hashedSpin)!);
        }
        count += 1;
        matches.push(spin);
        uniqueSpinMap.set(hashedSpin, { count, matches });
    }

    // Most repeated spins
    let uniqueRawSpin = [] as PlayedMap[][];
    let repeatedCount = 0;
    for (const uniqueSpin of uniqueSpinMap.values()) {
        if (uniqueSpin.count > repeatedCount) {
            repeatedCount = uniqueSpin.count;
            uniqueRawSpin = [uniqueSpin.matches];
        } else if (uniqueSpin.count === repeatedCount) {
            uniqueRawSpin.push(uniqueSpin.matches);
        }
    }

    const mostRepeatedSpins = [] as PlayedMap[][];
    for (const repeatedSpins of uniqueRawSpin) {
        const fullSpins = await PlayedMap.find({
            where: { uuid: In(repeatedSpins.map((spin) => spin.uuid)) },
            relations: { match: true },
        });
        mostRepeatedSpins.push(fullSpins);
    }

    // Quickest & slowest spin - iterating
    let quickestRaw = [] as PlayedMap[];
    let slowestRaw = [] as PlayedMap[];
    const spinsWithTime = spins.filter((spin) => spin.timeTaken > 0);
    for (const spin of spinsWithTime) {
        if (
            quickestRaw.length == 0 ||
            quickestRaw[0].timeTaken > spin.timeTaken
        ) {
            quickestRaw = [spin];
        } else if (quickestRaw[0]?.timeTaken === spin.timeTaken) {
            quickestRaw.push(spin);
        }
        if (
            slowestRaw.length == 0 ||
            slowestRaw[0].timeTaken < spin.timeTaken
        ) {
            slowestRaw = [spin];
        } else if (slowestRaw[0]?.timeTaken === spin.timeTaken) {
            slowestRaw.push(spin);
        }
    }
    const slowest = await PlayedMap.find({
        where: { uuid: In(slowestRaw.map((map) => map.uuid)) },
        relations: { match: true },
    });
    const quickest = await PlayedMap.find({
        where: { uuid: In(quickestRaw.map((map) => map.uuid)) },
        relations: { match: true },
    });

    const average = await PlayedMap.average("timeTaken", {
        map: mapOrUndefined,
    });
    let qb = PlayedMap.createQueryBuilder("played_map")
        .select("AVG(played_map.timeTaken)", "avg")
        .innerJoin("played_map.match", "match")
        .where("match.timestamp >= :one_year_ago", {
            one_year_ago: DateTime.now().minus({ years: 1 }).toMillis(),
        });

    if (mapOrUndefined != null) {
        qb = qb.andWhere("played_map.map = :map", { map: mapOrUndefined });
    }

    const result = await qb.execute();

    const averageLastYear = result[0]["avg"];

    let spinFactors: {
        methods: number;
        disguises: number;
        ntkos: number;
    } | null = null;
    if (mapOrUndefined != null) {
        const map = getMap(mapOrUndefined as HitmanMap)!;
        const disguises = await HitmapsSpinIntegration.getDisguises(map);
        const killMethods = await HitmapsSpinIntegration.getKillMethods(map);
        spinFactors = calculatePossibleSpinAmount(disguises, killMethods);
    }

    return {
        total: count,
        uniqueSpins: uniqueSpinMap.size,
        mostRepeated: {
            count: repeatedCount,
            spins: mostRepeatedSpins,
        },
        quickest: quickest,
        slowest: slowest,
        average: average,
        averageLastYear: averageLastYear,
        possibleSpinFactors: spinFactors,
    };
});

function quickerHashSpin(spin: Spin) {
    // Minified to make hashing quicker
    const temp = {} as Record<string, { d: string; m: string; c?: string }>;

    for (const target of spin.targetConditions) {
        temp[target.target.name] = {
            d: target.disguise.name,
            m:
                target.killMethod.selectedVariant != null &&
                target.killMethod.selectedVariant !== ""
                    ? `${target.killMethod.selectedVariant}${target.killMethod.name}`
                    : target.killMethod.name,
            c: target.complications
                .map((complication) => complication.name)
                .join(""),
        };
    }

    for (const additional of spin.additionalObjectives) {
        temp[additional.objective.name] = {
            d: additional.disguise.name,
            m: additional.completionMethod.name,
        };
    }

    return objectHash(temp);
}
