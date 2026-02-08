<template>
    <div class="flex flex-col gap-5">
        <div
            v-for="(stage, stageIdx) in bracket.rounds"
            :key="stageIdx"
            class="flex flex-row gap-6"
        >
            <div
                v-for="(round, idx) in stage"
                :key="idx"
                class="flex flex-col gap-4"
            >
                <div
                    class="w-64 bg-slate-100 dark:bg-gray-800 rounded-md text-center font-semibold"
                >
                    {{ round.roundName }}
                </div>

                <div
                    v-for="match in round.matches"
                    :key="match.id"
                    class="flex flex-col justify-center"
                    :class="{ 'flex-grow': bracket.advancementBracket }"
                >
                    <BracketMatch
                        :match="getLocalMatchById(match.id) ?? undefined"
                        :forfeit="bracket.forfeits[match.id]"
                    />
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

const players = usePlayers();

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
                ((players.get(m.playerOne) === getPlayerOne(match) &&
                    players.get(m.playerTwo) === getPlayerTwo(match)) ||
                    (players.get(m.playerTwo) === getPlayerOne(match) &&
                        players.get(m.playerOne) === getPlayerTwo(match)))
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

            if (players.get(playedMatch.playerOne) === getPlayerTwo(match)) {
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
