<template>
    <div>
        <MatchDetailsDialog
            v-if="detailedMatch != null"
            :match="detailedMatch"
            @click-outside="
                detailedMatch = null;
                loadingUuid = '';
            "
        />

        <div class="flex flex-col gap-3 md:mx-10">
            <h1 class="text-center text-5xl bold mb-2">
                Roulette Rivals Spins
            </h1>

            <DropdownComponent
                v-model="selectedMap"
                :items="maps"
                class="w-full"
            />

            <TabbedContainer :tabs="['Spins', 'Statistics']">
                <template #Statistics>
                    <SpinStatistics :map="selectedMap" />
                </template>

                <template #Spins>
                    <template v-if="selectedMap >= 0">
                        <div class="flex flex-col gap-2">
                            <div
                                v-for="(target, idx) in targets"
                                :key="idx"
                                class="flex flex-row gap-5 w-full"
                            >
                                <div class="font-bold w-1/6 text-right">
                                    {{ target }}
                                </div>
                                <div class="w-1/3">
                                    <AutocompleteComponent
                                        placeholder="Kill Method"
                                        :suggestions="killMethods[target]"
                                        @input="
                                            (val) =>
                                                (filterMethods[target] = val)
                                        "
                                        @defocus="requeryAndForceGet"
                                    />
                                </div>
                                <div class="w-1/3">
                                    <AutocompleteComponent
                                        placeholder="Disguise"
                                        :suggestions="disguises"
                                        @input="
                                            (val) =>
                                                (filterDisguises[target] = val)
                                        "
                                        @defocus="requeryAndForceGet"
                                    />
                                </div>
                            </div>
                        </div>
                    </template>

                    <DataTableComponent
                        :key="triggerReGet"
                        v-model:selected-rows-per-page="itemsPerPage"
                        :headers="tableHeaders"
                        :rows-per-page="[10, 20, 25, 50]"
                        :number-of-items="amountSpins"
                        :query-function="getSpins"
                        disable-all-per-page
                        always-sort
                    >
                        <template #[`match.timestamp`]="{ row }">
                            {{
                                DateTime.fromMillis(row.match.timestamp)
                                    .setLocale(useLocale().value)
                                    .toLocaleString(DateTime.DATETIME_MED)
                            }}
                        </template>

                        <template #map="{ value }: { value: HitmanMap }">
                            <MapTag :map="getMap(value)!" full-name />
                        </template>

                        <template #spin="{ value }: { value: Spin | null }">
                            <TextualSpin v-if="value != null" :spin="value" />
                        </template>

                        <template #timeTaken="{ value }">
                            {{
                                (value as number) > 0
                                    ? Duration.fromObject({
                                          seconds: value,
                                      }).toFormat("mm:ss")
                                    : "unknown"
                            }}
                        </template>

                        <template #player="{ row }">
                            <span v-if="isDraw(row)" class="italic">
                                Draw ({{ joinPlayers(row) }})
                            </span>
                            <template v-else>
                                <span class="text-green-600">{{
                                    getWinningPlayer(row)
                                }}</span>
                                vs {{ getLosingPlayer(row) }}
                            </template>
                        </template>

                        <template #match="{ row }">
                            {{ row.match.competition }} {{ row.match.round }}

                            <ButtonComponent
                                :loading="loadingUuid === row.match.uuid"
                                class="ml-5"
                                @click="showMatch(row.match.uuid)"
                            >
                                <FontAwesomeIcon
                                    :icon="['fas', 'ellipsis-h']"
                                    size="xs"
                                />
                            </ButtonComponent>
                        </template>
                    </DataTableComponent>
                </template>
            </TabbedContainer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DateTime, Duration } from "luxon";
