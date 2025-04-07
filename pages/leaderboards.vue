<template>
    <div class="flex flex-col gap-5">
        <MapBackground />

        <h1 class="text-center text-5xl bold">Leaderboards</h1>

        <div class="flex flex-col md:flex-row gap-5 lg:mx-20 mx-2">
            <CardComponent class="md:w-72">
                <TabbedContainer
                    v-model:tab="selectedTab"
                    :tabs="['Players', 'Countries', 'Maps']"
                />

                <div
                    v-for="(category, idx) of shownCategories"
                    :key="idx"
                    :class="{
                        'bg-neutral-200 dark:bg-neutral-500':
                            selectedCategory === category,
                    }"
                    class="p-1 w-full border-b last:border-0 dark:border-neutral-500 border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition ease-in-out duration-600"
                    @click="selectCategory(category)"
                >
                    {{ category.name }}
                </div>
            </CardComponent>

            <CardComponent class="flex-grow overflow-x-visible relative">
                <IndefiniteProgressBar
                    v-if="leaderboardLoading"
                    class="absolute top-0 left-0"
                />

                <div class="text-center font-bold text-2xl">
                    {{ selectedCategory.name }}
                </div>
                <div
                    v-if="selectedCategory.explanatoryText != null"
                    class="text-center italic"
                >
                    {{ selectedCategory.explanatoryText }}
                </div>

                <div
                    class="flex flex-col gap-2 md:flex-row mt-4 justify-stretch items-center"
                >
                    <TextInputComponent
                        v-if="
                            selectedCategory.secondaryFilter != null &&
                            selectedCategory.secondaryFilter != ''
                        "
                        v-model="secondaryFilter"
                        type="number"
                        class="w-full"
                        :placeholder="`Minimum ${selectedCategory.secondaryFilter.toLowerCase()}`"
                    />
                    <TextInputComponent
                        v-if="selectedCategoryType !== 'map'"
                        v-model="search"
                        class="w-full"
                        :placeholder="`Search for ${selectedCategoryType}...`"
                    />
                    <DropdownComponent
                        v-if="selectedCategory.hasMaps"
                        v-model="selectedMap"
                        class="w-full"
                        :items="selectableMaps"
                    />
                </div>

                <DataTableComponent
                    v-if="isPlayerLB(searchedLeaderboardData)"
                    :headers="playerTableHeaders"
                    :rows="searchedLeaderboardData"
                    :rows-per-page="[10, 25, 50]"
                    :selected-rows-per-page="10"
                    :enable-sorting="false"
                >
                    <template #placement="{ row }">
                        <Tag
                            :color="
                                getPlacementTagColor(
                                    filteredLeaderboardData.findIndex(
                                        (p) =>
                                            p.sortingScore === row.sortingScore,
                                    ) + 1,
                                )
                            "
                            >{{
                                formatPlacement(
                                    filteredLeaderboardData.findIndex(
                                        (p) =>
                                            p.sortingScore === row.sortingScore,
                                    ) + 1,
                                )
                            }}</Tag
                        >
                    </template>
                    <template #player="{ value }">
                        <PlayerLinkTag
                            :player="playerLookup.get(value, value)"
                        />
                    </template>
                </DataTableComponent>

                <DataTableComponent
                    v-else-if="isCountryLB(searchedLeaderboardData)"
                    :headers="countryTableHeaders"
                    :rows="searchedLeaderboardData"
                    :rows-per-page="[10, 25, 50]"
                    :selected-rows-per-page="10"
                    :enable-sorting="false"
                    @click-row="expandCountry"
                >
                    <template #placement="{ row }">
                        <Tag
                            :color="
                                getPlacementTagColor(
                                    filteredLeaderboardData.findIndex(
                                        (p) =>
                                            p.sortingScore === row.sortingScore,
                                    ) + 1,
                                )
                            "
                        >
                            {{
                                formatPlacement(
                                    filteredLeaderboardData.findIndex(
                                        (p) =>
                                            p.sortingScore === row.sortingScore,
                                    ) + 1,
                                )
                            }}
                        </Tag>
                    </template>

                    <template #country="{ row }">
                        <img
                            v-if="row.countryCode != null"
                            class="w-6 h-6 inline mr-2"
                            :src="`https://flagicons.lipis.dev/flags/4x3/${row.countryCode}.svg`"
                            alt="Country flag"
                        />
                        {{ row.country }}
                    </template>

                    <template #expand="{ row }">
                        <div class="text-right">
                            <FontAwesomeIcon
                                :icon="['fas', 'chevron-down']"
                                class="transition"
                                :class="{
                                    'rotate-180':
                                        expandedCountry === row.country,
                                }"
                            />
                        </div>
                    </template>

                    <template #after-row="{ row }">
                        <div
                            v-if="expandedCountry === row.country"
                            class="flex flex-col"
                        >
                            <div
                                v-for="(player, idx) in row.players"
                                :key="idx"
                                class="flex flex-row mx-5 border-b last:border-b-0 dark:border-neutral-500 border-neutral-300"
                            >
                                <div class="flex-grow">
                                    {{ playerLookup.get(player.player) }}
                                </div>
                                <div class="flex-grow text-right">
                                    {{ player.displayScore }}
                                </div>
                            </div>
                        </div>
                    </template>
                </DataTableComponent>

                <MapLeaderboard
                    v-if="isMapLB(leaderboardData)"
                    :leaderboard-data="leaderboardData"
                />
            </CardComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    LeaderboardCountryEntry,
    LeaderboardMapEntry,
    LeaderboardPlayerEntry,
} from "~/utils/interfaces/LeaderboardEntry";
import { getPlacementTagColor } from "~/utils/formatters";
import { OptionalMap } from "~/utils/mapUtils";

