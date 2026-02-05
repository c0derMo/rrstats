<template>
    <div
        class="relative inline"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
    >
        <slot />

        <Transition name="fade">
            <div
                v-if="showTooltip"
                class="absolute z-50 -translate-x-1/4 top-full w-full min-w-[650px]"
            >
                <div
                    class="p-1 rounded dark:bg-neutral-800/95 bg-neutral-100/95"
                >
                    <div
                        class="grid inverse-three-columns items-center w-full font-bold text-xl my-2 px-3"
                    >
                        <div>
                            <Tag
                                :color="
                                    getPlayerColor(ChoosingPlayer.PLAYER_ONE)
                                "
                            >
                                {{ playerNames.get(players[0], players[0]) }}
                            </Tag>
                        </div>

                        <div class="text-center">
                            <span v-if="score != null">
                                {{ score[0] }}-{{ score[1] }}
                            </span>
                        </div>

                        <div class="text-right">
                            <Tag
                                :color="
                                    getPlayerColor(ChoosingPlayer.PLAYER_TWO)
                                "
                            >
                                {{ playerNames.get(players[1], players[1]) }}
                            </Tag>
                        </div>
                    </div>

                    <div class="flex flex-col">
                        <div
                            v-for="map in maps"
                            :key="map.index"
                            class="grid three-columns w-full bg-center bg-cover bg-opacity-20"
                            :style="getMapBackground(map.map)"
                        >
                            <div
                                class="flex flex-row items-center gap-1 bg-black/70 p-2"
                            >
                                <template
                                    v-if="
                                        map.winner === WinningPlayer.PLAYER_ONE
                                    "
                                >
                                    <FontAwesomeIcon
                                        :icon="['fas', 'trophy']"
                                        :color="getPlacementTagColor(1)"
                                    />
                                    <div class="flex flex-col">
                                        <MapTag
                                            class="w-fit"
                                            narrow
                                            :map="getMap(map.map)!"
                                            full-name
                                        />
                                        <div
                                            v-if="map.timeTaken != null"
                                            class="italic text-sm mx-1"
                                        >
                                            {{ secondsToTime(map.timeTaken) }}
                                        </div>
                                    </div>
                                </template>
                                <FontAwesomeIcon
                                    v-else-if="map.winner != null"
                                    :icon="['fas', 'x']"
                                    color="red"
                                />
                            </div>

                            <div
                                class="flex flex-row justify-center items-center gap-5 bg-black/70 py-2"
                            >
                                <div
                                    v-if="
                                        map.winner === WinningPlayer.DRAW ||
                                        map.winner == null
                                    "
                                    class="flex flex-col justify-center items-center"
                                >
                                    <MapTag
                                        class="w-fit"
                                        narrow
                                        :map="getMap(map.map)!"
                                        full-name
                                    />
                                    <div
                                        v-if="map.timeTaken != null"
                                        class="italic text-sm mb-1"
                                    >
                                        {{ secondsToTime(map.timeTaken) }}
                                    </div>
                                </div>
                                <div
                                    class="flex flex-col justify-center items-center"
                                >
                                    <div class="text-sm">Chosen by</div>
                                    <Tag
                                        :color="getPlayerColor(map.picked)"
                                        narrow
                                    >
                                        {{ getPicker(map.picked) }}
                                    </Tag>
                                </div>
                            </div>

                            <div
                                class="flex flex-row items-center justify-end gap-1 bg-black/70 p-2"
                            >
                                <template
                                    v-if="
                                        map.winner === WinningPlayer.PLAYER_TWO
                                    "
                                >
                                    <div class="flex flex-col items-end">
                                        <MapTag
                                            class="w-fit"
                                            narrow
                                            :map="getMap(map.map)!"
                                            full-name
                                        />
                                        <div
                                            v-if="map.timeTaken != null"
                                            class="italic text-sm mx-1"
                                        >
                                            {{ secondsToTime(map.timeTaken) }}
                                        </div>
                                    </div>
                                    <FontAwesomeIcon
                                        :icon="['fas', 'trophy']"
                                        :color="getPlacementTagColor(1)"
                                    />
                                </template>
                                <FontAwesomeIcon
                                    v-else-if="map.winner != null"
                                    :icon="['fas', 'x']"
                                    color="red"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.three-columns {
    grid-template-columns: 1fr auto 1fr;
}

.inverse-three-columns {
    grid-template-columns: 45% auto 45%;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
    pointer-events: none;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps<{
    maps: (Pick<RRMap, "map" | "index" | "picked"> & Partial<RRMap>)[];
    players: string[];
    score?: number[];
}>();

const playerNames = usePlayers();
const showTooltip = ref(false);

function getPicker(picker: ChoosingPlayer): string {
    switch (picker) {
        case ChoosingPlayer.PLAYER_ONE:
            return playerNames.get(props.players[0], props.players[0]);
        case ChoosingPlayer.PLAYER_TWO:
            return playerNames.get(props.players[1], props.players[1]);
        case ChoosingPlayer.RANDOM:
            return "Random";
        default:
            return "unknown";
    }
}

function getPlayerColor(
    player: ChoosingPlayer | WinningPlayer,
): string | undefined {
    if (
        player === ChoosingPlayer.PLAYER_ONE ||
        player === WinningPlayer.PLAYER_ONE
    ) {
        return "#0369a1";
    }
    if (
        player === ChoosingPlayer.PLAYER_TWO ||
        player === WinningPlayer.PLAYER_TWO
    ) {
        return "#b91c1c";
    }
    return undefined;
}

function getMapBackground(map: HitmanMap) {
    return {
        "background-image": `url(${getMap(map)!.backgroundImage})`,
    };
}
</script>
