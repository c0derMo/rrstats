import { DateTime } from "luxon";
import { Log } from "~/utils/FunctionTimer";
import type { HitmanMapInfo } from "~/utils/mapUtils";
import consola from "consola";

interface CacheEntry {
    disguises: string[];
    killMethods: Record<string, string[]>;
    lastFetched: DateTime;
}

interface HitmapsKillCondition {
    name: string;
    largeWeapon: boolean;
    tileUrl: string;
    variants: {
        name: string;
        largeWeapon: boolean;
        imageOverride: string | null;
    }[];
    remote: boolean;
}

interface HitmapsDisguise {
    id: number;
    name: string;
    image: string;
    order: number;
    suit: boolean;
}

const logger = consola.withTag("rrstats:hitmaps_spins");

export default class HitmapsSpinIntegration {
    private static cache: Map<string, CacheEntry> = new Map();

    public static async getDisguises(map: HitmanMapInfo): Promise<string[]> {
        if (
            !HitmapsSpinIntegration.cache.has(map.slug) ||
            HitmapsSpinIntegration.cache
                .get(map.slug)!
                .lastFetched.diffNow()
                .as("days") > 1
        ) {
            await HitmapsSpinIntegration.refetch(map);
        }
        return HitmapsSpinIntegration.cache.get(map.slug)!.disguises;
    }

    public static async getKillMethods(
        map: HitmanMapInfo,
    ): Promise<Record<string, string[]>> {
        if (
            !HitmapsSpinIntegration.cache.has(map.slug) ||
            HitmapsSpinIntegration.cache
                .get(map.slug)!
                .lastFetched.diffNow()
                .as("days") > 1
        ) {
            await HitmapsSpinIntegration.refetch(map);
        }
        return HitmapsSpinIntegration.cache.get(map.slug)!.killMethods;
    }

    @Log("HitmapsSpinIntegration.refetch")
    private static async refetch(map: HitmanMapInfo): Promise<void> {
        const season = "hitman" + (map.season > 1 ? map.season : "");
        const locationName = map.name
            .toLowerCase()
            .replace(/\s/g, "-")
            .replace(/à/g, "a");
        const slug = map.slug;

        let disguises: string[] = [];
        const killConditions: Record<string, string[]> = {};

        try {
            const rawDisguises = await $fetch<{ disguises: HitmapsDisguise[] }>(
                `https://api.hitmaps.com/api/games/${season}/locations/${locationName}/missions/${slug}/disguises`,
            );
            disguises = [
                ...rawDisguises.disguises
                    .filter((disguise) => !disguise.suit)
                    .map((disguise) => disguise.name),
                "Suit",
            ];
        } catch (e) {
            logger.error(
                `The following error occured while fetching disguises for ${map.name}:`,
            );
            logger.error(e);
        }

        for (const target of map.targets) {
            try {
                const rawKillMethods = await $fetch<HitmapsKillCondition[]>(
                    "https://rouletteapi.hitmaps.com/api/spins/kill-conditions",
                    {
                        query: {
                            missionGame: season,
                            missionLocation: locationName,
                            missionSlug: slug,
                            specificDisguises: true,
                            specificMelee: true,
                            specificFirearms: true,
                            specificAccidents: true,
                            impossibleOrDifficultKills: true,
                            targetName: target.name,
                        },
                    },
                );

                killConditions[target.name] =
                    HitmapsSpinIntegration.buildKillMethods(rawKillMethods);
            } catch (e) {
                logger.error(
                    `The following error occured while fetching kill methods for ${target.name}:`,
                );
                logger.error(e);
            }
        }

        HitmapsSpinIntegration.cache.set(map.slug, {
            disguises,
            killMethods: killConditions,
            lastFetched: DateTime.now(),
        });
    }

    private static buildKillMethods(raw: HitmapsKillCondition[]): string[] {
        return raw
            .map((rawCondition) => {
                if (rawCondition.variants.length > 0) {
                    return [
                        ...rawCondition.variants.map(
                            (variant) => `${variant.name} ${rawCondition.name}`,
                        ),
                        `Any ${rawCondition.name}`,
                        rawCondition.name,
                    ];
                } else {
                    return [rawCondition.name];
                }
            })
            .reduce((cur, prev) => [...cur, ...prev], []);
    }
}
