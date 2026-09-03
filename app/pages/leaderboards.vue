<template>
    <div class="flex flex-col gap-5">
        <MapBackground />

        <h1 class="text-center text-5xl bold">Leaderboards</h1>

        <div class="flex flex-col md:flex-row gap-5 lg:mx-20 mx-2">
            <CardComponent class="md:w-96">
                <TabbedContainer
                    v-model:tab="selectedTab"
                    :tabs="['Players', 'Countries', 'Maps']"
                />

                <LeaderboardList
                    v-model="selectedCategory"
                    :leaderboards="shownCategories"
                />
            </CardComponent>

            <CardComponent
                class="grow overflow-visible! relative flex flex-col gap-2"
            >
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
                    @update-local-filters="(f) => (localFilters = f)"
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
const selectedCategory: Ref<LeaderboardTableDefinition> = ref(
    playerCategories[0],
);
const leaderboardData: Ref<LeaderboardRow[]> = ref([]);
const leaderboardLoading = ref(false);
const externalFilters: Ref<Record<string, unknown>> = ref({});
const localFilters: Ref<Record<string, unknown>> = ref({});
const search = ref("");
const playerLookup = usePlayers();

await playerLookup.queryAll();

const setHash = useHash(async (hash) => {
    let categories: LeaderboardTableDefinition[] = [];
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

    let category: LeaderboardTableDefinition | null = null;
    if (hash.length > 1) {
        // Trying to find the referenced category
        category =
            categories.find((cat) => {
                return cat.name === hash[1];
            }) ?? null;
    }

    if (category != null) {
        selectedCategory.value = category;
    } else {
        selectedCategory.value = categories[0];
    }
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

watch(selectedCategory, async () => {
    externalFilters.value = {};
    localFilters.value = {};
    search.value = "";

    setHash(
        `#${selectedCategory.value.category}.${selectedCategory.value.name}`,
        true,
    );

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
