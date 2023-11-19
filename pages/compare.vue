<template>
    <MapBackground />
    
    <div class="grid grid-cols-2 gap-5 mx-10 my-5">
        <AutocompleteComponent :suggestions="players ?? []" placeholder="Left player" @confirm="(val) => leftPlayer = val" />
            
        <AutocompleteComponent :suggestions="players ?? []" placeholder="Right player" @confirm="(val) => rightPlayer = val" />

        <div class="text-center">
            <FontAwesomeIcon v-if="leftPlayerLoading" :icon="['fas', 'spinner']" class="animate-spin" size="2x" />
        </div>
        
        <div class="text-center">
            <FontAwesomeIcon v-if="rightPlayerLoading" :icon="['fas', 'spinner']" class="animate-spin" size="2x" />
        </div>

        <div>
            <ComparingPlayer v-if="leftPlayerObject !== null" :player="leftPlayerObject.player" :playerMatches="leftPlayerObject.matches" :playerAvatar="leftPlayerObject.avatar" :playerPlacements="leftPlayerObject.placements" :comparingPlayer="rightPlayerObject?.player.uuid" :comparingMatches="rightPlayerObject?.matches" :comparingPlacements="rightPlayerObject?.placements" :competitions="competitions!" />
        </div>

        <div>
            <ComparingPlayer :reverse="true" v-if="rightPlayerObject !== null" :player="rightPlayerObject.player" :playerMatches="rightPlayerObject.matches" :playerAvatar="rightPlayerObject.avatar" :playerPlacements="rightPlayerObject.placements" :comparingPlayer="leftPlayerObject?.player.uuid" :comparingMatches="leftPlayerObject?.matches" :comparingPlacements="leftPlayerObject?.placements" :competitions="competitions!" />
        </div>

        <TabbedContainer v-if="leftPlayerObject !== null || rightPlayerObject !== null"  class="col-span-2" :tabs="['Season 1', 'Season 2', 'Season 3']" @changeTab="(val) => selectedSeason = val"/>

        <MapComparison v-if="leftPlayerObject !== null" :maps="comparingMaps" :player="leftPlayerObject.player.uuid" :playerMatches="leftPlayerObject.matches" :comparingPlayer="rightPlayerObject?.player.uuid" :comparingPlayerMatches="rightPlayerObject?.matches" />

        <MapComparison v-if="rightPlayerObject !== null" :maps="comparingMaps" :player="rightPlayerObject.player.uuid" :playerMatches="rightPlayerObject.matches" :comparingPlayer="leftPlayerObject?.player.uuid" :comparingPlayerMatches="leftPlayerObject?.matches" />
    </div>

</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { IMatch } from '~/utils/interfaces/IMatch';
import { IPlayer } from '~/utils/interfaces/IPlayer';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ICompetitionPlacement } from '~/utils/interfaces/ICompetition';

library.add(faSpinner);

interface ComparisonData {
    player: IPlayer,
    matches: IMatch[],
    avatar: string,
    placements: ICompetitionPlacement[]
}

useHead({
    title: 'Comparison - RRStats v3'
})

const players = (await useFetch('/api/player/list')).data;
const competitions = (await useFetch('/api/competitions/list')).data;
const route = useRoute();

const leftPlayer = ref("");
const rightPlayer = ref("");

const leftPlayerObject: Ref<ComparisonData | null> = ref(null);
const rightPlayerObject: Ref<ComparisonData | null> = ref(null);
const leftPlayerLoading = ref(false);
const rightPlayerLoading = ref(false);

const selectedSeason = ref("Season 1");

onMounted(async () => {
    if (route.query.leftPlayer !== undefined) {
        leftPlayer.value = route.query.leftPlayer as string;
    }
    if (route.query.rightPlayer !== undefined) {
        rightPlayer.value = route.query.rightPlayer as string;
    }
});

watch(leftPlayer, async () => {
    leftPlayerLoading.value = true;
    leftPlayerObject.value = await getComparisonData(leftPlayer.value);
    leftPlayerLoading.value = false;
    const currentQuery = new URLSearchParams(window.location.search);
    currentQuery.set('leftPlayer', leftPlayer.value);
    const newPath = window.location.pathname + '?' + currentQuery.toString();
    history.pushState(null, '', newPath);
})
watch(rightPlayer, async () => {
    rightPlayerLoading.value = true;
    rightPlayerObject.value = await getComparisonData(rightPlayer.value);
    rightPlayerLoading.value = false;
    const currentQuery = new URLSearchParams(window.location.search);
    currentQuery.set('rightPlayer', rightPlayer.value);
    const newPath = window.location.pathname + '?' + currentQuery.toString();
    history.pushState(null, '', newPath);
});

async function getComparisonData(player: string): Promise<ComparisonData | null> {
    if (player === "") {
        return null;
    }
    const playerData = await useFetch(`/api/player/?player=${player}`);
    const avatar = await useFetch(`/api/player/avatar?player=${player}`);

    if (playerData.status.value !== 'success' || avatar.status.value !== 'success') {
        return null;
    }
    return {
        player: playerData.data.value as IPlayer,
        matches: playerData.data.value!.matches,
        avatar: avatar.data.value!,
        placements: playerData.data.value!.placements
    }
}

const comparingMaps = computed(() => {
    if (selectedSeason.value === 'Season 1') {
        return [ HitmanMap.PARIS, HitmanMap.SAPIENZA, HitmanMap.MARRAKESH, HitmanMap.BANGKOK, HitmanMap.COLORADO, HitmanMap.HOKKAIDO ];
    }
    if (selectedSeason.value === 'Season 2') {
        return [ HitmanMap.MIAMI, HitmanMap.SANTA_FORTUNA, HitmanMap.MUMBAI, HitmanMap.WHITTLETON_CREEK, HitmanMap.ISLE_OF_SGAIL, HitmanMap.NEW_YORK, HitmanMap.HAVEN_ISLAND ];
    }
    if (selectedSeason.value === 'Season 3') {
        return [ HitmanMap.DUBAI, HitmanMap.DARTMOOR, HitmanMap.BERLIN, HitmanMap.CHONGQING, HitmanMap.MENDOZA, HitmanMap.AMBROSE_ISLAND ];
    }
    return [];
});
</script>