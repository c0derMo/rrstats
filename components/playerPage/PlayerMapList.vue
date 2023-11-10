<template>
    <DoubleEndedSlider class="w-full mb-2" v-model:minValue="selectedMinComp" v-model:maxValue="selectedMaxComp" :max="competitions.length-1" />

    <div class="flex flex-row w-full">
        <div class="flex-grow">
            <DropdownComponent :items="dropdownCompetitions" v-model="selectedMinComp" />
        </div>
        <div class="flex-grow mr-3">
            <SwitchComponent label="Only regular RRs:" class="float-right" id="only-rr" v-model="regularRROnly" />
        </div>
        <div class="flex-grow ml-3">
            <SwitchComponent label="Only RRWCs:" class="float-left" id="only-rrwc" v-model="rrwcOnly" />
        </div>
        <div class="flex-grow">
            <DropdownComponent :items="dropdownCompetitions" v-model="selectedMaxComp" class="float-right" />
        </div>
    </div>

    <div class="flex md:flex-row flex-col gap-5">
        <div class="flex-grow">
            <DataTableComponent :headers="pickedHeaders" :rows="pickedRows" :alwaysSort="true" :rowsPerPage="[10, 20]" v-model:itemsPerPage="selectedMapsPerPage" defaultSortingKey="Picked" />
        </div>
        <div class="flex-grow">
            <DataTableComponent :headers="winrateHeaders" :rows="winrateRows" :alwaysSort="true" :rowsPerPage="[10, 20]" v-model:itemsPerPage="selectedMapsPerPage" defaultSortingKey="Winrate">
                <template v-slot:Winrate="{ value }">
                    {{ value }}%
                </template>
            </DataTableComponent>
        </div>
        <div class="flex-grow">
            <DataTableComponent :headers="bannedHeaders" :rows="bannedRows" :alwaysSort="true" :rowsPerPage="[10, 20]" v-model:itemsPerPage="selectedMapsPerPage" defaultSortingKey="Banned" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ICompetition } from '~/utils/interfaces/ICompetition';
import { ChoosingPlayer, IMatch, WinningPlayer } from '~/utils/interfaces/IMatch';

const props = defineProps({
    'matches': {
        type: Object as PropType<IMatch[]>,
        required: true
    },
    'localPlayer': {
        type: String,
        required: true
    },
    'competitions': {
        type: Array<ICompetition>,
        required: true
    }
});

const selectedMapsPerPage = ref(10);

const mapSort = (a: unknown, b: unknown) => { return getAllMaps().findIndex(m => getMap(m)!.name === b) - getAllMaps().findIndex(m => getMap(m)!.name === a) };

const pickedHeaders = [
    { key: "Map", title: "Map", sort: mapSort },
    { key: "Picked", title: "Picked" },
];
const winrateHeaders = [
    { key: 'Map', title: 'Map', sort: mapSort },
    { key: 'Winrate', title: 'Winrate' },
    { key: 'Won', title: 'Won' },
    { key: 'Played', title: 'Played' },
];
const bannedHeaders = [
    { key: "Map", title: "Map", sort: mapSort },
    { key: "Banned", title: "Banned" },
];

const selectedMinComp = ref(0);
const selectedMaxComp = ref(props.competitions.length-1);
const regularRROnly = ref(false);
const rrwcOnly = ref(false);

watch(selectedMaxComp, () => {
    if (selectedMaxComp.value < selectedMinComp.value) {
        selectedMaxComp.value = selectedMinComp.value;
    }
})
watch(selectedMinComp, () => {
    if (selectedMinComp.value > selectedMaxComp.value) {
        selectedMinComp.value = selectedMaxComp.value;
    }
})
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

const sortedCompetitions = computed(() => {
    return [...props.competitions].sort((a, b) => a.startingTimestamp - b.startingTimestamp);
});

const dropdownCompetitions = computed(() => {
    return sortedCompetitions.value.map((comp, idx) => {
        return { text: comp.tag, value: idx };
    })
});

const filteredMatches = computed(() => {
    return props.matches.filter(m => {
        if (regularRROnly.value && m.competition.toLowerCase().includes("rrwc")) {
            return false;
        }
        if (rrwcOnly.value && !m.competition.toLowerCase().includes("rrwc")) {
            return false;
        }

        const compIndex = sortedCompetitions.value.findIndex(c => c.tag === m.competition);
        
        return compIndex >= selectedMinComp.value && compIndex <= selectedMaxComp.value;
    });
});

const pickedRows = computed(() => {
    const maps: Record<string, number> = {};

    for (const match of filteredMatches.value) {
        for (const map of match.playedMaps) {
            if (map.picked === ChoosingPlayer.PLAYER_ONE && match.playerOne === props.localPlayer || map.picked === ChoosingPlayer.PLAYER_TWO && match.playerTwo === props.localPlayer) {

                if (maps[getMap(map.map)?.name as string] === undefined) {
                    maps[getMap(map.map)?.name as string] = 0;
                }

                maps[getMap(map.map)?.name as string] += 1;
            }
        }
    }

    const result = [];
    for (const map of Object.keys(maps)) {
        result.push({
            'Map': map,
            'Picked': maps[map]
        });
    }

    return result;
});

const bannedRows = computed(() => {
    const maps: Record<string, number> = {};

    for (const match of filteredMatches.value) {
        for (const map of match.bannedMaps) {
            if (map.picked === ChoosingPlayer.PLAYER_ONE && match.playerOne === props.localPlayer || map.picked === ChoosingPlayer.PLAYER_TWO && match.playerTwo === props.localPlayer) {

                if (maps[getMap(map.map)?.name as string] === undefined) {
                    maps[getMap(map.map)?.name as string] = 0;
                }

                maps[getMap(map.map)?.name as string] += 1;
            }
        }
    }

    const result = [];
    for (const map of Object.keys(maps)) {
        result.push({
            'Map': map,
            'Banned': maps[map]
        });
    }

    return result;
});

const winrateRows = computed(() => {
    const maps: Record<string, { played: number, won: number }> = {};

    for (const match of filteredMatches.value) {
        for (const map of match.playedMaps) {
            const mapString = getMap(map.map)?.name as string;

            if (maps[mapString] === undefined) {
                maps[mapString] = { played: 0, won: 0 }
            };

            maps[mapString].played += 1;

            if (map.winner === WinningPlayer.DRAW) {
                maps[mapString].won += 0.5;
            } else if (map.winner === WinningPlayer.PLAYER_ONE && match.playerOne === props.localPlayer || map.winner === WinningPlayer.PLAYER_TWO && match.playerTwo === props.localPlayer) {
                maps[mapString].won += 1;
            }
        }
    }

    const result = [];
    for (const map of Object.keys(maps)) {
        result.push({
            'Map': map,
            'Winrate': Math.round(maps[map].won / maps[map].played * 100),
            'Won': maps[map].won,
            'Played': maps[map].played
        });
    }

    return result;
});
</script>