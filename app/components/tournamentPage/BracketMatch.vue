<template>
    <div class="w-52 h-12">
        <MatchDetailsDialog
            v-if="showingMatch != null"
            :match="showingMatch"
            @click-outside="showingMatch = null"
        />
        <div
            v-if="showMatch(match)"
            class="bg-slate-700 text-sm rounded-sm match-grid border border-gray-900 select-text cursor-auto h-12"
            :class="{
                'cursor-pointer': match.playedMatch != null,
            }"
            @click="showingMatch = match.playedMatch ?? null"
            @mousedown.stop
            @mouseup.stop
        >
            <div
                class="pl-1 min-h-5 text-ellipsis transition-colors"
                :class="{
                    'bg-slate-900': hovering === match.playerOne,
                }"
                @mouseenter="emitHover(match.playerOne)"
                @mouseleave="emitHover('')"
            >
                {{
                    match.playerOne != null
                        ? players.get(match.playerOne, match.playerOne)
                        : ""
                }}
            </div>
            <div class="row-span-3">
                <BracketMatchScore
                    :maps="match.playedMatch?.playedMaps"
                    :player-one="match.playedMatch?.playerOne"
                    :player-two="match.playedMatch?.playerTwo"
                    class="h-full"
                >
                    <div class="flex flex-col h-full">
                        <div
                            class="text-right pr-2 bg-slate-800 border-l border-gray-500 h-1/2"
                            :style="{ color: leftPlayerScoreColor }"
                        >
                            {{ leftPlayerScore }}
                        </div>
                        <div class="border-b border-gray-500" />
                        <div
                            class="text-right pr-2 bg-slate-800 border-l border-gray-500 h-1/2"
                            :style="{ color: rightPlayerScoreColor }"
                        >
                            {{ rightPlayerScore }}
                        </div>
                    </div>
                </BracketMatchScore>
            </div>
            <div class="border-b border-gray-500" />
            <div
                class="pl-1 min-h-5 text-ellipsis transition-colors"
                :class="{
                    'bg-slate-900': hovering === match.playerTwo,
                }"
                @mouseenter="emitHover(match.playerTwo)"
                @mouseleave="emitHover('')"
            >
                {{
                    match.playerTwo != null
                        ? players.get(match.playerTwo, match.playerTwo)
                        : ""
                }}
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
    hovering?: string;
}>();
const emit = defineEmits<{
    hoveringPlayer: [player: string];
}>();

const showingMatch = ref<IMatch | null>(null);
const players = usePlayers();

function emitHover(player?: string) {
    if (player != null) {
        emit("hoveringPlayer", player);
    }
}

function showMatch(match?: LocalBracketMatch): match is LocalBracketMatch {
    return (
        match != null &&
        !match.bye &&
        (match.playerOne != null || match.playerOneFrom != null) &&
        (match.playerTwo != null || match.playerTwoFrom != null)
    );
}

const leftPlayerScore = computed(() => {
    if (
        props.forfeit === props.match?.playerOne &&
        props.match?.playerOne != null
    ) {
        return "W";
    } else if (
        props.forfeit === props.match?.playerTwo &&
        props.match?.playerTwo != null
    ) {
        return "FF";
    }
    return props.match?.playedMatch?.playerOneScore;
});

const rightPlayerScore = computed(() => {
    if (
        props.forfeit === props.match?.playerTwo &&
        props.match?.playerTwo != null
    ) {
        return "W";
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
