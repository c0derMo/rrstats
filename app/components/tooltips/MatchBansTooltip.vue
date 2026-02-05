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
                class="absolute z-50 -translate-x-1/4 top-full w-full min-w-[550px]"
            >
                <div
                    class="p-1 rounded dark:bg-neutral-800/95 bg-neutral-100/95"
                >
                    <div
                        class="grid grid-cols-2 items-center w-full font-bold text-xl my-2 px-3"
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

                    <div class="grid grid-cols-2">
                        <div class="flex-grow flex flex-col">
                            <div
                                v-for="(ban, idx) in leftPlayerBans"
                                :key="idx"
                                class="bg-right bg-cover"
                                :style="getMapBackground(ban.map)"
                            >
                                <div
                                    class="w-full h-full flex flex-row items-center gap-1 bg-black/70 p-2"
                                >
                                    <FontAwesomeIcon
                                        :icon="['fas', 'ban']"
                                        color="red"
                                    />
                                    <MapTag :map="getMap(ban.map)!" full-name />
                                </div>
                            </div>
                        </div>

                        <div class="flex-grow flex flex-col">
                            <div
                                v-for="(ban, idx) in rightPlayerBans"
                                :key="idx"
                                class="bg-right bg-cover"
                                :style="getMapBackground(ban.map)"
                            >
                                <div
                                    class="w-full h-full flex flex-row justify-end items-center gap-1 bg-black/70 p-2"
                                >
                                    <MapTag :map="getMap(ban.map)!" full-name />
                                    <FontAwesomeIcon
                                        :icon="['fas', 'ban']"
                                        color="red"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
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
    maps: RRBannedMap[];
    players: string[];
}>();

const playerNames = usePlayers();
const showTooltip = ref(false);

const leftPlayerBans = computed(() => {
    return props.maps.filter((map) => {
        return map.picked === ChoosingPlayer.PLAYER_ONE;
    });
});

const rightPlayerBans = computed(() => {
    return props.maps.filter((map) => {
        return map.picked === ChoosingPlayer.PLAYER_TWO;
    });
});

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
