<template>
    <div class="flex flex-col gap-5">
        <MapBackground />

        <h1 class="text-center text-5xl bold">Leaderboards</h1>

        <div class="flex flex-col md:flex-row gap-5 lg:mx-20 mx-2">
            <CardComponent class="md:w-80">
                <TabbedContainer
                    v-model:tab="selectedTab"
                    :tabs="['Players', 'Countries', 'Maps']"
                />

                <LeaderboardList 
                    v-model="selectedCategory"
                    :leaderboards="shownCategories"
                />
            </CardComponent>

            <CardComponent class="grow overflow-visible! relative flex flex-col gap-2">            
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

                <LeaderboardFilters
                    :key="selectedCategory.name"
                    v-model:search="search"
                    :table-definition="selectedCategory"
                    @update-local-filters="(f) => localFilters = f"
                    @update-external-filters="updateExternalFilters"
                />

                <SpreadsheetLeaderboardTable
                    v-if="!leaderboardLoading"
                    :key="selectedCategory.name"
                    :table-definition="selectedCategory"
                    :rows="leaderboardData"
                    :external-filters="externalFilters"
                    :search="search"
                    :filters="localFilters"
                    @update-filters="updateExternalFilters"
                />

                <!-- <DataTableComponent
                    v-if="isPlayerLB(searchedLeaderboardData)"
                    :headers="playerTableHeaders"
                    :rows="searchedLeaderboardData"
                    :rows-per-page="[10, 25, 50]"
                    :selected-rows-per-page="10"
                    :enable-sorting="false"
                >
                    <template #placement="{ row }">
                        <PlacementTag
                            :placement="filteredLeaderboardData.findIndex(
                                (p) =>
                                    p.sortingScore === row.sortingScore,
                                ) + 1"
                        />
                    </template>
                    <template #player="{ value }">
                        <PlayerLinkTag
                            :player="playerLookup.get(value, value)"
                        />
                    </template>
                </DataTableComponent> -->

                <!-- <DataTableComponent
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
                                <div class="grow">
                                    {{ playerLookup.get(player.player) }}
                                </div>
                                <div class="grow text-right">
                                    {{ player.displayScore }}
                                </div>
                            </div>
                        </div>
                    </template>
                </DataTableComponent> -->

                <!-- <MapLeaderboard
                    v-if="isMapLB(leaderboardData)"
                    :leaderboard-data="leaderboardData"
                /> -->
            </CardComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: `Leaderboards - RRStats`,
});

const navigatorInfo = useNavigatorInfo();

const playerCategories = await navigatorInfo.getPlayerLeaderboards();
const countryCategories = await navigatorInfo.getCountryLeaderboards();
const mapCategories = await navigatorInfo.getMapLeaderboards();

const selectedTab = ref("Players");
const selectedCategory: Ref<LeaderboardTableDefinition> = ref(playerCategories[0]);
const leaderboardData: Ref<LeaderboardRow[]> = ref([]);
const leaderboardLoading = ref(false);
const externalFilters: Ref<Record<string, unknown>> = ref({});
const localFilters: Ref<Record<string, unknown>> = ref({});
const search = ref("");
const playerLookup = usePlayers();

await playerLookup.queryAll();

// const setHash = useHash(async (hash) => {
//     let categories: LeaderboardTableDefinition[] = [];
//     if (hash[0] === "#player") {
//         selectedTab.value = "Players";
//         categories = playerCategories;
//     } else if (hash[0] === "#country") {
//         selectedTab.value = "Countries";
//         categories = countryCategories;
//     } else if (hash[0] === "#map") {
//         selectedTab.value = "Maps";
//         categories = mapCategories;
//     } else {
//         return;
//     }

//     let category: LeaderboardTableDefinition | null = null;
//     if (hash.length > 1) {
//         // Trying to find the referenced category
//         category =
//             categories.find((cat) => {
//                 return cat.name === hash[1];
//             }) ?? null;
//     }

//     if (category != null) {
//         await selectCategory(category);
//     } else {
//         await selectCategory(categories[0]);
//     }
// });

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

watch(selectedCategory, async () => {
    externalFilters.value = {};
    localFilters.value = {};
    search.value = "";

    // setHash(`#${category.type}.${category.name}`);
    // if (selectedCategory.value.defaultSecondaryFilter != null) {
    //     secondaryFilter.value = selectedCategory.value.defaultSecondaryFilter;
    // } else {
    //     secondaryFilter.value = 0;
    // }

    await loadLeaderboardData();
});

async function updateExternalFilters(filters: Record<string, unknown>) {
    externalFilters.value = filters;
    await loadLeaderboardData();
}

async function loadLeaderboardData() {
    if (leaderboardLoading.value) {
        return;
    }

    leaderboardLoading.value = true;

    const defaultExternalFilters: Record<string, unknown> = {};
    for (const column of selectedCategory.value.columns) {
        if (column.serverSideFilter) {
            defaultExternalFilters[column.name] = column.defaultFilter;
        }
    }
    Object.assign(defaultExternalFilters, externalFilters.value);

    try {
        const leaderboardRequest = await $fetch(`/api/leaderboards/category`, {
            query: {
                category: selectedCategory.value.name,
                filters: JSON.stringify(defaultExternalFilters),
            },
        });
        leaderboardData.value = leaderboardRequest;
    } finally {
        leaderboardLoading.value = false;
    }
}

await loadLeaderboardData();
</script>
