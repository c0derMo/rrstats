<template>
    <DoubleEndedSlider class="w-full mb-2" v-model:minValue="selectedMinComp" v-model:maxValue="selectedMaxComp" :max="competitions.length-1" />

    <div class="flex flex-row w-full">
        <div class="flex-grow">
            <DropdownComponent :items="dropdownCompetitions" v-model="selectedMinComp" />
        </div>
        <div class="flex-grow mr-3">
            <SwitchComponent label="Only regular RRs:" class="float-right" id="only-rr" />
        </div>
        <div class="flex-grow ml-3">
            <SwitchComponent label="Only RRWCs:" class="float-left" id="only-rrwc" />
        </div>
        <div class="flex-grow">
            <DropdownComponent :items="dropdownCompetitions" v-model="selectedMaxComp" class="float-right" />
        </div>
    </div>

    <div class="flex md:flex-row flex-col gap-5">
        <div class="flex-grow">
            <TableComponent :headers="['Map', 'Picked']" :rows="pickedRows" />
        </div>
        <div class="flex-grow">
            <TableComponent :headers="['Map', 'Winrate', 'Won', 'Played']" :rows="winrateRows" />
        </div>
        <div class="flex-grow">
            <TableComponent :headers="['Map', 'Banned']" :rows="bannedRows" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ChoosingPlayer, IMatch, WinningPlayer } from '~/utils/interfaces/IMatch';

const competitions = ['RR1', 'RR2', 'RR3', 'RRWC2020', 'RR4', 'RR5', 'RR6', 'RRWC2021', 'RR7', 'RR8', 'RR9', 'RRWC2022', 'RR10', 'RR11', 'RR12', 'RRWC2023'];

const props = defineProps({
    'matches': {
        type: Object as PropType<IMatch[]>,
        required: true
    },
    'localPlayer': {
        type: String,
        required: true
    }
});

const dropdownCompetitions = computed(() => {
    return competitions.map((comp, idx) => {
        return { text: comp, value: idx };
    })
});

const selectedMinComp = ref(0);
const selectedMaxComp = ref(competitions.length-1);

const pickedRows = computed(() => {
    const maps: Record<string, number> = {};

    for (const match of props.matches) {
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

    for (const match of props.matches) {
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

    for (const match of props.matches) {
        for (const map of match.playedMaps) {
            const mapString = getMap(map.map)?.name as string;

            if (maps[mapString] === undefined) {
                maps[mapString] = { played: 0, won: 0 }
            };

            maps[mapString].played += 1;

            if (map.winner === WinningPlayer.PLAYER_ONE && match.playerOne === props.localPlayer || map.winner === WinningPlayer.PLAYER_TWO && match.playerTwo === props.localPlayer) {
                maps[mapString].won += 1;
            }
        }
    }

    const result = [];
    for (const map of Object.keys(maps)) {
        result.push({
            'Map': map,
            'Winrate': Math.round(maps[map].won / maps[map].played * 100) + '%',
            'Won': maps[map].won,
            'Played': maps[map].played
        });
    }

    return result;
});
</script>