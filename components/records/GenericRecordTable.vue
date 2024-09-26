<template>
    <MatchDetailsDialog
        v-if="detailedMatch != null"
        :match="detailedMatch"
        @click-outside="detailedMatch = null"
    />
    <RecordHistoryDialog
        v-if="historyRecord != null"
        :generic-record="historyRecord"
        :players="players"
        @closed="historyRecord = null"
    />

    <TableComponent :headers="headers" :rows="sortedRecords">
        <template #maps="{ value }: { value: RecordMap[] }">
            <MapTag
                v-for="(entry, idx) in value"
                :key="idx"
                :map="getMap(entry.map)!"
                class="mr-2"
            >
                {{ getMap(entry.map)?.name }} ({{ secondsToTime(entry.time) }})
            </MapTag>
        </template>

        <template #time="{ value }">
            {{ secondsToTime(value) }}
        </template>

        <template
            #players="{ value, row }: { value: string[]; row: IGenericRecord }"
        >
            <template v-for="(player, idx) in value" :key="idx">
                <span :class="{ underline: isWinner(row, idx) }">{{
                    players.get(player) || `Unknown player: ${player}`
                }}</span>
                <span v-if="idx < value.length - 1">, </span>
            </template>
        </template>

        <template #match="{ value }">
            <a
                v-if="matches[value] != null"
                :href="
                    matches[value].vodLink != null
                        ? matches[value].vodLink![0]
                        : ''
                "
                :class="{
                    'underline text-blue-500':
                        matches[value as string].vodLink != null,
                }"
            >
                {{ matches[value].competition }}
                {{ matches[value].round }}
            </a>
        </template>

        <template #more="{ row }">
            <div class="flex flex-nowrap">
                <ButtonComponent @click="historyRecord = row.record">
                    <FontAwesomeIcon :icon="['fas', 'chart-line']" size="xs" />
                </ButtonComponent>
                <ButtonComponent @click="detailedMatch = matches[row.match]">
                    <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
                </ButtonComponent>
            </div>
        </template>
    </TableComponent>
</template>

<script setup lang="ts">
import {
    GenericRecordType,
    type IGenericRecord,
} from "~/utils/interfaces/IRecord";
import type { IMatch } from "~/utils/interfaces/IMatch";

interface RecordMap {
    map: number;
    time: number;
}

const headers = [
    { title: "Record", key: "record" },
    { title: "Maps", key: "maps" },
    { title: "Time", key: "time" },
    { title: "Players", key: "players" },
    { title: "Match", key: "match" },
    { title: "", key: "more" },
];

const detailedMatch: Ref<IMatch | null> = ref(null);
const historyRecord: Ref<string | null> = ref(null);

const props = withDefaults(
    defineProps<{
        records: IGenericRecord[];
        matches?: Record<string, IMatch>;
    }>(),
    {
        matches: () => ({}),
    },
);

const players = usePlayers();
await players.queryFromMatches(Object.values(props.matches));

const sortedRecords = computed(() => {
    return [...props.records].sort(
        (a, b) =>
            Object.values(GenericRecordType).findIndex((g) => a.record === g) -
            Object.values(GenericRecordType).findIndex((g) => b.record === g),
    );
});

function isWinner(record: IGenericRecord, playerIndex: number) {
    const match = props.matches[record.match];
    if (match == null) {
        return false;
    }
    if (playerIndex == 0) {
        return match.playerOneScore > match.playerTwoScore;
    } else if (playerIndex == 1) {
        return match.playerTwoScore > match.playerOneScore;
    }
    return false;
}
</script>
