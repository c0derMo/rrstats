<template>
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
        />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    groupsInfo: IGroupSettings;
    matches: IMatch[];
}>();

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
                scoresVersus: {} as Record<string, number>,
                mapsVersus: {} as Record<string, HitmanMap[]>,
                bansVersus: {} as Record<string, HitmanMap[]>,
            };

            for (const opponent of group.players) {
                if (opponent === player) continue;

                for (
                    let matchNo = 0;
                    matchNo < props.groupsInfo.matchesBetweenPlayers;
                    matchNo++
                ) {
                    const statsAgainst = getStatsAgainst(
                        player,
                        opponent,
                        matchNo,
                    );

                    if (statsAgainst === undefined) continue;
                    if (statsAgainst.points < pointsNeededToWin) {
                        playerObject.losses++;
                    }
                    if (statsAgainst.points === pointsNeededToWin) {
                        playerObject.ties++;
                    }
                    if (statsAgainst.points > pointsNeededToWin) {
                        playerObject.wins++;
                    }
                    playerObject.points += statsAgainst.points;

                    playerObject.scoresVersus[opponent] ??= 0;
                    playerObject.scoresVersus[opponent] += statsAgainst.points;
                    playerObject.mapsVersus[opponent] ??= [];
                    playerObject.mapsVersus[opponent].push(
                        ...statsAgainst.playedMaps,
                    );
                    playerObject.bansVersus[opponent] ??= [];
                    playerObject.bansVersus[opponent].push(
                        ...statsAgainst.bannedMaps,
                    );
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

function getStatsAgainst(
    player: string,
    opponent: string,
    matchNumber: number = 0,
):
    | { points: number; playedMaps: HitmanMap[]; bannedMaps: HitmanMap[] }
    | undefined {
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
        return {
            points: match.playerOneScore,
            playedMaps: match.playedMaps
                .filter((map) => map.picked === ChoosingPlayer.PLAYER_ONE)
                .map((map) => map.map),
            bannedMaps: match.bannedMaps
                .filter((map) => map.picked === ChoosingPlayer.PLAYER_ONE)
                .map((map) => map.map),
        };
    } else {
        return {
            points: match.playerTwoScore,
            playedMaps: match.playedMaps
                .filter((map) => map.picked === ChoosingPlayer.PLAYER_TWO)
                .map((map) => map.map),
            bannedMaps: match.bannedMaps
                .filter((map) => map.picked === ChoosingPlayer.PLAYER_TWO)
                .map((map) => map.map),
        };
    }
}
</script>
