<template>
    <div>
        <DoubleEndedSlider
            v-model:minValue="selectedMinComp"
            v-model:maxValue="selectedMaxComp"
            class="w-full mb-2"
            :max="dropdownCompetitions.length - 1"
        />

        <div class="flex flex-row w-full">
            <div class="flex-grow">
                <DropdownComponent
                    v-model="selectedMinComp"
                    :items="dropdownCompetitions"
                />
            </div>
            <div class="flex-grow mr-3">
                <SwitchComponent
                    id="only-rr"
                    v-model="regularRROnly"
                    label="Only regular RRs:"
                    class="float-right"
                />
            </div>
            <div class="flex-grow ml-3">
                <SwitchComponent
                    id="only-rrwc"
                    v-model="rrwcOnly"
                    label="Only RRWCs:"
                    class="float-left"
                />
            </div>
            <div class="flex-grow">
                <DropdownComponent
                    v-model="selectedMaxComp"
                    :items="dropdownCompetitions"
                    class="float-right"
                />
            </div>
        </div>

        <div class="flex lg:flex-row flex-col gap-5">
            <div class="flex-grow">
                <DataTableComponent
                    v-model:itemsPerPage="selectedMapsPerPage"
                    :headers="pickedHeaders"
                    :rows="pickedRows"
                    :always-sort="true"
                    :rows-per-page="[10, 20]"
                    default-sorting-key="Picked"
                />
            </div>
            <div class="flex-grow">
                <DataTableComponent
                    v-model:itemsPerPage="selectedMapsPerPage"
                    :headers="winrateHeaders"
                    :rows="winrateRows"
                    :always-sort="true"
                    :rows-per-page="[10, 20]"
                    default-sorting-key="Winrate"
                >
                    <template #Winrate="{ value }"> {{ value }}% </template>
                </DataTableComponent>
            </div>
            <div class="flex-grow">
                <DataTableComponent
                    v-model:itemsPerPage="selectedMapsPerPage"
                    :headers="bannedHeaders"
                    :rows="bannedRows"
                    :always-sort="true"
                    :rows-per-page="[10, 20]"
                    default-sorting-key="Banned"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ICompetition } from "~/utils/interfaces/ICompetition";
import type { IMatch } from "~/utils/interfaces/IMatch";
import MatchCollection from "~/utils/playerStatistics/MatchCollection";

const props = defineProps({
    matches: {
        type: Object as PropType<IMatch[]>,
        required: true,
    },
    localPlayer: {
        type: String,
        required: true,
    },
    competitions: {
        type: Array<ICompetition>,
        required: true,
    },
});

const selectedMapsPerPage = ref(10);

const mapSort = (a: unknown, b: unknown) => {
    return (
        getAllMaps().findIndex((m) => getMap(m)!.name === b) -
        getAllMaps().findIndex((m) => getMap(m)!.name === a)
    );
};

const pickedHeaders = [
    { key: "Map", title: "Map", sort: mapSort },
    { key: "Picked", title: "Picked" },
];
const winrateHeaders = [
    { key: "Map", title: "Map", sort: mapSort },
    { key: "Winrate", title: "Winrate" },
    { key: "Won", title: "Won" },
    { key: "Played", title: "Played" },
];
const bannedHeaders = [
    { key: "Map", title: "Map", sort: mapSort },
    { key: "Banned", title: "Banned" },
];

const sortedCompetitions = computed(() => {
    return props.competitions
        .filter((c) => {
            return c.officialCompetition && c.tag.toLowerCase().includes("rr");
        })
        .sort((a, b) => a.startingTimestamp - b.startingTimestamp);
});

const dropdownCompetitions = computed(() => {
    return sortedCompetitions.value.map((comp, idx) => {
        return { text: comp.tag, value: idx };
    });
});

const selectedMinComp = ref(0);
const selectedMaxComp = ref(dropdownCompetitions.value.length - 1);
const regularRROnly = ref(false);
const rrwcOnly = ref(false);

watch(selectedMaxComp, () => {
    if (selectedMaxComp.value < selectedMinComp.value) {
        selectedMaxComp.value = selectedMinComp.value;
    }
});
watch(selectedMinComp, () => {
    if (selectedMinComp.value > selectedMaxComp.value) {
        selectedMinComp.value = selectedMaxComp.value;
    }
});
watch(regularRROnly, () => {
    if (regularRROnly.value && rrwcOnly.value) {
        rrwcOnly.value = false;
    }
});
watch(rrwcOnly, () => {
    if (regularRROnly.value && rrwcOnly.value) {
        regularRROnly.value = false;
    }
});

const filteredMatches = computed(() => {
    return new MatchCollection(
        props.matches.filter((m) => {
            if (
                regularRROnly.value &&
                m.competition.toLowerCase().includes("rrwc")
            ) {
                return false;
            }
            if (
                rrwcOnly.value &&
                !m.competition.toLowerCase().includes("rrwc")
            ) {
                return false;
            }

            const compIndex = sortedCompetitions.value.findIndex(
                (c) => c.tag === m.competition,
            );

            return (
                compIndex >= selectedMinComp.value &&
                compIndex <= selectedMaxComp.value
            );
        }),
        props.localPlayer,
    );
});

const pickedRows = computed(() => {
    const maps = filteredMatches.value.mapPickAmount();

    const result = [];
    for (const map of getAllMaps()) {
        if (maps[map] > 0) {
            result.push({
                Map: getMap(map)!.name,
                Picked: maps[map],
            });
        }
    }

    return result;
});

const bannedRows = computed(() => {
    const bans = filteredMatches.value.mapBanAmount();

    const result = [];
    for (const map of getAllMaps()) {
        if (bans[map] > 0) {
            result.push({
                Map: getMap(map)!.name,
                Banned: bans[map],
            });
        }
    }

    return result;
});

const winrateRows = computed(() => {
    const winrate = filteredMatches.value.perMapWinrate();
    const wins = filteredMatches.value.mapWinAmount();
    const plays = filteredMatches.value.mapPlayAmount();

    const result = [];
    for (const map of getAllMaps()) {
        if (plays[map] > 0) {
            result.push({
                Map: getMap(map)!.name,
                Winrate: Math.round(winrate[map] * 100),
                Won: wins[map],
                Played: plays[map],
            });
        }
    }

    return result;
});
</script>
