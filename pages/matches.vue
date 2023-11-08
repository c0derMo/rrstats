<template>
    <MatchDetailsDialog v-if="matchToShow != null" :match="matchToShow" :opponents="data?.players || {}" @clickOutside="matchToShow = null" />
    <CompetitionBackground :competitions="[competition?.backgroundImage || tournament as string]" />

    <div class="flex flex-col gap-3 mx-10">
        <h1 class="text-center text-5xl bold">{{ competition?.name }} - Matches</h1>

        <DataTableComponent :headers="headers" :rows="sortedMatches" :enable-sorting="false" :rows-per-page="[10, 25, 50, 100]" :default-rows-per-page="25" >

            <template v-slot:timestamp="{ value }">
                {{ DateTime.fromMillis(value as number).toLocaleString(DateTime.DATETIME_FULL) }}
            </template>

            <template v-slot:playerOne="{ value }">
                {{ data?.players[value as string] || `Unknown player: ${value}` }}
            </template>

            <template v-slot:score="{ row }">
                <span class="whitespace-nowrap">{{ row.playerOneScore }} - {{ row.playerTwoScore }}</span>
            </template>

            <template v-slot:playerTwo="{ value }">
                {{ data?.players[value as string] || `Unknown player: ${value}` }}
            </template>

            <template v-slot:bans="{ row }">
                <div class="flex flex-wrap">
                    <Tag v-for="ban in row.bannedMaps" :color="getMap(ban.map)?.color">{{ getMap(ban.map)?.abbreviation }}</Tag>
                </div>
            </template>

            <template v-slot:playedMaps="{ value }">
                <div class="flex flex-wrap">
                    <Tag v-for="play in (value as RRMap[])" :color="getMap(play.map)?.color">{{ getMap(play.map)?.abbreviation }}</Tag>
                </div>
            </template>

            <template v-slot:shoutcasters="{ value }">
                <span v-if="value !==null">{{ (value as string[]).join(", ") }}</span>
            </template>

            <template v-slot:actions="{ row }">
                <ButtonComponent @click="matchToShow = row">
                    <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
                </ButtonComponent>
            </template>

        </DataTableComponent>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { IMatch, RRMap } from '~/utils/interfaces/IMatch';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

library.add(faEllipsisH);

const matchToShow: Ref<IMatch | null> = ref(null);

const headers = [
    { title: 'Date & Time', key: 'timestamp' },
    { title: 'Player 1', key: 'playerOne' },
    { title: '', key: 'score' },
    { title: 'Player 2', key: 'playerTwo' },
    { title: 'Bans', key: 'bans' },
    { title: 'Maps', key: 'playedMaps' },
    { title: 'Shoutcast', key: 'shoutcasters' },
    { title: '', key: 'actions' },
];

const tournament = useRoute().query.tournament;
const data = (await useFetch("/api/matches", { query: { tournament } })).data;
const competition = (await useFetch("/api/competitions", { query: { tag: tournament }})).data;

useHead({
    title: `${competition.value?.name} - RRStats v3`
});

const sortedMatches = computed(() => {
    if (data.value === null) {
        return [];
    }
    return data.value.matches.sort((a, b) => b.timestamp - a.timestamp);
})
</script>