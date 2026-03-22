<template>
    <div class="flex flex-col gap-5">
        <div
            v-for="(stage, stageIdx) in bracket.rounds"
            :key="stageIdx"
            class="flex flex-row gap-6 overflow-x-auto select-none cursor-grab"
            :class="{
                'cursor-grabbing': draggingData != null,
            }"
            @mousedown="startDrag"
            @mouseup="stopDrag"
            @mousemove="drag"
        >
            <div
                v-for="(round, idx) in stage"
                :key="idx"
                class="flex flex-col gap-1"
            >
                <div
                    class="w-52 bg-slate-100 dark:bg-gray-800 rounded-md text-center font-semibold"
                >
                    {{ round.roundName }}
                </div>

                <div
                    v-for="(match, mIdx) in round.matches"
                    :key="match.id"
                    class="flex flex-col justify-center"
                    :class="{ 'flex-grow': bracket.advancementBracket }"
                >
                    <div class="flex flex-row h-full items-center">
                        <BracketMatch
                            :match="getLocalMatchById(match.id) ?? undefined"
                            :forfeit="bracket.forfeits[match.id]"
                            :hovering="hoveringPlayer"
                            @hovering-player="(e) => (hoveringPlayer = e)"
                        />

                        <div
                            v-if="
                                bracket.advancementBracket &&
                                showMatch(match) &&
                                stage[idx + 1] != null
                            "
                            class="w-3 h-1/2 relative left-3"
                            :class="{
                                'border-r':
                                    stage[idx + 1].matches.length <
                                    stage[idx].matches.length,
                                'border-t top-1/4': mIdx % 2 == 0,
                                'border-b bottom-1/4': mIdx % 2 == 1,
                            }"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface LocalBracketMatch extends IBracketMatch {
    roundName: string;
    playedMatch?: IMatch;
    winner?: string;
    loser?: string;
}

const props = defineProps<{
    bracket: IBracket;
    matches: IMatch[];
}>();

const localMatches = ref<Record<string, LocalBracketMatch>>({});
const draggingData = ref<{
    element: HTMLElement;
    mouseX: number;
    mouseY: number;
    elemX: number;
    elemY: number;
} | null>(null);
const hoveringPlayer = ref("");

function startDrag(e: MouseEvent) {
    console.log("Mouse down");
    console.log(e.target);
    const element = (e.target as HTMLElement).closest(
        ".overflow-x-auto",
    ) as HTMLElement;
    if (element == null) {
        return;
    }
    draggingData.value = {
        element,
        mouseX: e.clientX,
        mouseY: e.clientY,
        elemX: element.scrollLeft,
        elemY: window.scrollY,
    };
}

function stopDrag() {
    draggingData.value = null;
}

function drag(e: MouseEvent) {
    if (draggingData.value == null) {
        return;
    }

    const element = draggingData.value.element;
    element.scrollTo({
        left: draggingData.value.elemX - e.clientX + draggingData.value.mouseX,
        behavior: "smooth",
    });
    window.scrollTo({
        top: draggingData.value.elemY - e.clientY + draggingData.value.mouseY,
        behavior: "smooth",
    });
}

function showMatch(match?: IBracketMatch): boolean {
    return (
        match != null &&
        !match.bye &&
        (match.playerOne != null || match.playerOneFrom != null) &&
        (match.playerTwo != null || match.playerTwoFrom != null)
    );
}

function getPlayerOne(match: LocalBracketMatch): string | null {
    return match.playerOne ?? null;
}

function getPlayerTwo(match: LocalBracketMatch): string | null {
    return match.playerTwo ?? null;
}

function getLocalMatchById(id: string): LocalBracketMatch | null {
    return localMatches.value[id] ?? null;
}

function findPlayedMatch(match: LocalBracketMatch): IMatch | null {
    return (
        props.matches.find((m) => {
            return (
                m.round === match.roundName &&
                ((m.playerOne === getPlayerOne(match) &&
                    m.playerTwo === getPlayerTwo(match)) ||
                    (m.playerTwo === getPlayerOne(match) &&
                        m.playerOne === getPlayerTwo(match)))
            );
        }) ?? null
    );
}

