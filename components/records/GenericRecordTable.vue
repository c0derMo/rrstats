<template>
    <MatchDetailsDialog v-if="detailedMatch != null" :match="detailedMatch" :opponents="players" @clickOutside="detailedMatch = null" />
    <RecordHistoryDialog v-if="historyRecord != null" :genericRecord="historyRecord" :players="players" @clickOutside="historyRecord = null" />

    <TableComponent :headers="headers" :rows="records">

        <template v-slot:maps="{ value }">
            <Tag v-for="(time, map) in value" :color="getMap(Number(map))?.color" class="mr-2">
                {{ getMap(Number(map))?.name }} ({{ secondsToTime(time) }})
            </Tag>
        </template>

        <template v-slot:time="{ value }">
            {{ secondsToTime(value as number) }}
        </template>

        <template v-slot:players="{ value }">
            {{ (value as string[]).map(p => players[p] || `Unknown player: ${p}`).join(", ") }}
        </template>

        <template v-slot:match="{ value }">
            {{ matches[value as string].competition }} {{ matches[value as string].round }}
        </template>

        <template v-slot:more="{ row }">
            <ButtonComponent @click="historyRecord = row.record as string" >
                <FontAwesomeIcon :icon="['fas', 'chart-line']" size="xs" />
            </ButtonComponent>
            <ButtonComponent @click="detailedMatch = matches[row.match as string]">
                <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
            </ButtonComponent>
        </template>
    </TableComponent>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisH, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { IGenericRecord } from '~/utils/interfaces/IRecord';
import { IMatch } from '~/utils/interfaces/IMatch';
import { Duration } from 'luxon';

library.add(faEllipsisH);
library.add(faChartLine);

const headers = [
    { title: 'Record', key: 'record' },
    { title: 'Maps', key: 'maps' },
    { title: 'Time', key: 'time' },
    { title: 'Players', key: 'players' },
    { title: 'Match', key: 'match' },
    { title: '', key: 'more' }
];

const detailedMatch: Ref<IMatch | null> = ref(null);
const historyRecord: Ref<string | null> = ref(null);

defineProps({
    'records': {
        type: Array<IGenericRecord>,
        required: true
    },
    'players': {
        type: Object as PropType<Record<string, string>>,
        required: false,
        default: {}
    },
    'matches': {
        type: Object as PropType<Record<string, IMatch>>,
        required: false,
        default: {}
    }
});

function secondsToTime(seconds: number): string {
    const dur = Duration.fromMillis(seconds * 1000);
    if (dur.as("hours") >= 1) {
        return dur.toFormat("hh:mm:ss")
    } else {
        return dur.toFormat("mm:ss")
    }
}
</script>