<template>
    <div>
        <DoubleEndedSlider
            v-model:minValue="selectedMinComp"
            v-model:maxValue="selectedMaxComp"
            class="w-full mb-2"
            :max="dropdownCompetitions.length - 1"
        />

        <div class="flex flex-row w-full">
            <div>
                <DropdownComponent
                    v-model="selectedMinComp"
                    :items="dropdownCompetitions"
                />
            </div>
            <div class="flex-grow mr-3 text-right">
                <ButtonComponent
                    @click="
                        selectedMinComp = 5;
                        selectedMaxComp = competitions.length - 1;
                    "
                >
                    Include all 3 seasons (RR5+)
                </ButtonComponent>
            </div>
            <div class="flex-grow ml-3 text-left">
                <ButtonComponent
                    @click="
                        selectedMinComp = 10;
                        selectedMaxComp = competitions.length - 1;
                    "
                >
                    Include Ambrose Island (RR9+)
                </ButtonComponent>
            </div>
            <div>
                <DropdownComponent
                    v-model="selectedMaxComp"
                    :items="dropdownCompetitions"
                    class="float-right"
                />
            </div>
        </div>

        <DataTableComponent
            :headers="headers"
            :rows="filteredMapData"
            :rows-per-page="[10, 25, 50]"
            :selected-rows-per-page="10"
            :enable-sorting="false"
            @click-row="expandMap"
        >
            <template #placement="{ row }">
                <Tag
                    :color="
                        getPlacementTagColor(
                            filteredMapData.findIndex(
                                (p) => p.sortingScore === row.sortingScore,
                            ) + 1,
                        )
                    "
                    >{{
                        formatPlacement(
                            filteredMapData.findIndex(
                                (p) => p.sortingScore === row.sortingScore,
                            ) + 1,
                        )
                    }}</Tag
                >
            </template>

            <template #expand="{ row }">
                <div class="text-right">
                    <FontAwesomeIcon
                        :icon="['fas', 'chevron-down']"
                        class="transition"
                        :class="{
                            'rotate-180': expandedMap === row.map,
                        }"
                    />
                </div>
            </template>

            <template #after-row="{ row }">
                <div v-if="expandedMap === row.map" class="flex flex-col">
                    <div
                        v-for="(score, idx) in row.tournamentBreakdown"
                        :key="idx"
                        class="flex flex-row mx-5 border-b last:border-b-0 dark:border-neutral-500 border-neutral-300"
                    >
                        <div class="flex-grow">
                            {{
                                competitions.slice(
                                    invertedMinComp,
                                    invertedMaxComp,
                                )[idx].name
                            }}
                        </div>
                        <div class="flex-grow text-right">
                            {{ score }}
                        </div>
                    </div>
                </div>
            </template>
        </DataTableComponent>
    </div>
</template>

<script setup lang="ts">
import type { ICompetition } from "~/utils/interfaces/ICompetition";
import type { LeaderboardMapEntry } from "~/utils/interfaces/LeaderboardEntry";

const props = defineProps<{
    leaderboardData: LeaderboardMapEntry[];
}>();

onBeforeMount(async () => {
    const competitionsQuery = await useNavigatorInfo().getCompetitions();
    competitions.value = competitionsQuery.filter(
        (comp) => comp.officialCompetition,
    ) as ICompetition[];
    selectedMaxComp.value = competitions.value.length - 1;
});

const competitions = ref<ICompetition[]>([]);
const expandedMap = ref("");
const selectedMinComp = ref(0);
const selectedMaxComp = ref(0);

const dropdownCompetitions = computed(() => {
    return [...competitions.value].reverse().map((comp, idx) => {
        return { text: comp.tag, value: idx };
    });
});
const invertedMinComp = computed(() => {
    return competitions.value.length - 1 - selectedMaxComp.value;
});
const invertedMaxComp = computed(() => {
    return competitions.value.length - selectedMinComp.value;
});

const headers = [
    { title: "", key: "placement" },
    { title: "Map", key: "map" },
    { title: "Score", key: "sortingScore" },
    { title: "", key: "expand" },
];

const filteredMapData = computed(() => {
    return props.leaderboardData
        .map((map) => {
            return {
                map: map.map,
                tournamentBreakdown: (map.tournamentBreakdown ?? []).slice(
                    invertedMinComp.value,
                    invertedMaxComp.value,
                ),
                sortingScore: (map.tournamentBreakdown ?? [])
                    .slice(invertedMinComp.value, invertedMaxComp.value)
                    .reduce((prev, cur) => prev + cur, 0),
            };
        })
        .sort((a, b) => b.sortingScore - a.sortingScore);
});

function expandMap(row: LeaderboardMapEntry) {
    if (expandedMap.value === row.map) {
        expandedMap.value = "";
    } else {
        expandedMap.value = row.map;
    }
}
</script>
