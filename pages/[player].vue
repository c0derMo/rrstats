<template>
    <MapBackground :maps="pickedMaps" />
    <div class="flex flex-col gap-5 mt-5 mx-10">
        <div class="flex flex-row gap-5 justify-center">
            <CardComponent class="md:w-3/5">
                <div class="flex md:flex-row flex-col">
                    <img class="rounded-full w-20 h-20 self-center" src="~/assets/defaultPB.png" alt="Player Profile Picture"/>
                    <div class="flex-grow ml-5">
                        <h1 class="text-5xl">{{ route.params.player }}</h1>
                        <!-- <h3>{{ player?.uuid || "no player found" }}</h3> -->
                        <h3>Some cool accolate</h3>
                        <h3 v-if="player?.alternativeNames && player?.alternativeNames.length > 0">Also played as: {{ player?.alternativeNames?.join(", ") }}</h3>
                    </div>
                    <div class="text-xl font-light text-right">
                        <span class="italic opacity-75">Winrate: </span><span class="text-2xl w-20">{{ Math.round(winrate * 100) }}%</span><br>
                        <span class="italic opacity-75">Map-Winrate: </span><span class="text-2xl w-20">{{ Math.round(mapWinrate * 100) }}%</span>
                    </div>
                </div>
            </CardComponent>
        </div>

        <CardComponent class="flex md:flex-row w-3/5 mx-auto flex-col">
            <div class="flex-grow md:text-left text-center md:pl-10">Best RR Placement: 1st</div>
            <div class="flex-grow text-center md:border-x border-neutral-500">Maps played: {{ player?.matches.map(m => m.playedMaps.length).reduce((prev, cur) => prev+cur, 0) || 0 }}</div>
            <div class="flex-grow text-center md:border-x border-neutral-500">Matches played: {{ player?.matches.length || 0 }}</div>
            <div class="flex-grow md:text-right text-center md:pr-10">W-T-L: {{ wtl }}</div>
        </CardComponent>

        <div class="flex md:flex-row gap-5 flex-col">
            <CardComponent class="md:w-1/4">
                <TabbedContainer :tabs="['Competitions', 'Opponents']">
                    <template #Competitions>
                        <TableComponent :headers="['Competition', 'Placement']" :rows="[{'Competition': 'Roulette Rivals World Championship 2023', 'Placement': 'GS'}]" />
                    </template>
                    <template #Opponents>
                        <OpponentsTable :matches="player?.matches || []" :localPlayer="player?.uuid || ''" :opponents="player?.opponents || {}" />
                    </template>
                </TabbedContainer>
            </CardComponent>
            <CardComponent class="flex-grow">
                <MatchList :matches="(player?.matches as IMatch[])" :players="player?.opponents" :localPlayer="player?.uuid || ''" />
            </CardComponent>
        </div>

        <CardComponent>
            <TabbedContainer :tabs="['Maps', 'Time Heatmap']">
                <template #Maps>
                    <PlayerMapList :matches="player?.matches || []" :localPlayer="player?.uuid || ''" />
                </template>
                <template v-slot:[tH]>
                    <PlaytimeHeatmap :matches="player?.matches || []" />
                </template>
            </TabbedContainer>
        </CardComponent>
    </div>
</template>

<script setup lang="ts">
import { HitmanMap } from '#imports';
import { ChoosingPlayer, IMatch, WinningPlayer } from '~/utils/interfaces/IMatch';

const route = useRoute();

useHead({
    title: `${route.params.player} - RRStats v3`
});

const tH = "Time Heatmap";
const player = (await useFetch(`/api/player/?player=${route.params.player}`)).data;

const wtl = computed(() => {
    const wins = player.value?.matches.filter((m) => {
        return (m.playerOne === player.value?.uuid && m.playerOneScore > m.playerTwoScore) ||
        (m.playerTwo === player.value?.uuid && m.playerTwoScore > m.playerOneScore)
    }).length;
    const ties = player.value?.matches.filter((m) => m.playerOneScore === m.playerTwoScore).length;
    const losses = player.value?.matches.filter((m) => {
        return (m.playerOne === player.value?.uuid && m.playerOneScore < m.playerTwoScore) ||
        (m.playerTwo === player.value?.uuid && m.playerTwoScore < m.playerOneScore)
    }).length;

    return `${wins}-${ties}-${losses}`;
});

const winrate = computed(() => {
    if (player.value === null || player.value.matches.length <= 0) {
        return 0;
    }
    let wins = player.value.matches.filter((m) => {
        return (m.playerOne === player.value?.uuid && m.playerOneScore > m.playerTwoScore) ||
        (m.playerTwo === player.value?.uuid && m.playerTwoScore > m.playerOneScore)
    }).length;
    wins += player.value.matches.filter((m) => {
        return m.playerOneScore === m.playerTwoScore
    }).length / 2;

    return wins / player.value.matches.length;
});

const mapWinrate = computed(() => {
    if (player.value === null || player.value.matches.length <= 0) {
        return 0;
    }
    let maps = 0;
    let wins = 0;
    for (const match of player.value.matches) {
        maps += match.playedMaps.length;
        wins += match.playedMaps.filter((m) => {
            return (match.playerOne === player.value?.uuid && m.winner === WinningPlayer.PLAYER_ONE) ||
            (match.playerTwo === player.value?.uuid && m.winner === WinningPlayer.PLAYER_TWO)
        }).length;
        wins += match.playedMaps.filter((m) => m.winner === WinningPlayer.DRAW).length / 2;
    }
    return wins / maps;
});

const pickedMaps = computed(() => {
    const maps: HitmanMap[] = [];

    if (player.value?.matches === undefined) {
        return undefined;
    }

    for (const match of player.value.matches) {
        for (const map of match.playedMaps) {
            if (map.picked === ChoosingPlayer.PLAYER_ONE && match.playerOne === player.value?.uuid || map.picked === ChoosingPlayer.PLAYER_TWO && match.playerTwo === player.value?.uuid) {
                maps.push(map.map);
            }
        }
    }

    if (maps.length !== 0) {
        return maps;
    } else {
        return undefined;
    }
});
</script>