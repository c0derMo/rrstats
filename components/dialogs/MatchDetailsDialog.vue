<template>
    <DialogComponent>
        <CardComponent>
            <h1 class="text-3xl text-center">
                <Tag :color="getPlayerColor(1)">
                    {{ opponents[match.playerOne] }}
                </Tag>
                <span class="mx-10">{{ match.playerOneScore }} - {{ match.playerTwoScore }}</span>
                <Tag :color="getPlayerColor(2)">
                    {{ opponents[match.playerTwo] }}
                </Tag>
            </h1>
            <div class="grid grid-cols-2 gap-x-32 gap-y-3 my-5">
                <div v-if="match.bannedMaps.length > 0">
                    Ban:
                    <Tag v-for="ban in playerOneBans" :color="getMap(ban.map)!.color">{{ getMap(ban.map)!.name }}</Tag>
                </div>
                <div v-if="match.bannedMaps.length > 0">
                    Ban:
                    <Tag v-for="ban in playerTwoBans" :color="getMap(ban.map)!.color">{{ getMap(ban.map)!.name }}</Tag>
                </div>
            </div>
            <div class="grid grid-cols-6 gap-2">
                <template v-for="map in match.playedMaps">
                    <div class="col-span-2">
                        Map: <Tag :color="getMap(map.map)?.color">{{ getMap(map.map)?.name }}</Tag>
                    </div>
                    <div class="col-span-2">
                        Picked by: <Tag :color="getPlayerColor(map.picked)">{{ getPlayerName(map.picked) }}</Tag>
                    </div>
                    <div class="col-span-2">
                        Won by: <Tag :color="getPlayerColor(map.winner)">{{ getPlayerName(map.winner as WinningPlayer) }}</Tag>
                        <span v-if="map.forfeit">(Won by forfeit)</span>
                    </div>
                    <div class="col-span-6" v-if="map.spin != null">
                        <TextualSpin :spin="map.spin"/>
                    </div>
                    <div class="col-span-3">
                        Spin started at:
                        {{ map.startedTimestamp > 0 ? timestampToLocale(map.startedTimestamp) : 'unknown' }}
                    </div>
                    <div class="col-span-3 mb-10">
                        Finished after:
                        {{ map.endedTimestamp > 0 ? durationToLocale(map.endedTimestamp - map.startedTimestamp) : 'unknown' }}
                        <span v-if="!map.timeAccurate"> (estimate)</span>
                    </div>
                </template>
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import { ChoosingPlayer, IMatch, WinningPlayer } from '~/utils/interfaces/IMatch';
import { DateTime, Duration } from 'luxon';

const props = defineProps({
    "match": {
        type: Object as PropType<IMatch>,
        required: true
    },
    "opponents": {
        type: Object as PropType<Record<string, string>>,
        required: true,
    }
});

const playerOneBans = computed(() => {
    return props.match.bannedMaps.filter((b) => b.picked === ChoosingPlayer.PLAYER_ONE);
});
const playerTwoBans = computed(() => {
    return props.match.bannedMaps.filter((b) => b.picked === ChoosingPlayer.PLAYER_TWO);
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
            return 'Random';
        case WinningPlayer.DRAW:
            return 'Draw';
    }
}

function timestampToLocale(timestamp: number) {
    return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATETIME_FULL);
}

function durationToLocale(millis: number) {
    return Duration.fromMillis(millis).toFormat('mm:ss');
}

function getPlayerColor(player: ChoosingPlayer | WinningPlayer): string | undefined {
    if (player === ChoosingPlayer.PLAYER_ONE || player === WinningPlayer.PLAYER_ONE) {
        return '#0369a1'
    }
    if (player === ChoosingPlayer.PLAYER_TWO || player === WinningPlayer.PLAYER_TWO) {
        return '#b91c1c'
    }
    return undefined;
}
</script>