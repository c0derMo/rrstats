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
                        {{ players.get(row.match.playerTwo) }}
                    </span>
                    <span v-if="row.match.playerTwo === localPlayer">
                        {{ players.get(row.match.playerOne) }}
                    </span>
                </a>
            </template>
        </TableComponent>
    </div>
</template>

<script setup lang="ts">
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayerStatistics } from "~/utils/interfaces/IPlayer";

const props = defineProps<{
    localPlayer: string;
    statistics: IPlayerStatistics;
}>();

const players = usePlayers();
await players.queryFromMatches(
    props.statistics.mapPBs
        .map((pb) => pb.match)
        .filter((match) => match != null) as IMatch[],
);

const headers = [
    { title: "Map", key: "map" },
    { title: "Time", key: "time" },
    { title: "Spin", key: "spin" },
    { title: "Match", key: "match" },
];

const pbs = computed(() => {
    const personalBests = props.statistics.mapPBs;

    const result = [];
    for (const map in personalBests) {
        if (personalBests[map].match == null) {
            continue;
        }
        result.push({
            map: parseInt(map) as HitmanMap,
            match: personalBests[map].match!,
            matchMap:
                personalBests[map].match!.playedMaps[personalBests[map].map],
        });
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
