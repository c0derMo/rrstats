<template>
    <MatchDetailsDialog v-if="matchToShow != null" @clickOutside="matchToShow = null" :match="matchToShow" :opponents="players" />
    <DataTableComponent :headers="headers" :rows="matches">
        <template v-slot:playerOne="{ value }">
            {{ players[value as string] || `Unknown player (${value})` }}
        </template>

        <template v-slot:playerTwo="{ value }">
            {{ players[value as string] || `Unknown player (${value})` }}
        </template>

        <template v-slot:score="{ row }">
            <Tag :color="getMatchColor(row)">
                {{ row.playerOneScore }} - {{ row.playerTwoScore }}
            </Tag>
        </template>

        <template v-slot:playedMaps="{ value, row }">
            <Tag
                v-for="map of value"
                :color="getMapColor(map, row)"
                class="ml-2"
            >
                {{ getMap((map as HitmanMapInfo).map)?.abbreviation }}
            </Tag>
        </template>

        <template v-slot:more="{ row }">
            <ButtonComponent @click="matchToShow = row">
                <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
            </ButtonComponent>
        </template>
    </DataTableComponent>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { IMatch, RRMap, WinningPlayer } from '~/utils/interfaces/IMatch';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

library.add(faEllipsisH);

const headers = [
    { title: 'Competition', key: 'competition' },
    { title: '', key: 'round' },
    { title: 'Player 1', key: 'playerOne' },
    { title: 'Score', key: 'score' },
    { title: 'Player 2', key: 'playerTwo' },
    { title: 'Maps', key: 'playedMaps' },
    { title: '', key: 'more' },
];

const matchToShow: Ref<IMatch | null> = ref(null);

const props = defineProps({
    'matches': {
        type: Object as PropType<IMatch[]>,
        required: false,
        default: []
    },
    'players': {
        type: Object as PropType<Record<string, string>>,
        required: false,
        default: {}
    },
    'localPlayer': {
        type: String,
        required: true,
    }
});

function getMapColor(map: RRMap, match: IMatch): string {
    if (map.winner === WinningPlayer.DRAW) {
        return '#d0c033';
    } else if (
        match.playerOne === props.localPlayer && map.winner === WinningPlayer.PLAYER_ONE ||
        match.playerTwo === props.localPlayer && map.winner === WinningPlayer.PLAYER_TWO
    ) {
        return '#4caf50';
    } else {
        return '#f44336';
    }
}

function getMatchColor(match: IMatch): string {
    if (match.playerOneScore === match.playerTwoScore) {
        return '#d0c033';
    } else if (
        match.playerOneScore > match.playerTwoScore && match.playerOne === props.localPlayer ||
        match.playerTwoScore > match.playerOneScore && match.playerTwo === props.localPlayer
    ) {
        return '#4caf50';
    } else {
        return '#f44336';
    }
}
</script>