<template>
    <MatchDetailsDialog v-if="detailedMatch != null" :match="detailedMatch" :opponents="players" @clickOutside="detailedMatch = null" />
    <RecordHistoryDialog v-if="historyMap != null" :map="historyMap" @clickOutside="historyMap = null" />

    <TableComponent :headers="headers" :rows="sortedRecords">
        <template v-slot:map="{ value }">
            <Tag :color="getMap(value as number)?.color">{{ getMap(value as number)?.name }}</Tag>
        </template>

        <template v-slot:spin="{ row }">
            <TextualSpin :spin="matches[row.match]?.playedMaps[row.mapIndex]?.spin" />
        </template>

        <template v-slot:time="{ value }">
            {{ secondsToTime(value as number) }}
        </template>

        <template v-slot:player="{ value }">
            {{ players[value as string] || `Unknown player: ${value}` }}
        </template>

        <template v-slot:match="{ row, value }">
            {{ matches[value as string].competition }} {{ matches[value as string].round }}
            <span v-if="matches[value as string].playerOne === row.player">vs {{ players[matches[value as string].playerTwo] }}</span>
            <span v-if="matches[value as string].playerTwo === row.player">vs {{ players[matches[value as string].playerOne] }}</span>
        </template>

        <template v-slot:more="{ row }">
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisH, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { IMapRecord } from '~/utils/interfaces/IRecord';
import { IMatch } from '~/utils/interfaces/IMatch';

library.add(faEllipsisH);
library.add(faChartLine);

const headers = [
    { title: 'Map', key: 'map' },
    { title: 'Spin', key: 'spin' },
    { title: 'Time', key: 'time' },
    { title: 'Player', key: 'player' },
    { title: 'Match', key: 'match' },
    { title: '', key: 'more' }
]

const detailedMatch: Ref<IMatch | null> = ref(null);
const historyMap: Ref<number | null> = ref(null);

const props = defineProps({
    'records': {
        type: Array<IMapRecord>,
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

const sortedRecords = computed(() => {
    return [...props.records].sort((a, b) => getAllMaps().findIndex(m => a.map === m) - getAllMaps().findIndex(m => b.map === m));
})
</script>