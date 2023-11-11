<template>
    <CardComponent>
        <TableComponent :headers="headers" :rows="rows">

            <template v-slot:Map="{ row }">
                {{ getMap(row.map)?.name }}
            </template>

            <template v-slot:Picked="{ row }">
                <span :class="getAheadBehindClass(row.map, getPicked)">
                    {{ getPicked(row.map, player, playerMatches) }}
                </span>
            </template>

            <template v-slot:Banned="{ row }">
                <span :class="getAheadBehindClass(row.map, getBanned)">
                    {{ getBanned(row.map, player, playerMatches) }}
                </span>
            </template>

            <template v-slot:Played="{ row }">
                <span :class="getAheadBehindClass(row.map, getPlayed)">
                    {{ getPlayed(row.map, player, playerMatches) }}
                </span>
            </template>

            <template v-slot:Won="{ row }">
                <span :class="getAheadBehindClass(row.map, getWon)">
                    {{ getWon(row.map, player, playerMatches) }}
                </span>
            </template>

            <template v-slot:Winrate="{ row }">
                <span :class="getAheadBehindClass(row.map, getWinrate)">
                    {{ Math.round( getWinrate(row.map, player, playerMatches) * 100 ) }}%
                </span>
            </template>

        </TableComponent>
    </CardComponent>
</template>

<script setup lang="ts">
import { HitmanMap } from '#imports';
import { ChoosingPlayer, IMatch, WinningPlayer } from '~/utils/interfaces/IMatch';

const props = defineProps({
    'maps': {
        type: Array<HitmanMap>,
        required: true,
    },
    'player': {
        type: String,
        required: true
    },
    'playerMatches': {
        type: Array<IMatch>,
        required: true,
    },
    'comparingPlayer': {
        type: String,
        required: false,
    },
    'comparingPlayerMatches': {
        type: Array<IMatch>,
        required: false
    }
});

const headers = ['Map', 'Picked', 'Banned', 'Played', 'Won', 'Winrate'];
const rows = computed(() => {
    return props.maps.map(m => {
        return {
            'map': m
        }
    })
});

function getPicked(map: HitmanMap, player: string, matches: IMatch[]): number {
    let picked = 0;
    for (const match of matches) {
        for (const playedMap of match.playedMaps) {
            if (playedMap.map !== map) continue;
            if (playedMap.picked === ChoosingPlayer.PLAYER_ONE && match.playerOne === player || playedMap.picked === ChoosingPlayer.PLAYER_TWO && match.playerTwo === player) {
                picked++;
            }
        }
    }
    return picked;
}

function getBanned(map: HitmanMap, player: string, matches: IMatch[]): number {
    let banned = 0;
    for (const match of matches) {
        for (const playedMap of match.bannedMaps) {
            if (playedMap.map !== map) continue;
            if (playedMap.picked === ChoosingPlayer.PLAYER_ONE && match.playerOne === player || playedMap.picked === ChoosingPlayer.PLAYER_TWO && match.playerTwo === player) {
                banned++;
            }
        }
    }
    return banned;
}

function getPlayed(map: HitmanMap, player: string, matches: IMatch[]): number {
    let played = 0;
    for (const match of matches) {
        for (const playedMap of match.playedMaps) {
            if (playedMap.map !== map) continue;
            played++;
        }
    }
    return played;
}

function getWon(map: HitmanMap, player: string, matches: IMatch[]): number {
    let won = 0;
    for (const match of matches) {
        for (const playedMap of match.playedMaps) {
            if (playedMap.map !== map) continue;
            if (playedMap.winner === WinningPlayer.PLAYER_ONE && match.playerOne === player || playedMap.winner === WinningPlayer.PLAYER_TWO && match.playerTwo === player) {
                won++;
            } else if (playedMap.winner === WinningPlayer.DRAW) {
                won += 0.5;
            }
        }
    }
    return won;
}

function getWinrate(map: HitmanMap, player: string, matches: IMatch[]): number {
    return getWon(map, player, matches) / getPlayed(map, player, matches);
}

function isAhead(map: HitmanMap, f: (map: HitmanMap, player: string, matches: IMatch[]) => number): boolean {
    if (props.comparingPlayer == null || props.comparingPlayerMatches == null) {
        return false;
    }
    return f(map, props.player, props.playerMatches) > f(map, props.comparingPlayer, props.comparingPlayerMatches);
}

function isBehind(map: HitmanMap, f: (map: HitmanMap, player: string, matches: IMatch[]) => number): boolean {
    if (props.comparingPlayer == null || props.comparingPlayerMatches == null) {
        return false;
    }
    return f(map, props.player, props.playerMatches) < f(map, props.comparingPlayer, props.comparingPlayerMatches);
}

function getAheadBehindClass(map: HitmanMap, f: (map: HitmanMap, player: string, matches: IMatch[]) => number): string {
    if (isAhead(map, f)) {
        return "ahead";
    }
    if (isBehind(map, f)) {
        return "behind";
    }
    return "";
}
</script>

<style scoped lang="postcss">
.ahead {
    @apply text-green-500;
}
.behind {
    @apply text-red-500;
}
</style>