interface CategoryData {
    name: string;
    hasMaps?: boolean;
    mapOptional?: boolean;
    type: string;
    secondaryFilter?: string;
    explanatoryText?: string;
    defaultSecondaryFilter?: number;
}

useHead({
    title: `Leaderboards - RRStats`,
});

const navigatorInfo = useNavigatorInfo();

const playerCategories = await navigatorInfo.getPlayerLeaderboards();
const countryCategories = await navigatorInfo.getCountryLeaderboards();
const mapCategories = await navigatorInfo.getMapLeaderboards();

const selectedTab = ref("Players");
const selectedCategory: Ref<CategoryData> = ref(playerCategories[0]);
const leaderboardData: Ref<
    (LeaderboardPlayerEntry | LeaderboardCountryEntry | LeaderboardMapEntry)[]
> = ref([]);
const leaderboardLoading = ref(false);
const secondaryFilter = ref(playerCategories[0].defaultSecondaryFilter ?? 0);
const selectedMap: Ref<number> = ref(HitmanMap.PARIS);
const search = ref("");
const expandedCountry = ref("");
const playerLookup = usePlayers();

await playerLookup.queryAll();

const setHash = useHash(async (hash) => {
    let categories: CategoryData[] = [];
    if (hash[0] === "#player") {
        selectedTab.value = "Players";
        categories = playerCategories;
    } else if (hash[0] === "#country") {
        selectedTab.value = "Countries";
        categories = countryCategories;
    } else if (hash[0] === "#map") {
        selectedTab.value = "Maps";
        categories = mapCategories;
    } else {
        return;
    }

    let category: CategoryData | null = null;
    if (hash.length > 1) {
        // Trying to find the referenced category
        category =
            categories.find((cat) => {
                return cat.name === hash[1];
            }) ?? null;
    }

    if (category != null) {
        await selectCategory(category);
    } else {
        await selectCategory(categories[0]);
    }
});

const selectableMaps = computed(() => {
    const maps = getAllMaps().map((map) => {
        return { value: map, text: getMap(map)!.name };
    });
    if (selectedCategory.value.mapOptional) {
        return [{ value: -1, text: "All maps" }, ...maps];
    }
    return maps;
});

const playerTableHeaders = computed(() => {
    const headers = [
        { title: "", key: "placement" },
        { title: "Player", key: "player" },
        { title: "Score", key: "displayScore" },
    ];
    if (selectedCategory.value.secondaryFilter != null) {
        headers.push({
            title: selectedCategory.value.secondaryFilter,
            key: "secondaryScore",
        });
    }
    return headers;
});

const countryTableHeaders = computed(() => {
    const headers = [
        { title: "", key: "placement" },
        { title: "Country", key: "country" },
        { title: "Score", key: "displayScore" },
    ];
    if (selectedCategory.value.secondaryFilter != null) {
        headers.push({
            title: selectedCategory.value.secondaryFilter,
            key: "secondaryScore",
        });
    }
    headers.push({
        title: "",
        key: "expand",
    });
    return headers;
});

