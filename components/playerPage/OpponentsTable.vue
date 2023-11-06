<template>
    <TableComponent :headers="['Opponent', 'Matches', 'W-T-L']" :rows="rows" />
</template>

<script setup lang="ts">
import { IMatch } from '~/utils/interfaces/IMatch';

const props = defineProps({
    "matches": {
        type: Object as PropType<IMatch[]>,
        required: true
    },
    "localPlayer": {
        type: String,
        required: true
    },
    "opponents": {
        type: Object as PropType<Record<string, string>>,
        required: true
    }
});

const rows = computed(() => {
    const opponents: Record<string, { w: number, t: number, l: number }> = {};

    for (const match of props.matches) {
        const opponent = match.playerOne === props.localPlayer ? match.playerTwo : match.playerOne;
        if (opponents[opponent] === undefined) {
            opponents[opponent] = { w: 0, t: 0, l: 0 };
        }

        if (match.playerOne === props.localPlayer && match.playerOneScore > match.playerTwoScore || match.playerTwo === props.localPlayer && match.playerTwoScore > match.playerOneScore) {
            opponents[opponent].w += 1;
        } else if (match.playerOneScore === match.playerTwoScore) {
            opponents[opponent].t = 1;
        } else {
            opponents[opponent].l = 1;
        }
    }

    const result = [];
    for (const opponent of Object.keys(opponents)) {
        const wtl = opponents[opponent];
        result.push({
            'Opponent': props.opponents[opponent],
            'Matches': wtl.w + wtl.t + wtl.l,
            'W-T-L': `${wtl.w}-${wtl.t}-${wtl.l}`
        });
    }
    return result;
});
</script>