function resolveSingleMatch(
    match: LocalBracketMatch,
    unresolved: string[],
    forfeits: Record<string, string>,
): string[] {
    if (match.playerOneFrom != null && getPlayerOne(match) == null) {
        // Try to resolve player one
        if (
            unresolved.includes(match.playerOneFrom.matchId) &&
            getLocalMatchById(match.playerOneFrom.matchId) != null
        ) {
            unresolved = resolveSingleMatch(
                getLocalMatchById(match.playerOneFrom.matchId)!,
                unresolved,
                forfeits,
            );
        }

        const resolvedMatch = getLocalMatchById(match.playerOneFrom.matchId)!;
        if (match.playerOneFrom.winner) {
            match.playerOne = resolvedMatch.winner;
        } else {
            match.playerOne = resolvedMatch.loser;
        }
    }

    if (match.playerTwoFrom != null && getPlayerTwo(match) == null) {
        // Try to resolve player two
        if (
            unresolved.includes(match.playerTwoFrom.matchId) &&
            getLocalMatchById(match.playerTwoFrom.matchId) != null
        ) {
            unresolved = resolveSingleMatch(
                getLocalMatchById(match.playerTwoFrom.matchId)!,
                unresolved,
                forfeits,
            );
        }

        const resolvedMatch = getLocalMatchById(match.playerTwoFrom.matchId)!;
        if (match.playerTwoFrom.winner) {
            match.playerTwo = resolvedMatch.winner;
        } else {
            match.playerTwo = resolvedMatch.loser;
        }
    }

    if (getPlayerOne(match) != null && getPlayerTwo(match) != null) {
        // Attempt to resolve own match
        const playedMatch = findPlayedMatch(match);
        if (playedMatch != null) {
            let winner: string | null = null;
            let loser: string | null = null;

            if (playedMatch.playerOne === getPlayerTwo(match)) {
                const tmp = match.playerOne;
                match.playerOne = match.playerTwo;
                match.playerTwo = tmp;
            }

            if (playedMatch.playerOneScore > playedMatch.playerTwoScore) {
                winner = getPlayerOne(match);
                loser = getPlayerTwo(match);
            }
            if (playedMatch.playerTwoScore > playedMatch.playerOneScore) {
                winner = getPlayerTwo(match);
                loser = getPlayerOne(match);
            }

            match.playedMatch = playedMatch;
            match.winner = winner ?? undefined;
            match.loser = loser ?? undefined;
        }
    }

    if (match.bye) {
        // Resolve bye
        match.winner = getPlayerOne(match) ?? undefined;
    }

    if (forfeits[match.id] != null) {
        if (forfeits[match.id] === getPlayerOne(match)) {
            match.winner = getPlayerOne(match) ?? undefined;
            match.loser = getPlayerTwo(match) ?? undefined;
        } else {
            match.winner = getPlayerTwo(match) ?? undefined;
            match.loser = getPlayerOne(match) ?? undefined;
        }
    }

    localMatches.value[match.id] = match;
    unresolved = unresolved.filter((m) => m !== match.id);

    return unresolved;
}

function resolveAllMatches() {
    for (const stage of props.bracket.rounds) {
        for (const round of stage) {
            for (const match of round.matches) {
                localMatches.value[match.id] = {
                    ...match,
                    roundName: round.roundName,
                };
            }
        }
    }

    let unresolvedMatches = props.bracket.rounds.flatMap((stage) =>
        stage.flatMap((stage) => stage.matches.map((match) => match.id)),
    );
    while (unresolvedMatches.length > 0) {
        const randomIndex = Math.floor(
            Math.random() * unresolvedMatches.length,
        );
        const matchToResolve = getLocalMatchById(
            unresolvedMatches[randomIndex],
        )!;
        unresolvedMatches = resolveSingleMatch(
            matchToResolve,
            unresolvedMatches,
            props.bracket.forfeits,
        );
    }
}

onMounted(() => {
    resolveAllMatches();
});
</script>
