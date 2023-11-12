<template>
    <CardComponent>
        <div class="flex" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
            <div class="flex-grow flex" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                <img class="rounded-full w-20 h-20" :src="playerAvatar" alt="Player Profile Picture"/>
                <div class="flex-grow mx-5" :class="{ 'text-right': reverse }">
                    <h1 class="text-5xl">{{ player.primaryName }}</h1>
                    <h3 :class="{ 'italic': player.hasCustomTitle }" class="mt-1">{{ player.accolade }}</h3>
                </div>
            </div>


            <div class="flex flex-col text-2xl" :class="{ 'text-right': !reverse}">

                <div class="flex gap-3" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                    <span class="flex-grow font-light">Winrate</span>
                    <span :class="getAheadBehindClass(getWinrate)">
                        {{ Math.round( getWinrate(player.uuid, playerMatches) * 100) }}%
                    </span>
                </div>

                <div class="flex gap-3" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                    <span class="flex-grow font-light">Map-Winrate</span>
                    <span :class="getAheadBehindClass(getMapWinrate)">
                        {{ Math.round( getMapWinrate(player.uuid, playerMatches) * 100) }}%
                    </span>
                </div>
                
                <br />

                <div class="flex gap-3" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                    <span class="flex-grow font-light">Matches played</span>
                    <span :class="getAheadBehindClass(getMatchesPlayed)">
                        {{ getMatchesPlayed(player.uuid, playerMatches) }}
                    </span>
                </div>

                <div class="flex gap-3" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                    <span class="flex-grow font-light">Maps played</span>
                    <span :class="getAheadBehindClass(getMapsPlayed)">
                        {{ getMapsPlayed(player.uuid, playerMatches) }}
                    </span>
                </div>

                <div class="flex gap-5" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                    <span class="flex-grow font-light">W-T-L</span>
                    <span>
                        {{ getWTL(player.uuid, playerMatches) }}
                    </span>
                </div>

                <br />

                <div class="flex gap-3" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                    <span class="flex-grow font-light">RRs played</span>
                    <span :class="getAheadBehindClass(getRRAmount)">
                        {{ getRRAmount(player.uuid, playerMatches) }}
                    </span>
                </div>

                <div class="flex gap-3" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                    <span class="flex-grow font-light">RRs won</span>
                    <span :class="getAheadBehindClass(getRRWins)">
                        {{ getRRWins(player.uuid, playerMatches, playerPlacements) }}
                    </span>
                </div>

                <div class="flex gap-3" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                    <span class="flex-grow font-light">Best RR placement</span>
                    <span :class="getAheadBehindClass(getBestRRPlacement, true)">
                        {{ getBestRRPlacement(player.uuid, playerMatches, playerPlacements) === Number.MAX_SAFE_INTEGER ? "n/a" : getBestRRPlacement(player.uuid, playerMatches, playerPlacements) }}
                    </span>
                </div>

                <div class="flex gap-3" :class="{ 'flex-row': !reverse, 'flex-row-reverse': reverse }">
                    <span class="flex-grow font-light">Average RR placement</span>
                    <span :class="getAheadBehindClass(getAverageRRPlacement, true)">
                        {{ getAverageRRPlacement(player.uuid, playerMatches, playerPlacements) === Number.MAX_SAFE_INTEGER ? "n/a" : Math.round(getAverageRRPlacement(player.uuid, playerMatches, playerPlacements)) }}
                    </span>
                </div>
            </div>
        </div>
    </CardComponent>
</template>

<script setup lang="ts">
import { ICompetitionPlacement } from '~/utils/interfaces/ICompetition';
import { IMatch, WinningPlayer } from '~/utils/interfaces/IMatch';
import { IPlayer } from '~/utils/interfaces/IPlayer';

const props = defineProps({
    'player': {
        type: Object as PropType<IPlayer>,
        required: true,
    },
    'playerMatches': {
        type: Array<IMatch>,
        required: true,
    },
    'playerAvatar': {
        type: String,
        required: true
    },
    'playerPlacements': {
        type: Array<ICompetitionPlacement>,
        required: true,
    },
    'comparingPlayer': {
        type: String,
        required: false
    },
    'comparingMatches': {
        type: Array<IMatch>,
        required: false,
    },
    'comparingPlacements': {
        type: Array<ICompetitionPlacement>,
        required: false
    },
    'reverse': {
        type: Boolean,
        default: false,
    }
});

