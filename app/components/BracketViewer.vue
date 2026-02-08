<template>
    <div class="flex flex-row gap-3">
        <div
            v-for="(round, idx) in bracket.rounds"
            :key="idx"
            class="flex flex-col gap-4"
        >
            <div class="w-48 bg-white text-black h-12">
                {{ round.roundName }}
            </div>

            <div
                v-for="match in round.matches"
                :key="match.id"
                class="flex-grow flex flex-col justify-center"
            >
                <div class="w-48 h-12 bg-white text-black">
                    {{ getPlayerOne(match) }}
                    <br />
                    {{ getPlayerTwo(match) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    BracketType,
    type IBracket,
    type IBracketMatch,
} from "~~/shared/types/IBracket";

const props = defineProps<{
    // bracket: IBracket;
    matches: IMatch[];
}>();

const matchParticipantOverrides = ref<Record<number, string[]>>({});
const flippedMatches = ref<number[]>([]);

const players = usePlayers();

const bracket: IBracket = {
    name: "Bracket",
    index: 0,
    type: BracketType.SINGLE_ELIM,
    rounds: [
        {
            roundName: "Round 1",
            matches: [
                {
                    id: 7,
                    playerOne: "Some Random Person",
                    winnerTo: 3,
                    bye: true,
                },
                { id: 8, playerOne: "Joats", playerTwo: "MrMike", winnerTo: 3 },
                {
                    id: 9,
                    playerOne: "Dribbleondo",
                    playerTwo: "BernardoOne",
                    winnerTo: 4,
                },
                {
                    id: 10,
                    playerOne: "mendietinha",
                    playerTwo: "Vendetta",
                    winnerTo: 4,
                },
                { id: 11, playerOne: "JohnnyAxXx", winnerTo: 5, bye: true },
                {
                    id: 12,
                    playerOne: "Toto Le Rigolo",
                    playerTwo: "davidredsox",
                    winnerTo: 5,
                },
                {
                    id: 13,
                    playerOne: "minecraft legend",
                    playerTwo: "Redfox",
                    winnerTo: 6,
                },
                {
                    id: 14,
                    playerOne: "Frote7",
                    playerTwo: "Scroob",
                    winnerTo: 6,
                },
            ],
        },
        {
            roundName: "Round 2",
            matches: [
                { id: 3, winnerTo: 1 },
                { id: 4, winnerTo: 1 },
                { id: 5, winnerTo: 2 },
                { id: 6, winnerTo: 2 },
            ],
        },
        {
            roundName: "Round 3",
            matches: [
                { id: 1, winnerTo: 0 },
                { id: 2, winnerTo: 0 },
            ],
        },
        {
            roundName: "Round 4",
            matches: [{ id: 0 }],
        },
    ],
};

function getPlayerOne(match: IBracketMatch, allowFlip = true): string | null {
    if (flippedMatches.value.includes(match.id) && allowFlip) {
        return getPlayerTwo(match, false);
    }
    return matchParticipantOverrides.value[match.id]?.[0] ?? match.playerOne;
}

function getPlayerTwo(match: IBracketMatch, allowFlip = true): string | null {
    if (flippedMatches.value.includes(match.id) && allowFlip) {
        return getPlayerOne(match, false);
    }
    return matchParticipantOverrides.value[match.id]?.[1] ?? match.playerTwo;
}

onMounted(() => {
    for (const round of bracket.rounds) {
        for (const match of round.matches) {
            // Finding the winner of the match (if exists)
            let winner: string | null = null;

            const playedMatch = props.matches.find((m) => {
                return (
                    m.round === round.roundName &&
                    ((players.get(m.playerOne) === getPlayerOne(match) &&
                        players.get(m.playerTwo) === getPlayerTwo(match)) ||
                        (players.get(m.playerTwo) === getPlayerOne(match) &&
                            players.get(m.playerOne) === getPlayerTwo(match)))
                );
            });
            if (playedMatch != null) {
                if (
                    players.get(playedMatch.playerOne) === getPlayerTwo(match)
                ) {
                    flippedMatches.value.push(match.id);
                }

                if (playedMatch.playerOneScore > playedMatch.playerTwoScore) {
                    winner = getPlayerOne(match);
                }
                if (playedMatch.playerTwoScore > playedMatch.playerOneScore) {
                    winner = getPlayerTwo(match);
                }
            }

            if (match.bye) {
                winner = match.playerOne ?? match.playerTwo ?? null;
            }

            if (winner && match.winnerTo != null) {
                matchParticipantOverrides.value[match.winnerTo] ??= [];
                matchParticipantOverrides.value[match.winnerTo].push(winner);
            }
        }
    }
});
</script>
