<template>
    <CardComponent>
        <div
            class="flex flex-col"
            :class="{ 'xl:flex-row': !reverse, 'xl:flex-row-reverse': reverse }"
        >
            <div
                class="flex-grow flex flex-col"
                :class="{
                    'md:flex-row': !reverse,
                    'md:flex-row-reverse': reverse,
                }"
            >
                <img
                    class="rounded-full w-20 h-20"
                    :src="playerAvatar"
                    alt="Player Avatar"
                />
                <div class="flex-grow mx-5" :class="{ 'text-right': reverse }">
                    <h1 class="text-5xl">{{ player.primaryName }}</h1>
                    <h3 :class="{ italic: player.hasCustomTitle }" class="mt-1">
                        {{ player.accolade }}
                    </h3>
                </div>
            </div>

            <div
                class="flex flex-col text-2xl"
                :class="{ 'text-right': !reverse }"
            >
                <div
                    class="flex gap-3"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">Winrate</span>
                    <span :class="getAheadBehindClass(getWinrate)">
                        {{ Math.round(getWinrate(Player.SELF) * 100) }}%
                    </span>
                </div>

                <div
                    class="flex gap-3"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">Map-Winrate</span>
                    <span :class="getAheadBehindClass(getMapWinrate)">
                        {{ Math.round(getMapWinrate(Player.SELF) * 100) }}%
                    </span>
                </div>

                <div
                    class="flex gap-3"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">Matches played</span>
                    <span :class="getAheadBehindClass(getMatchesPlayed)">
                        {{ getMatchesPlayed(Player.SELF) }}
                    </span>
                </div>

                <div
                    class="flex gap-3"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">Maps played</span>
                    <span :class="getAheadBehindClass(getMapsPlayed)">
                        {{ getMapsPlayed(Player.SELF) }}
                    </span>
                </div>

                <div
                    class="flex gap-5"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">W-T-L</span>
                    <span>
                        {{ getWTL(Player.SELF) }}
                    </span>
                </div>

                <div
                    class="flex gap-5"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">Head-2-Head</span>
                    <span :class="getAheadBehindClass(getH2HWR)">
                        {{ getH2H(Player.SELF) }}
                    </span>
                </div>

                <div
                    class="flex gap-5"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">Elo Rating</span>
                    <span :class="getAheadBehindClass(getElo)">
                        {{ getElo(Player.SELF) }}
                    </span>
                </div>

                <div
                    class="flex gap-3"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">RRs played</span>
                    <span :class="getAheadBehindClass(getRRAmount)">
                        {{ getRRAmount(Player.SELF) }}
                    </span>
                </div>

                <div
                    class="flex gap-3"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">RRs won</span>
                    <span :class="getAheadBehindClass(getRRWins)">
                        {{ getRRWins(Player.SELF) }}
                    </span>
                </div>

                <div
                    class="flex gap-3"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light">Best RR placement</span>
                    <span
                        :class="getAheadBehindClass(getBestRRPlacement, true)"
                    >
                        {{
                            getBestRRPlacement(Player.SELF) ===
                            Number.MAX_SAFE_INTEGER
                                ? "n/a"
                                : getBestRRPlacement(Player.SELF)
                        }}
                    </span>
                </div>

                <div
                    class="flex gap-3"
                    :class="{
                        'flex-row': !reverse,
                        'flex-row-reverse': reverse,
                    }"
                >
                    <span class="flex-grow font-light"
                        >Average RR placement</span
                    >
                    <span
                        :class="
                            getAheadBehindClass(getAverageRRPlacement, true)
                        "
                    >
                        {{
                            getAverageRRPlacement(Player.SELF) ===
                            Number.MAX_SAFE_INTEGER
                                ? "n/a"
                                : Math.round(getAverageRRPlacement(Player.SELF))
                        }}
                    </span>
                </div>
            </div>
        </div>
    </CardComponent>
</template>

<script setup lang="ts">
import type { IPlayer, IPlayerStatistics } from "~/utils/interfaces/IPlayer";
import ld from "lodash";

enum Player {
    SELF,
    COMPARISON,
}

const props = withDefaults(
    defineProps<{
        player: IPlayer;
        playerStatistics: IPlayerStatistics;
        playerAvatar: string;
        comparingStatistics?: IPlayerStatistics;
        reverse?: boolean;
    }>(),
    {
        comparingStatistics: undefined,
        reverse: false,
    },
);