import {
    type IMatch,
    type IPlayedMap,
    type Spin,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";

useHead({
    title: "Spins - RRStats",
});

const maps = [
    { text: "-- all maps --", value: -1 },
    ...getAllMaps().map((map) => {
        return { text: getMap(map)!.name, value: map };
    }),
];
const tableHeaders = [
    {
        key: "match.timestamp",
        title: "Date",
        sort: (_1: unknown, _2: unknown, a: IPlayedMap, b: IPlayedMap) =>
            a.match.timestamp - b.match.timestamp,
    },
    { key: "map", title: "Map", disableSort: true },
    { key: "spin", title: "Spin", disableSort: true },
    { key: "timeTaken", title: "RTA" },
    { key: "player", title: "Player", disableSort: true },
    { key: "match", title: "Match", disableSort: true },
];

const selectedMap = ref(-1);
const detailedMatch: Ref<IMatch | null> = ref(null);
const loadingUuid = ref("");
const spins = ref<IPlayedMap[]>([]);
const spinStartingIndex = ref(0);
const itemsPerPage = ref(10);
const orderingBy = ref<string | null>(null);
const sortingOrder = ref<"ASC" | "DESC" | null>(null);
const queryQueue = ref<number[]>([]);
const currentlyQuerying = ref<Promise<void> | null>(null);
const triggerReGet = ref(0);
const amountSpins = ref(0);
const playerLookup = usePlayers();

await playerLookup.queryAll();

const disguises: Ref<string[]> = ref([]);
const killMethods: Ref<Record<string, string[]>> = ref({});

const filterDisguises: Ref<Record<string, string>> = ref({});
const filterMethods: Ref<Record<string, string>> = ref({});

async function querySpins(startIndex?: number) {
    if (startIndex == null) {
        startIndex = spinStartingIndex.value + itemsPerPage.value;
    }
    if (currentlyQuerying.value != null) {
        queryQueue.value.push(startIndex);
        await currentlyQuerying.value;
        return;
    }
    currentlyQuerying.value = new Promise<void>((resolve) => {
        let filterObject = {} as
            | Record<string, { disguise: string | null; method: string | null }>
            | undefined;

        for (const target of targets.value) {
            if (
                (filterDisguises.value[target] != null &&
                    filterDisguises.value[target] !== "") ||
                (filterMethods.value[target] != null &&
                    filterMethods.value[target] !== "")
            ) {
                filterObject![target] = {
                    disguise: filterDisguises.value[target],
                    method: filterMethods.value[target],
                };
            }
        }

        if (Object.keys(filterObject!).length === 0) {
            filterObject = undefined;
        }

        $fetch
            .raw("/api/spins", {
                query: {
                    map: selectedMap.value >= 0 ? selectedMap.value : undefined,
                    skip: Math.max(0, startIndex! - itemsPerPage.value),
                    take: itemsPerPage.value * 3,
                    orderBy: orderingBy.value,
                    sortingOrder: sortingOrder.value,
                    filter: filterObject,
                },
            })
            .then((spinRequest) => {
                amountSpins.value = parseInt(
                    spinRequest.headers.get("X-Count") ?? "0",
                );
                spins.value = spinRequest._data as IPlayedMap[];
                spinStartingIndex.value = startIndex!;
                resolve();
            });
    });

    await currentlyQuerying.value;
    currentlyQuerying.value = null;

    if (queryQueue.value.length != 0) {
        const nextQuery = queryQueue.value.splice(0, 1)[0];
        await querySpins(nextQuery);
    }
}

async function getSpins(
    skip: number,
    take: number,
    newOrderBy: string | null,
    newSortingOrder: "ASC" | "DESC" | null,
) {
    let mustRequery = false;
    if (
        newOrderBy !== orderingBy.value ||
        newSortingOrder !== sortingOrder.value
    ) {
        orderingBy.value = newOrderBy;
        sortingOrder.value = newSortingOrder;
        mustRequery = true;
    }

    if (take !== itemsPerPage.value) {
        itemsPerPage.value = take;
    }

    if (
        skip < spinStartingIndex.value ||
        skip + take > spinStartingIndex.value + spins.value.length
    ) {
        mustRequery = true;
    }

    if (mustRequery) {
        await querySpins(skip);
    }

    const result = spins.value.slice(
        skip - spinStartingIndex.value,
        skip - spinStartingIndex.value + take,
    );

    if (!mustRequery) {
        void querySpins(skip);
    }
    return result;
}

async function updateSpins() {
    filterDisguises.value = {};
    filterMethods.value = {};
    for (const target of targets.value) {
        filterDisguises.value[target] = "";
        filterMethods.value[target] = "";
    }

    try {
        if (selectedMap.value >= 0) {
            const conditionsRequest = await $fetch("/api/spins/filters", {
                query: { map: selectedMap.value },
            });
            disguises.value = conditionsRequest.disguises;
            killMethods.value = conditionsRequest.killMethods;
        } else {
            disguises.value = [];
            killMethods.value = {};
        }
    } catch (e) {
        console.warn("Updating spins failed");
        return;
    }

    await requeryAndForceGet();
}

async function requeryAndForceGet() {
    await querySpins();
    triggerReGet.value += 1;
}

const targets = computed(() => {
    if (selectedMap.value < 0) {
        return [];
    }

    return getMap(selectedMap.value)!.targets.map((target) => target.name);
});

function isDraw(map: IPlayedMap): boolean {
    return map.winner === WinningPlayer.DRAW;
}

function joinPlayers(map: IPlayedMap): string {
    return (
        playerLookup.get(map.match.playerOne) +
        ", " +
        playerLookup.get(map.match.playerTwo)
    );
}

function getWinningPlayer(map: IPlayedMap): string {
    if (map.winner === WinningPlayer.PLAYER_ONE) {
        return playerLookup.get(map.match.playerOne);
    } else if (map.winner === WinningPlayer.PLAYER_TWO) {
        return playerLookup.get(map.match.playerTwo);
    }
    return "n/a";
}

function getLosingPlayer(map: IPlayedMap): string {
    if (map.winner === WinningPlayer.PLAYER_ONE) {
        return playerLookup.get(map.match.playerTwo);
    } else if (map.winner === WinningPlayer.PLAYER_TWO) {
        return playerLookup.get(map.match.playerOne);
    }
    return "n/a";
}

async function showMatch(uuid: string) {
    loadingUuid.value = uuid;
    const match = await $fetch<IMatch | null>(`/api/matches?uuid=${uuid}`);
    detailedMatch.value = match;
}

watch(selectedMap, updateSpins);
await querySpins();
</script>
