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
        <template #maps="{ value }">
            <MapTag
                v-for="(entry, idx) in value as RecordMap[]"
                :key="idx"
                :map="getMap(entry.map)!"
                class="mr-2"
            >
                {{ getMap(entry.map)?.name }} ({{ secondsToTime(entry.time) }})
            </MapTag>
        </template>

        <template #time="{ value }">
            {{ secondsToTime(value as number) }}
        </template>

        <template #players="{ value }">
            {{
                (value as string[])
                    .map((p) => players[p] || `Unknown player: ${p}`)
                    .join(", ")
            }}
        </template>

        <template #match="{ value }">
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
            </a>
        </template>

        <template #more="{ row }">
            <ButtonComponent @click="historyRecord = row.record as string">
                <FontAwesomeIcon :icon="['fas', 'chart-line']" size="xs" />
            </ButtonComponent>
            <ButtonComponent
                @click="detailedMatch = matches[row.match as string]"
            >
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

const props = defineProps({
    records: {
        type: Array<IGenericRecord>,
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
            Object.values(GenericRecordType).findIndex((g) => a.record === g) -
            Object.values(GenericRecordType).findIndex((g) => b.record === g),
    );
});
</script>
