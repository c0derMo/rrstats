<template>
    <DataTableComponent
        :headers="headers"
        :rows="records ?? []"
        :enable-sorting="false"
    >
        <template #record="{ row }">
            <span v-if="'map' in row">
                {{ getMap(row.map)!.name }}
            </span>
            <span v-if="'record' in row">
                {{ row.record }}
            </span>
        </template>

        <template #time="{ value }">
            {{ secondsToTime(value) }}
        </template>

        <template #record_duration="{ row }">
            <span>{{
                DateTime.fromMillis(row.timestamp)
                    .setLocale(useLocale().value)
                    .toLocaleString(DateTime.DATE_SHORT)
            }}</span>
            -
            <span v-if="row.brokenAt > 0">{{
                DateTime.fromMillis(row.brokenAt)
                    .setLocale(useLocale().value)
                    .toLocaleString(DateTime.DATE_SHORT)
            }}</span>
            <span v-else>now</span>
        </template>
    </DataTableComponent>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";

const props = defineProps({
    player: {
        type: String,
        required: true,
    },
});

const headers = [
    { key: "record", title: "Record" },
    { key: "time", title: "Time" },
    { key: "record_duration", title: "Record duration" },
];

const { data: records } = await useFetch("/api/records/player", {
    query: { player: props.player },
});

records.value?.sort((a, b) => {
    if (a.brokenAt === -1 && b.brokenAt !== -1) {
        return -1;
    }
    if (b.brokenAt === -1 && a.brokenAt !== -1) {
        return 1;
    }
    return b.timestamp - a.timestamp;
});
</script>
