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
            <Tag :color="getMap(value as number)?.color">{{
                getMap(value as number)?.name
            }}</Tag>
        </template>

        <template #spin="{ row }">
            <TextualSpin
                :spin="matches[row.match]?.playedMaps[row.mapIndex]?.spin"
            />
        </template>

        <template #time="{ value }">
            {{ secondsToTime(value as number) }}
        </template>

        <template #player="{ value }">
            <PlayerLinkTag
                :player="players[value as string] ?? `Unknown player: ${value}`"
            />
        </template>

        <template #match="{ row, value }">
            <a
                v-if="matches[value as string] != null"
                :href="
                    matches[value as string].vodLink != null
                        ? matches[value as string].vodLink![0]
                        : ''
                "
                :class="{
                    'underline text-blue-500':
                        matches[value as string].vodLink != null,
                }"
            >
                {{ matches[value as string].competition }}
                {{ matches[value as string].round }}
                <span v-if="matches[value as string].playerOne === row.player"
                    >vs {{ players[matches[value as string].playerTwo] }}</span
                >
                <span v-if="matches[value as string].playerTwo === row.player"
                    >vs {{ players[matches[value as string].playerOne] }}</span
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
import { IMapRecord } from "~/utils/interfaces/IRecord";
import { IMatch } from "~/utils/interfaces/IMatch";

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

const props = defineProps({
    records: {
        type: Array<IMapRecord>,
        required: true,
    },
    players: {
        type: Object as PropType<Record<string, string>>,
        required: false,
        default: () => {},
    },
    matches: {
        type: Object as PropType<Record<string, IMatch>>,
        required: false,
        default: () => {},
    },
});

const sortedRecords = computed(() => {
    return [...props.records].sort(
        (a, b) =>
            getAllMaps().findIndex((m) => a.map === m) -
            getAllMaps().findIndex((m) => b.map === m),
    );
});
</script>
