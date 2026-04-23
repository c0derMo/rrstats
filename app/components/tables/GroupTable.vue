<template>
    <div class="w-full flex flex-col gap-2">
        <h1 class="font-bold">{{ groupName }}</h1>

        <table class="w-full">
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Player</th>
                    <th>Mat</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>Pts</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(player, idx) of sortedPlayers"
                    :key="idx"
                    :class="{
                        'dark:bg-green-800 bg-green-500':
                            isPlayerAdvancing(idx),
                        'dark:bg-red-800 bg-red-400': isPlayerNotAdvancing(idx),
                    }"
                >
                    <td class="text-right">{{ idx + 1 }}</td>
                    <td class="text-left">
                        {{ playerLookup.get(player.name) }}
                    </td>
                    <td class="text-center">
                        {{ player.wins + player.ties + player.losses }}
                    </td>
                    <td class="text-center">{{ player.wins }}</td>
                    <td class="text-center">{{ player.ties }}</td>
                    <td class="text-center">{{ player.losses }}</td>
                    <td class="text-center">{{ player.points }}</td>
                </tr>
            </tbody>
        </table>

        <table class="w-full">
            <thead>
                <tr>
                    <th>
                        <ButtonComponent
                            class="text-sm italic font-normal"
                            @click="cycleStat"
                        >
                            {{ buttonText }}
                        </ButtonComponent>
                    </th>
                    <th
                        v-for="(player, idx) of props.players"
                        :key="idx"
                        style="writing-mode: sideways-lr"
                    >
                        {{ playerLookup.get(player.name) }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(leftPlayer, lpIdx) of props.players" :key="lpIdx">
                    <td>{{ playerLookup.get(leftPlayer.name) }}</td>
                    <td
                        v-for="(rightPlayer, rpIdx) of props.players"
                        :key="rpIdx"
                    >
                        <div
                            v-if="currentlyShowing === ShowingStat.SCORE"
                            :style="getScoreColor(leftPlayer, rightPlayer)"
                        >
                            {{ getScoreLine(leftPlayer, rightPlayer) }}
                        </div>
                        <template v-if="currentlyShowing === ShowingStat.MAP">
                            <div
                                v-for="(map, mapIdx) in getPickedMaps(
                                    leftPlayer,
                                    rightPlayer,
                                )"
                                :key="mapIdx"
                                class="text-center text-black"
                                :style="getMapStyle(map)"
                            >
                                {{ getMap(map)!.abbreviation }}
                            </div>
                        </template>
                        <template v-if="currentlyShowing === ShowingStat.BAN">
                            <div
                                v-for="(map, mapIdx) in getBannedMaps(
                                    leftPlayer,
                                    rightPlayer,
                                )"
                                :key="mapIdx"
                                class="text-center text-black"
                                :style="getMapStyle(map)"
                            >
                                {{ getMap(map)!.abbreviation }}
                            </div>
                        </template>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
interface GroupPlayer {
    name: string;
    wins: number;
    ties: number;
    losses: number;
    points: number;
    scoresVersus: Record<string, number>;
    mapsVersus: Record<string, HitmanMap[]>;
    bansVersus: Record<string, HitmanMap[]>;
}

const props = withDefaults(
    defineProps<{
        groupName: string;
        players: GroupPlayer[];
        maxPointsPerMatch: number;
        matchesBetweenPlayers: number;
        advancingPlayers: number;
        positionOverrides?: Record<string, string>;
    }>(),
    {
        positionOverrides: () => ({}),
    },
);

enum ShowingStat {
    SCORE,
    MAP,
    BAN,
}

const currentlyShowing = ref(ShowingStat.SCORE);

const playerLookup = usePlayers();
await playerLookup.queryPlayers(props.players.map((p) => p.name));

const sortedPlayers = computed(() => {
    const preSort = [...props.players].sort((a, b) => b.points - a.points);

    if (props.positionOverrides !== undefined) {
        for (let i = 0; i < preSort.length; i++) {
            if (
                props.positionOverrides[i] !== undefined &&
                preSort[i].name !== props.positionOverrides[i]
            ) {
                let tmp = preSort[i];
                for (let j = 1; j < preSort.length - i; j++) {
                    if (tmp.name === props.positionOverrides[i]) {
                        break;
                    }
                    const tmp2 = preSort[i + j];
                    preSort[i + j] = tmp;
                    tmp = tmp2;
                }
                preSort[i] = tmp;
            }
        }
    }

    return preSort;
});