const shownCategories = computed(() => {
    if (selectedTab.value === "Players") {
        return playerCategories;
    }
    if (selectedTab.value === "Countries") {
        return countryCategories;
    }
    if (selectedTab.value === "Maps") {
        return mapCategories;
    }
    return [];
});

const selectedCategoryType = computed(() => {
    return selectedCategory.value.type;
});

const filteredLeaderboardData = computed(() => {
    if (
        selectedCategory.value.secondaryFilter != null &&
        selectedCategory.value.secondaryFilter != ""
    ) {
        return leaderboardData.value.filter(
            (data) => (data.secondaryScore ?? 0) >= secondaryFilter.value,
        );
    }
    return leaderboardData.value;
});

const searchedLeaderboardData = computed(() => {
    if (search.value === "") {
        return filteredLeaderboardData.value;
    }
    return filteredLeaderboardData.value.filter((data) => {
        return (
            playerLookup
                .get(
                    (data as LeaderboardPlayerEntry).player,
                    (data as LeaderboardPlayerEntry).player,
                )
                ?.toLowerCase()
                .includes(search.value.toLowerCase()) ||
            (data as LeaderboardCountryEntry).country
                ?.toLowerCase()
                .includes(search.value.toLowerCase()) ||
            (data as LeaderboardCountryEntry).countryCode
                ?.toLowerCase()
                .includes(search.value.toLowerCase())
        );
    });
});

async function selectCategory(category: CategoryData) {
    console.log(`Setting category to: ${category}`);
    console.log("We fail here?");
    selectedCategory.value = category;
    console.log("We fail here :(");
    setHash(`#${category.type}.${category.name}`);
    if (selectedCategory.value.defaultSecondaryFilter != null) {
        secondaryFilter.value = selectedCategory.value.defaultSecondaryFilter;
    } else {
        secondaryFilter.value = 0;
    }
    await loadLeaderboardData(true);
}

function expandCountry(row: LeaderboardCountryEntry) {
    if (expandedCountry.value === row.country) {
        expandedCountry.value = "";
    } else {
        expandedCountry.value = row.country;
    }
}

async function loadLeaderboardData(updateMap: boolean) {
    if (leaderboardLoading.value) {
        return;
    }

    leaderboardLoading.value = true;

    if (selectedCategory.value.hasMaps && updateMap) {
        if (selectedCategory.value.mapOptional) {
            selectedMap.value = OptionalMap.NO_MAP;
        } else {
            selectedMap.value = HitmanMap.PARIS;
        }
    }

    try {
        const leaderboardRequest = await $fetch(`/api/leaderboards/category`, {
            query: {
                category: selectedCategory.value.name,
                map: selectedCategory.value.hasMaps
                    ? selectedMap.value
                    : undefined,
            },
        });
        leaderboardData.value = leaderboardRequest;
    } finally {
        leaderboardLoading.value = false;
    }
}

function isMapLB(
    _: (
        | LeaderboardPlayerEntry
        | LeaderboardCountryEntry
        | LeaderboardMapEntry
    )[],
): _ is LeaderboardMapEntry[] {
    return selectedCategoryType.value === "map";
}

function isPlayerLB(
    _: (
        | LeaderboardPlayerEntry
        | LeaderboardCountryEntry
        | LeaderboardMapEntry
    )[],
): _ is LeaderboardPlayerEntry[] {
    return selectedCategoryType.value === "player";
}

function isCountryLB(
    _: (
        | LeaderboardPlayerEntry
        | LeaderboardCountryEntry
        | LeaderboardMapEntry
    )[],
): _ is LeaderboardCountryEntry[] {
    return selectedCategoryType.value === "country";
}

watch(selectedCategory, async () => {
    if (selectedCategory.value.defaultSecondaryFilter != null) {
        secondaryFilter.value = selectedCategory.value.defaultSecondaryFilter;
    } else {
        secondaryFilter.value = 0;
    }
    await loadLeaderboardData(true);
});
watch(selectedMap, async () => {
    await loadLeaderboardData(false);
});

await loadLeaderboardData(true);
</script>
