<template>
    <DataTableComponent :headers="headers" :rows="rows" :always-sort="true">
        <template #wtl="{ value }">
            <span class="whitespace-nowrap">{{ value }}</span>
        </template>
    </DataTableComponent>
</template>

<script setup lang="ts">
import type { IMatch } from "~/utils/interfaces/IMatch";
import MatchCollection from "~/utils/playerStatistics/MatchCollection";

const props = defineProps({
    matches: {
        type: Object as PropType<IMatch[]>,
        required: true,
    },
    localPlayer: {
        type: String,
        required: true,
    },
    opponents: {
        type: Object as PropType<Record<string, string>>,
        required: true,
    },
});

const headers = [
    { key: "Opponent", title: "Opponent", disableSort: true },
    { key: "Matches", title: "Matches" },
    {
        key: "wtl",
        title: "W-T-L",
        sort: (a: unknown, b: unknown) => {
            const aSplit = (a as string).split("-").map((m) => parseInt(m));
            const bSplit = (b as string).split("-").map((m) => parseInt(m));
            const aScore = aSplit[0] + aSplit[1] / 2;
            const bScore = bSplit[0] + bSplit[1] / 2;
            const aMatches = aSplit[0] + aSplit[1] + aSplit[2];
            const bMatches = bSplit[0] + bSplit[1] + bSplit[2];
            return aScore / aMatches - bScore / bMatches;
        },
    },
];

const rows = computed(() => {
    const matches: Record<string, IMatch[]> = {};

    for (const match of props.matches) {
        const opponent =
            match.playerOne === props.localPlayer
                ? match.playerTwo
                : match.playerOne;

        if (matches[opponent] === undefined) {
            matches[opponent] = [];
        }

        matches[opponent].push(match);
    }

    const result = [];
    for (const opponent of Object.keys(matches)) {
        const collection = new MatchCollection(
            matches[opponent],
            props.localPlayer,
        );
        const wtl = collection.wtl();
        result.push({
            Opponent: props.opponents[opponent],
            Matches: wtl.w + wtl.t + wtl.l,
            wtl: `${wtl.w}-${wtl.t}-${wtl.l}`,
        });
    }
    return result;
});
</script>