const maxPossiblePoints = computed(() => {
    return sortedPlayers.value.map((p) => {
        const amountMatchesRemaining =
            (props.players.length - 1) * props.matchesBetweenPlayers -
            (p.wins + p.ties + p.losses);
        const maxPossiblePoints =
            p.points + amountMatchesRemaining * props.maxPointsPerMatch;
        return maxPossiblePoints;
    });
});

function isPlayerAdvancing(index: number): boolean {
    if (
        props.positionOverrides?.[index] !== undefined &&
        index < props.advancingPlayers
    )
        return true;

    return (
        sortedPlayers.value[index].points >
        [...maxPossiblePoints.value].sort((a, b) => b - a)[
            props.advancingPlayers
        ]
    );
}
function isPlayerNotAdvancing(index: number): boolean {
    if (
        props.positionOverrides?.[index] !== undefined &&
        index >= props.advancingPlayers
    )
        return true;

    return (
        maxPossiblePoints.value[index] <
        sortedPlayers.value[props.advancingPlayers - 1].points
    );
}
function getScoreLine(
    leftPlayer: GroupPlayer,
    rightPlayer: GroupPlayer,
): string {
    if (leftPlayer.name === rightPlayer.name) {
        return "-";
    }

    if (
        leftPlayer.scoresVersus[rightPlayer.name] == null ||
        rightPlayer.scoresVersus[leftPlayer.name] == null
    ) {
        return "";
    }

    return `${leftPlayer.scoresVersus[rightPlayer.name]}-${rightPlayer.scoresVersus[leftPlayer.name]}`;
}
function getScoreColor(leftPlayer: GroupPlayer, rightPlayer: GroupPlayer) {
    if (leftPlayer.name === rightPlayer.name) {
        return { "background-color": "#333333" };
    }
    if (
        leftPlayer.scoresVersus[rightPlayer.name] == null ||
        rightPlayer.scoresVersus[leftPlayer.name] == null
    ) {
        return {};
    }
    if (
        leftPlayer.scoresVersus[rightPlayer.name] >
        rightPlayer.scoresVersus[leftPlayer.name]
    ) {
        return { "background-color": "#339436" };
    } else if (
        leftPlayer.scoresVersus[rightPlayer.name] <
        rightPlayer.scoresVersus[leftPlayer.name]
    ) {
        return { "background-color": "#b7251a" };
    }
    return { "background-color": "#d0c033" };
}
function getPickedMaps(
    leftPlayer: GroupPlayer,
    rightPlayer: GroupPlayer,
): HitmanMap[] {
    if (leftPlayer.name === rightPlayer.name) {
        return [];
    }

    return leftPlayer.mapsVersus[rightPlayer.name] ?? [];
}
function getBannedMaps(
    leftPlayer: GroupPlayer,
    rightPlayer: GroupPlayer,
): HitmanMap[] {
    if (leftPlayer.name === rightPlayer.name) {
        return [];
    }

    return leftPlayer.bansVersus[rightPlayer.name] ?? [];
}
const buttonText = computed(() => {
    switch (currentlyShowing.value) {
        case ShowingStat.SCORE:
            return "Show picked maps";
        case ShowingStat.MAP:
            return "Show scores";
        case ShowingStat.BAN:
            return "Show scores";
    }
    return "";
});
function cycleStat() {
    switch (currentlyShowing.value) {
        case ShowingStat.SCORE:
            currentlyShowing.value = ShowingStat.MAP;
            break;
        case ShowingStat.MAP:
            currentlyShowing.value = ShowingStat.SCORE;
            break;
        case ShowingStat.BAN:
            currentlyShowing.value = ShowingStat.SCORE;
            break;
    }
}
function getMapStyle(map: HitmanMap) {
    return {
        "background-color": getMap(map)!.color,
    };
}
</script>

<style scoped lang="postcss">
tr,
td {
    @apply border-neutral-600;
}
tr {
    @apply border-b;
}
td {
    @apply border-x first:border-l-0 last:border-r-0 px-1;
}
</style>
