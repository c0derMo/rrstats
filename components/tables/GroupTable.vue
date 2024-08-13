<template>
    <div class="w-full mt-5">
        <h1 class="my-2 font-bold">{{ groupName }}</h1>

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
                    <td class="text-left">{{ playerNames[player.name] }}</td>
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
    </div>
</template>

<script setup lang="ts">
interface GroupPlayer {
    name: string;
    wins: number;
    ties: number;
    losses: number;
    points: number;
}

const props = withDefaults(
    defineProps<{
        groupName: string;
        players: GroupPlayer[];
        maxPointsPerMatch: number;
        matchesBetweenPlayers: number;
        advancingPlayers: number;
        positionOverrides?: Record<string, string>;
        playerNames: Record<string, string>;
    }>(),
    {
        positionOverrides: () => ({}),
    },
);

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
