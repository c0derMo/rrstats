<template>
    <MatchDetailsDialog
        v-if="detailedMatch != null"
        :match="detailedMatch"
        :opponents="players"
        @click-outside="detailedMatch = null"
    />
    <RecordHistoryDialog
        v-if="historyRecord != null"
        :generic-record="historyRecord"
        :players="players"
        @click-outside="historyRecord = null"
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

        <template #players="{ value }: { value: string[] }">
            {{
                value
                    .map((p) => players[p] || `Unknown player: ${p}`)
                    .join(", ")
            }}
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
            <ButtonComponent @click="historyRecord = row.record">
                <FontAwesomeIcon :icon="['fas', 'chart-line']" size="xs" />
            </ButtonComponent>
            <ButtonComponent @click="detailedMatch = matches[row.match]">
                <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
            </ButtonComponent>
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
            Object.values(GenericRecordType).findIndex((g) => a.record === g) -
            Object.values(GenericRecordType).findIndex((g) => b.record === g),
    );
});
</script>
