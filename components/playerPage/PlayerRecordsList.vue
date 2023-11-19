<template>
    <DataTableComponent :headers="headers" :rows="records ?? []" :enableSorting="false">

        <template v-slot:record="{ row }">
            <span v-if="'map' in row">
                {{ getMap(row.map)!.name }}
            </span>
            <span v-if="'record' in row">
                {{ row.record }}
            </span>
        </template>

        <template v-slot:time="{ value }">
            {{ secondsToTime(value as number) }}
        </template>

        <template v-slot:record_duration="{ row }">
            <span>{{ DateTime.fromMillis(row.timestamp).toLocaleString(DateTime.DATE_SHORT) }}</span>
            -
            <span v-if="row.brokenAt > 0">{{ DateTime.fromMillis(row.brokenAt).toLocaleString(DateTime.DATE_SHORT) }}</span>
            <span v-else>now</span>
        </template>

    </DataTableComponent>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

const props = defineProps({
    "player": {
        type: String,
        required: true,
    }
})

const headers = [
    { key: 'record', title: 'Record' },
    { key: 'time', title: 'Time' },
    { key: 'record_duration', title: 'Record duration' },
];

const records = (await useFetch('/api/records/player', { query: { player: props.player } })).data;
</script>