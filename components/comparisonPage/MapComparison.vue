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
import { IMatch } from '~/utils/interfaces/IMatch';
import { mapBansForMap, mapPicksForMap, mapPlaysForMap, mapWinsForMap } from '~/utils/statCalculators/mapStatCalculators';

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
    return mapPicksForMap(matches, player, map);
}

function getBanned(map: HitmanMap, player: string, matches: IMatch[]): number {
    return mapBansForMap(matches, player, map);
}

function getPlayed(map: HitmanMap, player: string, matches: IMatch[]): number {
    return mapPlaysForMap(matches, map);
}

function getWon(map: HitmanMap, player: string, matches: IMatch[]): number {
    return mapWinsForMap(matches, player, map);
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