function getWinrate(player: Player): number {
    if (player === Player.SELF) {
        return props.playerStatistics.winrate;
    } else if (player === Player.COMPARISON) {
        return props.comparingStatistics?.winrate ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getMapWinrate(player: Player): number {
    if (player === Player.SELF) {
        return props.playerStatistics.mapWinrate;
    } else if (player === Player.COMPARISON) {
        return props.comparingStatistics?.mapWinrate ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getMatchesPlayed(player: Player): number {
    if (player === Player.SELF) {
        return props.playerStatistics.matchCount;
    } else if (player === Player.COMPARISON) {
        return props.comparingStatistics?.matchCount ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getMapsPlayed(player: Player): number {
    if (player === Player.SELF) {
        return props.playerStatistics.mapCount;
    } else if (player === Player.COMPARISON) {
        return props.comparingStatistics?.mapCount ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getWTL(player: Player): string {
    if (player === Player.SELF) {
        const wtl = props.playerStatistics.winTieLoss;
        return `${wtl.w}-${wtl.t}-${wtl.l}`;
    } else if (player === Player.COMPARISON) {
        const wtl = props.comparingStatistics?.winTieLoss ?? {
            w: 0,
            t: 0,
            l: 0,
        };
        return `${wtl.w}-${wtl.t}-${wtl.l}`;
    }
    throw new Error(`illegal player: ${player}`);
}

function getH2H(player: Player): string {
    let h2h: { w: number; t: number; l: number } | undefined = {
        w: 0,
        t: 0,
        l: 0,
    };
    if (player === Player.SELF) {
        h2h = props.playerStatistics.h2hVsOpponent;
    } else if (player === Player.COMPARISON) {
        h2h = props.comparingStatistics?.h2hVsOpponent;
    }
    if (h2h != null) {
        return `${h2h.w}-${h2h.t}-${h2h.l}`;
    }
    return "";
}

function getH2HWR(player: Player): number {
    let h2h: { w: number; t: number; l: number } | undefined = {
        w: 0,
        t: 0,
        l: 0,
    };
    if (player === Player.SELF) {
        h2h = props.playerStatistics.h2hVsOpponent;
    } else if (player === Player.COMPARISON) {
        h2h = props.comparingStatistics?.h2hVsOpponent;
    }
    if (h2h != null) {
        return (h2h.w + 0.5 * h2h.t) / (h2h.w + h2h.l + h2h.l);
    }
    return 0.5;
}

function getElo(player: Player): number {
    if (player === Player.SELF) {
        return ld.last(props.playerStatistics.eloProgression)?.elo ?? 1000;
    } else if (player === Player.COMPARISON) {
        return ld.last(props.comparingStatistics?.eloProgression)?.elo ?? 1000;
    }
    return 1000;
}

function getRRAmount(player: Player): number {
    if (player === Player.SELF) {
        return props.playerStatistics.officialCompetitionCount;
    } else if (player === Player.COMPARISON) {
        return props.comparingStatistics?.officialCompetitionCount ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getRRWins(player: Player): number {
    if (player === Player.SELF) {
        return props.playerStatistics.competitionsWon;
    } else if (player === Player.COMPARISON) {
        return props.comparingStatistics?.competitionsWon ?? 0;
    }
    throw new Error(`illegal player: ${player}`);
}

function getBestRRPlacement(player: Player): number {
    if (player === Player.SELF) {
        return props.playerStatistics.bestPlacement ?? Number.MAX_SAFE_INTEGER;
    } else if (player === Player.COMPARISON) {
        return (
            props.comparingStatistics?.bestPlacement ?? Number.MAX_SAFE_INTEGER
        );
    }
    throw new Error(`illegal player: ${player}`);
}

function getAverageRRPlacement(player: Player): number {
    if (player === Player.SELF) {
        return (
            props.playerStatistics.averagePlacement ?? Number.MAX_SAFE_INTEGER
        );
    } else if (player === Player.COMPARISON) {
        return (
            props.comparingStatistics?.averagePlacement ??
            Number.MAX_SAFE_INTEGER
        );
    }
    throw new Error(`illegal player: ${player}`);
}

function isAhead(f: (player: Player) => number): boolean {
    if (props.comparingStatistics == null) {
        return false;
    }
    return f(Player.SELF) > f(Player.COMPARISON);
}

function isBehind(f: (player: Player) => number): boolean {
    if (props.comparingStatistics == null) {
        return false;
    }
    return f(Player.SELF) < f(Player.COMPARISON);
}

function getAheadBehindClass(
    f: (player: Player) => number,
    reverse = false,
): string {
    if ((isAhead(f) && !reverse) || (isBehind(f) && reverse)) {
        return "ahead";
    }
    if ((isBehind(f) && !reverse) || (isAhead(f) && reverse)) {
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
