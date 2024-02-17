<template>
    <div class="flex flex-col gap-5">
        <h1 class="text-center text-5xl bold">Leaderboards</h1>

        <div class="flex flex-col md:flex-row gap-5 lg:mx-20 mx-2">
            <CardComponent class="md:w-72">
                <TabbedContainer
                    :tabs="['Players', 'Countries']"
                    @change-tab="(tab) => (selectedTab = tab)"
                />

                <div
                    v-for="(category, idx) of shownCategories"
                    :key="idx"
                    :class="{
                        'bg-neutral-200 dark:bg-neutral-500':
                            selectedCategory === category,
                    }"
                    class="p-1 w-full border-b last:border-0 dark:border-neutral-500 border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition ease-in-out duration-600"
                    @click="selectedCategory = category"
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
                        v-model="search"
                        class="w-full"
                        :placeholder="`Search for ${
                            isCountryCategory ? 'country' : 'player'
                        }...`"
                    />
                    <DropdownComponent
                        v-if="selectedCategory.hasMaps"
                        v-model="selectedMap"
                        class="w-full"
                        :items="selectableMaps"
                    />
                </div>

                <DataTableComponent
                    v-if="!isCountryCategory"
                    :headers="playerTableHeaders"
                    :rows="searchedLeaderboardData as LeaderboardPlayerEntry[]"
                    :rows-per-page="[10, 25, 50]"
                    :items-per-page="10"
                >
                    <template #placement="{ row }">
                        <Tag
                            :color="
                                getTagColor(
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
                        <a :href="`/${playerLookupTable[value as string]}`"
                            >{{
                                playerLookupTable[value as string] ??
                                `Unknown player: ${value}`
                            }}
                        </a>
                    </template>
                </DataTableComponent>

                <DataTableComponent
                    v-else
                    :headers="countryTableHeaders"
                    :rows="searchedLeaderboardData as LeaderboardCountryEntry[]"
                    :rows-per-page="[10, 25, 50]"
                    :items-per-page="10"
                >
                    <template #placement="{ row }">
                        <Tag
                            :color="
                                getTagColor(
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
                </DataTableComponent>
            </CardComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    LeaderboardCountryEntry,
    LeaderboardPlayerEntry,
} from "~/utils/interfaces/LeaderboardEntry";

useHead({
    title: `Leaderboards - RRStats`,
});

const categoryRequest = await useFetch("/api/leaderboards/list");
const playerCategories = categoryRequest.data.value?.player ?? [];
const countryCategories = categoryRequest.data.value?.country ?? [];
const playerLookupTable =
    ((await useFetch(`/api/player/lookup`)).data as Ref<
        Record<string, string>
    >) ?? ref({});

const selectedTab = ref("Players");
const selectedCategory: Ref<{
    name: string;
    hasMaps: boolean;
    type: string;
    secondaryFilter?: string;
    explanatoryText?: string;
}> = ref(playerCategories[0]);
const leaderboardData: Ref<
    LeaderboardPlayerEntry[] | LeaderboardCountryEntry[]
> = ref([]);
const leaderboardLoading = ref(true);
const secondaryFilter = ref(0);
const selectedMap = ref(HitmanMap.PARIS);
const search = ref("");

const selectableMaps = getAllMaps().map((map) => {
    return { value: map, text: getMap(map)!.name };
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
    return headers;
});

const shownCategories = computed(() => {
    if (selectedTab.value === "Players") {
        return playerCategories;
    }
    if (selectedTab.value === "Countries") {
        return countryCategories;
    }
});

const isCountryCategory = computed(() => {
    return selectedCategory.value.type === "country";
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
            playerLookupTable.value[(data as LeaderboardPlayerEntry).player]
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

function getTagColor(placement: number) {
    if (placement === 1) {
        return "rgb(214, 175, 54)";
    }
    if (placement === 2) {
        return "rgb(167, 167, 167)";
    }
    if (placement === 3) {
        return "rgb(167, 112, 68)";
    }
    return "rgb(85, 85, 85)";
}

async function loadLeaderboardData() {
    leaderboardLoading.value = true;

    const leaderboardRequest = await useFetch(`/api/leaderboards/category`, {
        query: {
            category: selectedCategory.value.name,
            map: selectedCategory.value.hasMaps ? selectedMap.value : undefined,
        },
    });
    if (
        leaderboardRequest.data.value == null ||
        leaderboardRequest.status.value !== "success"
    ) {
        leaderboardLoading.value = false;
        return;
    }

    leaderboardData.value = leaderboardRequest.data.value;

    leaderboardLoading.value = false;
}

watch(selectedCategory, async () => {
    await loadLeaderboardData();
});
watch(selectedMap, async () => {
    await loadLeaderboardData();
});

await loadLeaderboardData();
</script>
