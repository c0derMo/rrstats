<template>
    <div class="flex flex-col">
        <div class="flex flex-row gap-5 items-center justify-center">
            <AutocompleteComponent
                :key="additionalPlayers.length"
                placeholder="Add players to compare..."
                :suggestions="suggestiblePlayers"
                @confirm="addPlayer"
            />

            <DropdownComponent
                v-model="playerToRemove"
                :items="removeablePlayers"
                @update:model-value="(e) => removePlayer(e as number)"
            />
        </div>
        <div class="h-[400px]">
            <LineChart
                v-if="showGraph"
                :axis-labels="labels"
                :data="eloData"
                :labels="playerLabels"
                :colors="colors"
                :legend="true"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import ld from "lodash";
import type { IPlayerStatistics } from "~/utils/interfaces/IPlayer";

const props = defineProps<{
    playerStatistics: IPlayerStatistics;
    player: string;
}>();

const additionalPlayers = ref<string[]>([]);
const additionalStatistics = ref<IPlayerStatistics[]>([]);
const showGraph = ref(true);
const playerToRemove = ref<number>(-1);

const players = usePlayers();
await players.queryAll();

const { data: allPlayers } = await useFetch("/api/player/list", {
    default: () => [],
});

const suggestiblePlayers = computed(() => {
    return allPlayers.value
        .map((player) => player.primaryName)
        .filter((player) => player !== props.player)
        .filter((player) => !additionalPlayers.value.includes(player));
});

const removeablePlayers = computed(() => {
    return [
        { text: "Remove players from comparison", value: -1 },
        ...additionalPlayers.value.map((player, index) => {
            return {
                text: player,
                value: index,
            };
        }),
    ];
});

async function addPlayer(playerName: string) {
    if (additionalPlayers.value.includes(playerName)) {
        return;
    }
    const stats = await $fetch("/api/player/statistics", {
        query: { player: players.getUUID(playerName) },
    });
    showGraph.value = false;
    additionalPlayers.value.push(playerName);
    additionalStatistics.value.push(stats);
    showGraph.value = true;
}

function removePlayer(index: number) {
    if (index < 0) {
        return;
    }
    showGraph.value = false;
    additionalPlayers.value.splice(index, 1);
    additionalStatistics.value.splice(index, 1);
    showGraph.value = true;
    playerToRemove.value = -1;
}

const sortedEloGraphs = computed(() => {
    return [
        props.playerStatistics.eloProgression.toSorted(
            (a, b) => a.timestamp - b.timestamp,
        ),
        ...additionalStatistics.value.map((stat) =>
            stat.eloProgression.toSorted((a, b) => a.timestamp - b.timestamp),
        ),
    ];
});

const timeSpan = computed(() => {
    const starts: number[] = [];
    const ends: number[] = [];

    for (const graph of sortedEloGraphs.value) {
        starts.push(
            DateTime.fromMillis(graph[0].timestamp)
                .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                .toMillis(),
        );
        ends.push(
            DateTime.fromMillis(ld.last(graph)!.timestamp)
                .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                .plus({ days: 1 })
                .toMillis(),
        );
    }

    return {
        start: DateTime.fromMillis(Math.min(...starts)),
        end: DateTime.fromMillis(Math.max(...ends)),
    };
});

const days = computed(() => {
    const startDate = timeSpan.value.start;
    const endDate = timeSpan.value.end;
    const amountDays = endDate.diff(startDate).as("days");

    const days = [];

    for (let i = 0; i < amountDays; i++) {
        days.push(startDate.plus({ days: i }));
    }

    return days;
});

const labels = computed(() => {
    const axisLabels = [];

    for (const day of days.value) {
        axisLabels.push(
            day
                .setLocale(useLocale().value)
                .toLocaleString(DateTime.DATE_SHORT),
        );
    }

    return axisLabels;
});

const eloData = computed(() => {
    const players = [];

    for (const graph of sortedEloGraphs.value) {
        players.push(transformPlayerDataToGraphData(graph));
    }

    return players;
});

const playerLabels = computed(() => {
    return [props.player, ...additionalPlayers.value];
});

const colors = computed(() => {
    const amountColors = 1 + additionalPlayers.value.length;

    const hslMin = 0;
    const hslMax = 360;
    const steps = hslMax / amountColors;
    const colors: string[] = [];
    for (let i = 0; i < amountColors; i++) {
        const h = hslMin + i * steps;
        colors.push(`hsl(${h}, 50%, 50%)`);
    }
    return colors;
});

function transformPlayerDataToGraphData(
    data: { elo: number; timestamp: number }[],
): { x: number; y: number }[] {
    const result = [];

    for (const day of days.value) {
        let targetIndex = data.findIndex((a) => a.timestamp > day.toMillis());
        if (targetIndex < 0) {
            targetIndex = data.length;
        }
        targetIndex = Math.max(0, targetIndex - 1);
        result.push({
            y: data[targetIndex].elo,
            x: day.toMillis(),
        });
    }
    return result;
}
</script>
