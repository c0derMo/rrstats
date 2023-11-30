<template>
    <AccordionComponent>
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

                const pointsAgainst = getPointsAgainst(player, opponent);
                if (pointsAgainst === undefined) continue;
                if (pointsAgainst < 3) {
                    playerObject.losses++;
                }
                if (pointsAgainst === 3) {
                    playerObject.ties++;
                }
                if (pointsAgainst > 3) {
                    playerObject.wins++;
                }
                playerObject.points += pointsAgainst;
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
): number | undefined {
    const match = props.matches.find(
        (m) =>
            [player, opponent].includes(m.playerOne) &&
            [player, opponent].includes(m.playerTwo),
    );
    if (match === undefined) {
        return undefined;
    }

    if (match.playerOne === player) {
        return match.playerOneScore;
    } else {
        return match.playerTwoScore;
    }
}
</script>
