<template>
    <div class="w-52 h-12">
        <div
            v-if="showMatch(match)"
            class="bg-slate-700 text-sm rounded-sm match-grid border border-gray-900"
        >
            <div class="pl-1 min-h-5 text-ellipsis">
                {{ match.playerOne }}
            </div>
            <div
                class="text-right pr-2 bg-slate-800 border-l border-gray-500"
                :style="{ color: leftPlayerScoreColor }"
            >
                {{ leftPlayerScore }}
            </div>
            <div class="border-b border-gray-500 col-span-2" />
            <div class="pl-1 min-h-5 text-ellipsis">
                {{ match.playerTwo }}
            </div>
            <div
                class="text-right pr-2 bg-slate-800 border-l border-gray-500"
                :style="{ color: rightPlayerScoreColor }"
            >
                {{ rightPlayerScore }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.match-grid {
    display: grid;
    grid-template-columns: auto 2rem;
}
</style>

<script setup lang="ts">
interface LocalBracketMatch extends IBracketMatch {
    roundName: string;
    playedMatch?: IMatch;
    winner?: string;
    loser?: string;
}

const props = defineProps<{
    match?: LocalBracketMatch;
    forfeit?: string;
}>();

function showMatch(match?: LocalBracketMatch): match is LocalBracketMatch {
    return (
        match != null &&
        !match.bye &&
        (match.playerOne != null || match.playerOneFrom != null) &&
        (match.playerTwo != null || match.playerTwoFrom != null)
    );
}

const leftPlayerScore = computed(() => {
    if (props.forfeit === props.match?.playerOne) {
        return "";
    } else if (
        props.forfeit === props.match?.playerTwo &&
        props.match?.playerTwo != null
    ) {
        return "FF";
    }
    return props.match?.playedMatch?.playerOneScore;
});

const rightPlayerScore = computed(() => {
    if (props.forfeit === props.match?.playerTwo) {
        return "";
    } else if (
        props.forfeit === props.match?.playerOne &&
        props.match?.playerOne != null
    ) {
        return "FF";
    }
    return props.match?.playedMatch?.playerTwoScore;
});

const leftPlayerScoreColor = computed(() => {
    if (props.forfeit === props.match?.playerTwo) {
        return "#aaaaaa";
    }
    if (props.match?.winner === props.match?.playerOne) {
        return "#339436";
    }
    if (props.match?.winner === props.match?.playerTwo) {
        return "#b7251a";
    }
    return "#d0c033";
});

const rightPlayerScoreColor = computed(() => {
    if (props.forfeit === props.match?.playerOne) {
        return "#aaaaaa";
    }
    if (props.match?.winner === props.match?.playerTwo) {
        return "#339436";
    }
    if (props.match?.winner === props.match?.playerOne) {
        return "#b7251a";
    }
    return "#d0c033";
});
</script>
