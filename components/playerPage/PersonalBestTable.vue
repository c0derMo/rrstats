<template>
    <div>
        <TableComponent :headers="headers" :rows="sortedPbs">
            <template #map="{ row }">
                <MapTag :map="getMap(row.map)!" full-name />
            </template>
            <template #time="{ row }">
                {{ secondsToTime(row.matchMap.timeTaken) }}
            </template>
            <template #spin="{ row }">
                <TextualSpin :spin="row.matchMap.spin" />
            </template>
            <template #match="{ row }">
                <a
                    :href="
                        row.match.vodLink != null ? row.match.vodLink![0] : ''
                    "
                    :class="{
                        'underline text-blue-500': row.match.vodLink != null,
                    }"
                >
                    {{ row.match.competition }}
                    {{ row.match.round }}
                    vs
                    <span v-if="row.match.playerOne === localPlayer">
                        {{ players[row.match.playerTwo] }}
                    </span>
                    <span v-if="row.match.playerTwo === localPlayer">
                        {{ players[row.match.playerOne] }}
                    </span>
                </a>
            </template>
        </TableComponent>
    </div>
</template>

<script setup lang="ts">
import {
    type IMatch,
    type RRMap,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";

const props = defineProps({
    matches: {
        type: Array<IMatch>,
        required: true,
    },
    localPlayer: {
        type: String,
        required: true,
    },
    players: {
        type: Object as PropType<Record<string, string>>,
        required: false,
        default: () => {},
    },
});

const headers = [
    { title: "Map", key: "map" },
    { title: "Time", key: "time" },
    { title: "Spin", key: "spin" },
    { title: "Match", key: "match" },
];

const pbs = computed(() => {
    const personalBests = new Map<number, { match: IMatch; map: RRMap }>();

    for (const match of props.matches) {
        for (const map of match.playedMaps) {
            if (map.forfeit) continue;
            if (map.timeTaken < 0) continue;
            if (
                map.winner === WinningPlayer.DRAW ||
                (map.winner === WinningPlayer.PLAYER_ONE &&
                    match.playerOne != props.localPlayer) ||
                (map.winner === WinningPlayer.PLAYER_TWO &&
                    match.playerTwo != props.localPlayer)
            )
                continue;

            const previousBest =
                personalBests.get(map.map)?.map.timeTaken || -1;
            if (map.timeTaken < previousBest || previousBest < 0) {
                personalBests.set(map.map, { match: match, map: map });
            }
        }
    }

    const result = [];

    for (const [map, info] of personalBests.entries()) {
        result.push({ map: map, match: info.match, matchMap: info.map });
    }

    return result;
});

const sortedPbs = computed(() => {
    return [...pbs.value].sort(
        (a, b) =>
            getAllMaps().findIndex((m) => a.map === m) -
            getAllMaps().findIndex((m) => b.map === m),
    );
});
</script>
