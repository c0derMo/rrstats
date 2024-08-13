<template>
    <MatchDetailsDialog
        v-if="detailedMatch != null"
        :match="detailedMatch"
        :opponents="players"
        @click-outside="detailedMatch = null"
    />
    <RecordHistoryDialog
        v-if="historyMap != null"
        :map="historyMap"
        @click-outside="historyMap = null"
    />

    <TableComponent :headers="headers" :rows="sortedRecords">
        <template #map="{ value }">
            <MapTag :map="getMap(value)!" full-name />
        </template>

        <template #spin="{ row }">
            <TextualSpin
                :spin="matches[row.match]?.playedMaps[row.mapIndex]?.spin"
            />
        </template>

        <template #time="{ value }">
            {{ secondsToTime(value) }}
        </template>

        <template #player="{ value }">
            <PlayerLinkTag
                :player="players[value] ?? `Unknown player: ${value}`"
            />
        </template>

        <template #match="{ row, value }">
            <a
                v-if="matches[value] != null"
                :href="
                    matches[value].vodLink != null
                        ? matches[value].vodLink![0]
                        : ''
                "
                :class="{
                    'underline text-blue-500': matches[value].vodLink != null,
                }"
            >
                {{ matches[value].competition }}
                {{ matches[value].round }}
                <span v-if="matches[value].playerOne === row.player"
                    >vs {{ players[matches[value].playerTwo] }}</span
                >
                <span v-if="matches[value].playerTwo === row.player"
                    >vs {{ players[matches[value].playerOne] }}</span
                >
            </a>
        </template>

        <template #more="{ row }">
            <ButtonComponent @click="historyMap = row.map">
                <FontAwesomeIcon :icon="['fas', 'chart-line']" size="xs" />
            </ButtonComponent>
            <ButtonComponent @click="detailedMatch = matches[row.match]">
                <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
            </ButtonComponent>
        </template>
    </TableComponent>
</template>

<script setup lang="ts">
import type { IMapRecord } from "~/utils/interfaces/IRecord";
import type { IMatch } from "~/utils/interfaces/IMatch";

const headers = [
    { title: "Map", key: "map" },
    { title: "Spin", key: "spin" },
    { title: "Time", key: "time" },
    { title: "Player", key: "player" },
    { title: "Match", key: "match" },
    { title: "", key: "more" },
];

const detailedMatch: Ref<IMatch | null> = ref(null);
const historyMap: Ref<number | null> = ref(null);

const props = withDefaults(
    defineProps<{
        records: IMapRecord[];
        players?: Record<string, string>;
        matches?: Record<string, IMatch>;
    }>(),
    {
        players: () => ({}),
        matches: () => ({}),
    },
);

const sortedRecords = computed(() => {
    return [...props.records].sort(
        (a, b) =>
            getAllMaps().findIndex((m) => a.map === m) -
            getAllMaps().findIndex((m) => b.map === m),
    );
});
</script>