function getWinrate(player: string, matches: IMatch[]): number {
    const wins = matches.filter(m => {
        return (m.playerOne === player && m.playerOneScore > m.playerTwoScore) || (m.playerTwo === player && m.playerTwoScore > m.playerOneScore)
    }).length;
    const ties = matches.filter(m => {
        return (m.playerOneScore === m.playerTwoScore);
    }).length / 2;
    return (wins + ties) / matches.length;
}

function getMapWinrate(player: string, matches: IMatch[]): number {
    let maps = 0;
    let wins = 0;
    for (const match of matches) {
        maps += match.playedMaps.length;
        wins += match.playedMaps.filter((m) => {
            return (match.playerOne === player && m.winner === WinningPlayer.PLAYER_ONE) ||
            (match.playerTwo === player && m.winner === WinningPlayer.PLAYER_TWO)
        }).length;
        wins += match.playedMaps.filter((m) => m.winner === WinningPlayer.DRAW).length / 2;
    }
    return wins / maps;
}

function getMatchesPlayed(player: string, matches: IMatch[]): number {
    return matches.length;
}

function getMapsPlayed(player: string, matches: IMatch[]): number {
    return matches.map(m => m.playedMaps.length).reduce((prev, cur) => prev + cur);
}

function getWTL(player: string, matches: IMatch[]): string {
    let w = 0;
    let t = 0;
    let l = 0;
    for (const match of matches) {
        if (match.playerOne === player && match.playerOneScore > match.playerTwoScore || match.playerTwo === player && match.playerTwoScore > match.playerOneScore) {
            w++;
        } else if (match.playerOneScore === match.playerTwoScore) {
            t++;
        } else {
            l++;
        }
    }
    return `${w}-${t}-${l}`
}

function getRRAmount(player: string, matches: IMatch[]): number {
    const rrs = new Set<string>();
    for (const match of matches) {
        rrs.add(match.competition);
    }
    return rrs.size;
}

function getRRWins(player: string, matches: IMatch[], placements: ICompetitionPlacement[]): number {
    let wins = 0;
    for (const placement of placements) {
        if (placement.placement === 1) {
            wins++;
        }
    }
    return wins;
}

function getBestRRPlacement(player: string, matches: IMatch[], placements: ICompetitionPlacement[]): number {
    let bestFinish = Number.MAX_SAFE_INTEGER;
    for (const placement of placements) {
        if (placement.placement != null && placement.placement < bestFinish) {
            bestFinish = placement.placement;
        }
    }
    return bestFinish;
}

function getAverageRRPlacement(player: string, matches: IMatch[], placements: ICompetitionPlacement[]): number {
    let average = 0;
    let numOfPlacements = 0;
    for (const placement of placements) {
        if (placement.placement != null) {
            average += placement.placement;
            numOfPlacements++;
        }
    }
    if (numOfPlacements === 0) {
        return Number.MAX_SAFE_INTEGER;
    }
    return average / numOfPlacements;
}

function isAhead(f: (player: string, matches: IMatch[], placements: ICompetitionPlacement[]) => number): boolean {
    if (props.comparingPlayer == null || props.comparingMatches == null || props.comparingPlacements == null) {
        return false;
    }
    return f(props.player.uuid, props.playerMatches, props.playerPlacements) > f(props.comparingPlayer, props.comparingMatches, props.comparingPlacements);
}

function isBehind(f: (player: string, matches: IMatch[], placements: ICompetitionPlacement[]) => number): boolean {
    if (props.comparingPlayer == null || props.comparingMatches == null || props.comparingPlacements == null) {
        return false;
    }
    return f(props.player.uuid, props.playerMatches, props.playerPlacements) < f(props.comparingPlayer, props.comparingMatches, props.comparingPlacements);
}

function getAheadBehindClass(f: (player: string, matches: IMatch[], placements: ICompetitionPlacement[]) => number, reverse = false): string {
    if (isAhead(f) && !reverse || isBehind(f) && reverse) {
        return "ahead";
    }
    if (isBehind(f) && !reverse || isAhead(f) && reverse) {
        return "behind";
    }
    return "";
}
</script>

<style scoped lang="postcss">
.ahead {
    @apply text-green-500;
}
.behind {
    @apply text-red-500;
}
</style>