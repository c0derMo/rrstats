<template>
    <div>
        <RangeSelector
            v-model:min-value="selectedMinComp"
            v-model:max-value="selectedMaxComp"
            :max="compNames.length - 1"
            :item-labels="compNames"
        >
            <template #additionalChecks>
                <div class="w-fit">
                    <SwitchComponent
                        id="only-rr"
                        v-model="regularRROnly"
                        label="Only regular RRs:"
                        class="mr-2"
                    />
                    <SwitchComponent
                        id="only-rrwc"
                        v-model="rrwcOnly"
                        label="Only RRWCs:"
                        class="ml-2"
                    />
                </div>
            </template>
        </RangeSelector>

        <div class="flex lg:flex-row flex-col gap-5">
            <div class="flex-grow">
                <DataTableComponent
                    v-model:selected-rows-per-page="selectedMapsPerPage"
                    :headers="pickedHeaders"
                    :rows="pickedRows"
                    :always-sort="true"
                    :rows-per-page="[10, 20]"
                    default-sorting-key="Picked"
                />
            </div>
            <div class="flex-grow">
                <DataTableComponent
                    v-model:selected-rows-per-page="selectedMapsPerPage"
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
                    v-model:selected-rows-per-page="selectedMapsPerPage"
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
import MatchCollection from "#shared/utils/playerStatistics/MatchCollection";

const props = defineProps<{
    matches: IMatch[];
    localPlayer: string;
    competitions: ICompetition[];
}>();

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
    { key: "Picked Against", title: "Picked Against" },
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
    { key: "Banned Against", title: "Banned Against" },
];

const sortedCompetitions = computed(() => {
    return props.competitions
        .filter((c) => {
            return c.officialCompetition && c.tag.toLowerCase().includes("rr");
        })
        .sort((a, b) => a.startingTimestamp - b.startingTimestamp);
});

const compNames = computed(() => {
    return sortedCompetitions.value.map((comp) => comp.tag);
});

const selectedMinComp = ref(0);
const selectedMaxComp = ref(compNames.value.length - 1);
const regularRROnly = ref(false);
const rrwcOnly = ref(false);

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
    const mapsPickedAgainst = filteredMatches.value.mapPickedAgainstAmount();

    const result = [];
    for (const map of getAllMaps()) {
        if (maps[map] > 0 || mapsPickedAgainst[map] > 0) {
            result.push({
                Map: getMap(map)!.name,
                Picked: maps[map],
                "Picked Against": mapsPickedAgainst[map],
            });
        }
    }

    return result;
});

const bannedRows = computed(() => {
    const bans = filteredMatches.value.mapBanAmount();
    const bannedAgainst = filteredMatches.value.mapBannedAgainstAmount();

    const result = [];
    for (const map of getAllMaps()) {
        if (bans[map] > 0 || bannedAgainst[map] > 0) {
            result.push({
                Map: getMap(map)!.name,
                Banned: bans[map],
                "Banned Against": bannedAgainst[map],
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
