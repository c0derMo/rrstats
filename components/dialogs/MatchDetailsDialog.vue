<template>
    <DialogComponent>
        <CardComponent class="max-h-screen">
            <h1 class="text-3xl text-center">
                <Tag :color="getPlayerColor(1)">
                    {{ opponents[match.playerOne] }}
                </Tag>
                <span
                    class="md:mx-10 mx-1 text-xl md:text-3xl"
                    :class="{ 'text-gray-500': match.annulated }"
                    >{{ match.playerOneScore }} -
                    {{ match.playerTwoScore }}</span
                >
                <Tag :color="getPlayerColor(2)">
                    {{ opponents[match.playerTwo] }}
                </Tag>
            </h1>
            <div v-if="match.annulated" class="text-center w-full italic">
                Match was annulated
            </div>
            <div class="grid grid-cols-2 gap-x-32 gap-y-3 my-5">
                <div v-if="match.bannedMaps.length > 0">
                    Ban:
                    <Tag
                        v-for="(ban, idx) in playerOneBans"
                        :key="idx"
                        :color="getMap(ban.map)!.color"
                        >{{ getMap(ban.map)!.name }}</Tag
                    >
                </div>
                <div v-if="match.bannedMaps.length > 0">
                    Ban:
                    <Tag
                        v-for="(ban, idx) in playerTwoBans"
                        :key="idx"
                        :color="getMap(ban.map)!.color"
                        >{{ getMap(ban.map)!.name }}</Tag
                    >
                </div>
            </div>
            <div class="grid grid-cols-6 gap-2">
                <template v-for="(map, idx) in match.playedMaps" :key="idx">
                    <div class="col-span-2">
                        Map:
                        <Tag :color="getMap(map.map)?.color">{{
                            getMap(map.map)?.name
                        }}</Tag>
                    </div>
                    <div class="col-span-2">
                        Picked by:
                        <Tag :color="getPlayerColor(map.picked)">{{
                            getPlayerName(map.picked)
                        }}</Tag>
                    </div>
                    <div class="col-span-2">
                        Won by:
                        <Tag :color="getPlayerColor(map.winner)">{{
                            getPlayerName(map.winner as WinningPlayer)
                        }}</Tag>
                        <span v-if="map.forfeit">(Won by forfeit)</span>
                    </div>
                    <div v-if="map.spin != null" class="col-span-6">
                        <TextualSpin :spin="map.spin" />
                    </div>
                    <div class="col-span-3">
                        Spin started at:
                        {{
                            map.startedTimestamp > 0
                                ? timestampToLocale(map.startedTimestamp)
                                : "unknown"
                        }}
                    </div>
                    <div class="col-span-3 mb-5">
                        Finished after:
                        {{
                            map.endedTimestamp > 0
                                ? durationToLocale(
                                      map.endedTimestamp - map.startedTimestamp,
                                  )
                                : "unknown"
                        }}
                        <span v-if="!map.timeAccurate"> (estimate)</span>
                    </div>
                </template>
                <div class="col-span-3">
                    <span v-if="match.shoutcasters != null"
                        >Shoutcast: {{ match.shoutcasters.join(", ") }}</span
                    >
                </div>
                <div class="col-span-3">
                    <span v-if="match.vodLink != null">
                        <a :href="match.vodLink">VOD</a>
                    </span>
                </div>
            </div>
            <ButtonComponent @click="$emit('clickOutside')"
                >Close</ButtonComponent
            >
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import {
    ChoosingPlayer,
    IMatch,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";
import { DateTime, Duration } from "luxon";

defineEmits(["clickOutside"]);

const props = defineProps({
    match: {
        type: Object as PropType<IMatch>,
        required: true,
    },
    opponents: {
        type: Object as PropType<Record<string, string>>,
        required: true,
    },
});

const playerOneBans = computed(() => {
    return props.match.bannedMaps.filter(
        (b) => b.picked === ChoosingPlayer.PLAYER_ONE,
    );
});
const playerTwoBans = computed(() => {
    return props.match.bannedMaps.filter(
        (b) => b.picked === ChoosingPlayer.PLAYER_TWO,
    );
});

function getPlayerName(player: ChoosingPlayer | WinningPlayer): string {
    switch (player) {
        case ChoosingPlayer.PLAYER_ONE:
        case WinningPlayer.PLAYER_ONE:
            return props.opponents[props.match.playerOne] || "unknown";
        case ChoosingPlayer.PLAYER_TWO:
        case WinningPlayer.PLAYER_TWO:
            return props.opponents[props.match.playerTwo] || "unknown";
        case ChoosingPlayer.RANDOM:
            return "Random";
        case WinningPlayer.DRAW:
            return "Draw";
    }
}

function timestampToLocale(timestamp: number) {
    return DateTime.fromMillis(timestamp)
        .setLocale(useLocale().value)
        .toLocaleString(DateTime.DATETIME_FULL);
}

function durationToLocale(millis: number) {
    return Duration.fromMillis(millis).toFormat("mm:ss");
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
</script>
