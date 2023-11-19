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
import { ICompetition, ICompetitionPlacement } from '~/utils/interfaces/ICompetition';
import { IMatch } from '~/utils/interfaces/IMatch';
import { IPlayer } from '~/utils/interfaces/IPlayer';
import { amountRRWins, amountRRs, averageRRPlacement, bestRRPlacement } from '~/utils/statCalculators/competitionStatCalculators';
import { mapWinrate, mapsPlayed } from '~/utils/statCalculators/mapStatCalculators';
import { calculateWTL, calculateWinrate } from '~/utils/statCalculators/matchStatCalculators';

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
    },
    'competitions': {
        type: Array<ICompetition>,
        required: true
    }
});

function getWinrate(player: string, matches: IMatch[]): number {
    return calculateWinrate(matches, player);
}

function getMapWinrate(player: string, matches: IMatch[]): number {
    return mapWinrate(matches, player);
}

function getMatchesPlayed(player: string, matches: IMatch[]): number {
    return matches.length;
}

function getMapsPlayed(player: string, matches: IMatch[]): number {
    return mapsPlayed(matches).length;
}

function getWTL(player: string, matches: IMatch[]): string {
    const wtl = calculateWTL(matches, player);

    return `${wtl.w}-${wtl.t}-${wtl.l}`;
}

function getRRAmount(player: string, matches: IMatch[]): number {
    return amountRRs(matches);
}

function getRRWins(player: string, matches: IMatch[], placements: ICompetitionPlacement[]): number {
    return amountRRWins(placements, props.competitions);
}

function getBestRRPlacement(player: string, matches: IMatch[], placements: ICompetitionPlacement[]): number {
    return bestRRPlacement(placements, props.competitions) ?? Number.MAX_SAFE_INTEGER;
}

function getAverageRRPlacement(player: string, matches: IMatch[], placements: ICompetitionPlacement[]): number {
    return averageRRPlacement(placements, props.competitions) ?? Number.MAX_SAFE_INTEGER;
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