<template>
    <AccordionComponent class="!bg-opacity-50">
        <template #title> Groups </template>

        <div class="grid grid-cols-3 gap-5">
            <GroupTable
                v-for="(group, idx) of groups"
                :key="idx"
                :group-name="group.name"
                :advancing-players="group.advancingPlayers"
                :matches-between-players="groupsInfo.matchesBetweenPlayers"
                :max-points-per-match="groupsInfo.maxPointsPerMatch"
                :players="group.players"
                :position-overrides="group.positionOverrides"
                :player-names="players"
            />
        </div>
    </AccordionComponent>
</template>

<script setup lang="ts">
import { IGroupSettings } from "~/utils/interfaces/ICompetition";
import { IMatch } from "~/utils/interfaces/IMatch";

const props = defineProps({
    groupsInfo: {
        type: Object as PropType<IGroupSettings>,
        required: true,
    },
    matches: {
        type: Array<IMatch>,
        required: true,
    },
    players: {
        type: Object as PropType<Record<string, string>>,
        required: true,
    },
});

const groups = computed(() => {
    const result = [];
    const pointsNeededToWin = props.groupsInfo.maxPointsPerMatch / 2;
    for (const group of props.groupsInfo.groups) {
        const players = [];

        for (const player of group.players) {
            const playerObject = {
                name: player,
                wins: 0,
                ties: 0,
                losses: 0,
                points: 0,
            };

            for (const opponent of group.players) {
                if (opponent === player) continue;

                for (
                    let matchNo = 0;
                    matchNo < props.groupsInfo.matchesBetweenPlayers;
                    matchNo++
                ) {
                    const pointsAgainst = getPointsAgainst(
                        player,
                        opponent,
                        matchNo,
                    );

                    if (pointsAgainst === undefined) continue;
                    if (pointsAgainst < pointsNeededToWin) {
                        playerObject.losses++;
                    }
                    if (pointsAgainst === pointsNeededToWin) {
                        playerObject.ties++;
                    }
                    if (pointsAgainst > pointsNeededToWin) {
                        playerObject.wins++;
                    }
                    playerObject.points += pointsAgainst;
                }
            }

            players.push(playerObject);
        }

        result.push({
            players,
            advancingPlayers: group.advancingPlayers,
            name: group.groupName,
            positionOverrides: group.positionOverrides,
        });
    }

    return result;
});

function getPointsAgainst(
    player: string,
    opponent: string,
    matchNumber: number = 0,
): number | undefined {
    const matches = props.matches
        .filter(
            (m) =>
                [player, opponent].includes(m.playerOne) &&
                [player, opponent].includes(m.playerTwo) &&
                !m.annulated,
        )
        .sort((a, b) => {
            return a.timestamp - b.timestamp;
        });

    if (matches.length === 0) {
        return undefined;
    }

    let match: IMatch;
    if (matches.length > matchNumber) {
        match = matches[matchNumber];
    } else {
        return undefined;
    }

    if (match.playerOne === player) {
        return match.playerOneScore;
    } else {
        return match.playerTwoScore;
    }
}
</script>
