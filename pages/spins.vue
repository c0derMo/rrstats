<template>
    <div>
        <MatchDetailsDialog
            v-if="detailedMatch != null"
            :match="detailedMatch"
            :opponents="playerLookup"
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
                    <SpinStatistics
                        :spins="filteredSpins"
                        :players="playerLookup"
                        :disguises="disguises"
                        :kill-methods="killMethods"
                    />
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
                                    />
                                </div>
                            </div>
                        </div>
                    </template>

                    <DataTableComponent
                        :headers="tableHeaders"
                        :rows="filteredSpins"
                        :rows-per-page="[10, 20, 25, 50]"
                        :items-per-page="10"
                        :disable-all="filteredSpins.length > 250"
                        always-sort
                    >
                        <template #date="{ row }">
                            {{
                                DateTime.fromMillis(
                                    row.match.timestamp,
                                ).toLocaleString(DateTime.DATETIME_MED)
                            }}
                        </template>

                        <template #map="{ value }">
                            <MapTag
                                :map="getMap(value as HitmanMap)!"
                                full-name
                            />
                        </template>

                        <template #spin="{ value }">
                            <TextualSpin
                                v-if="value != null"
                                :spin="value as Spin"
                            />
                        </template>

                        <template #timeTaken="{ value }">
                            {{
                                (value as number) > 0
                                    ? Duration.fromObject({
                                          seconds: value as number,
                                      }).toFormat("mm:ss")
                                    : "unknown"
                            }}
                        </template>

                        <template #player="{ row }">
                            <span v-if="isDraw(row)" class="italic"
                                >Draw ({{ joinPlayers(row) }})</span
                            >
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
                                :loading="loadingUuid === row.matchUuid"
                                class="ml-5"
                                @click="showMatch(row.matchUuid)"
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
        key: "date",
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

const { data: spins } = await useFetch("/api/spins");
const { data: playerLookup } = await useFetch("/api/player/lookup", {
    default() {
        return {} as Record<string, string>;
    },
});
const disguises: Ref<string[]> = ref([]);
const killMethods: Ref<Record<string, string[]>> = ref({});

const filterDisguises: Ref<Record<string, string>> = ref({});
const filterMethods: Ref<Record<string, string>> = ref({});

async function updateSpins() {
    filterDisguises.value = {};
    filterMethods.value = {};
    for (const target of targets.value) {
        filterDisguises.value[target] = "";
        filterMethods.value[target] = "";
    }

    try {
        const spinRequest = await $fetch("/api/spins", {
            query: {
                map: selectedMap.value >= 0 ? selectedMap.value : undefined,
            },
        });
        const playerRequest = await $fetch(`/api/player/lookup`);
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
        playerLookup.value = playerRequest;
        spins.value = spinRequest;
    } catch (e) {
        console.warn("Updating spins failed");
        return;
    }
}

const filteredSpins = computed(() => {
    return [...(spins.value ?? [])]
        .filter((spin) => {
            return spin.spin != null;
        })
        .filter((spin) => {
            for (const target of spin.spin!.targetConditions) {
                if (
                    filterDisguises.value[target.target.name] != null &&
                    filterDisguises.value[target.target.name] !== "" &&
                    filterDisguises.value[target.target.name] !==
                        target.disguise.name
                ) {
                    return false;
                }

                if (
                    filterMethods.value[target.target.name] == null ||
                    filterMethods.value[target.target.name] === ""
                ) {
                    continue;
                }

                const anyName = `Any ${target.killMethod.name}`;
                if (filterMethods.value[target.target.name] === anyName) {
                    continue;
                }

                const variant = target.killMethod.selectedVariant;
                if (
                    variant != null &&
                    variant !== "" &&
                    filterMethods.value[target.target.name] !==
                        `${variant} ${target.killMethod.name}`
                ) {
                    return false;
                } else if (
                    filterMethods.value[target.target.name] !=
                    target.killMethod.name
                ) {
                    return false;
                }
            }
            return true;
        });
});

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
        playerLookup.value[map.match.playerOne] +
        ", " +
        playerLookup.value[map.match.playerTwo]
    );
}

function getWinningPlayer(map: IPlayedMap): string {
    if (map.winner === WinningPlayer.PLAYER_ONE) {
        return playerLookup.value[map.match.playerOne];
    } else if (map.winner === WinningPlayer.PLAYER_TWO) {
        return playerLookup.value[map.match.playerTwo];
    }
    return "n/a";
}

function getLosingPlayer(map: IPlayedMap): string {
    if (map.winner === WinningPlayer.PLAYER_ONE) {
        return playerLookup.value[map.match.playerTwo];
    } else if (map.winner === WinningPlayer.PLAYER_TWO) {
        return playerLookup.value[map.match.playerOne];
    }
    return "n/a";
}

async function showMatch(uuid: string) {
    loadingUuid.value = uuid;
    const match = await $fetch(`/api/matches?uuid=${uuid}`);
    detailedMatch.value = match.matches[0];
}

watch(selectedMap, updateSpins);
</script>
