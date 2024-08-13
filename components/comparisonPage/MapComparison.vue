<template>
    <CardComponent>
        <TableComponent :headers="headers" :rows="rows">
            <template #Map="{ row }">
                {{ getMap(row.map)?.name }}
            </template>

            <template #Picked="{ row }">
                <span :class="getAheadBehindClass(row.map, getPicked)">
                    {{ getPicked(row.map, Player.SELF) }}
                </span>
            </template>

            <template #Banned="{ row }">
                <span :class="getAheadBehindClass(row.map, getBanned)">
                    {{ getBanned(row.map, Player.SELF) }}
                </span>
            </template>

            <template #Played="{ row }">
                <span :class="getAheadBehindClass(row.map, getPlayed)">
                    {{ getPlayed(row.map, Player.SELF) }}
                </span>
            </template>

            <template #Won="{ row }">
                <span :class="getAheadBehindClass(row.map, getWon)">
                    {{ getWon(row.map, Player.SELF) }}
                </span>
            </template>

            <template #Winrate="{ row }">
                <span :class="getAheadBehindClass(row.map, getWinrate)">
                    {{ Math.round(getWinrate(row.map, Player.SELF) * 100) }}%
                </span>
            </template>
        </TableComponent>
    </CardComponent>
</template>

<script setup lang="ts">
import type { HitmanMap } from "#imports";
import type { IPlayerStatistics } from "~/utils/interfaces/IPlayer";

const props = withDefaults(
    defineProps<{
        maps: HitmanMap[];
        statistics: IPlayerStatistics;
        comparingStatistics?: IPlayerStatistics;
    }>(),
    {
        comparingStatistics: undefined,
    },
);

const headers = ["Map", "Picked", "Banned", "Played", "Won", "Winrate"];
const rows = computed(() => {
    return props.maps.map((m) => {
        return {
            map: m,
        };
    });
});

enum Player {
    SELF,
    COMPARING,
}

function getPicked(map: HitmanMap, player: Player): number {
    if (player === Player.SELF) {
        return props.statistics.mapsPicked[map];
    } else if (player === Player.COMPARING) {
        return props.comparingStatistics?.mapsPicked[map] ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getBanned(map: HitmanMap, player: Player): number {
    if (player === Player.SELF) {
        return props.statistics.mapsBanned[map];
    } else if (player === Player.COMPARING) {
        return props.comparingStatistics?.mapsBanned[map] ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getPlayed(map: HitmanMap, player: Player): number {
    if (player === Player.SELF) {
        return props.statistics.mapsPlayed[map];
    } else if (player === Player.COMPARING) {
        return props.comparingStatistics?.mapsPlayed[map] ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getWon(map: HitmanMap, player: Player): number {
    if (player === Player.SELF) {
        return props.statistics.mapsWon[map];
    } else if (player === Player.COMPARING) {
        return props.comparingStatistics?.mapsWon[map] ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getWinrate(map: HitmanMap, player: Player): number {
    if (player === Player.SELF) {
        return props.statistics.perMapWinrate[map];
    } else if (player === Player.COMPARING) {
        return props.comparingStatistics?.perMapWinrate[map] ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function isAhead(
    map: HitmanMap,
    f: (map: HitmanMap, player: Player) => number,
): boolean {
    if (props.comparingStatistics == null) {
        return false;
    }
    return f(map, Player.SELF) > f(map, Player.COMPARING);
}

function isBehind(
    map: HitmanMap,
    f: (map: HitmanMap, player: Player) => number,
): boolean {
    if (props.comparingStatistics == null) {
        return false;
    }
    return f(map, Player.SELF) < f(map, Player.COMPARING);
}

function getAheadBehindClass(
    map: HitmanMap,
    f: (map: HitmanMap, player: Player) => number,
): string {
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
