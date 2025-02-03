<template>
    <DialogComponent
        dialog-class="min-w-[45%]"
        :open="dialogOpen"
        @click-outside="dialogOpen = false"
        @closed="$emit('clickOutside')"
    >
        <CardComponent class="max-h-screen flex flex-col gap-5">
            <h1 class="text-3xl flex flex-row md:gap-10 gap-1">
                <div class="flex-1 text-right">
                    <Tag :color="getPlayerColor(1)">
                        {{ players.get(match.playerOne) }}
                    </Tag>
                </div>
                <span
                    class="text-xl md:text-3xl"
                    :class="{ 'text-gray-500': match.annulated }"
                    >{{ match.playerOneScore }} -
                    {{ match.playerTwoScore }}</span
                >
                <div class="flex-1 text-left">
                    <Tag :color="getPlayerColor(2)">
                        {{ players.get(match.playerTwo) }}
                    </Tag>
                </div>
            </h1>
            <div v-if="match.annulated" class="text-center w-full italic">
                Match was annulated
            </div>
            <div class="flex flex-row font-bold text-center">
                <div class="w-full">
                    {{ match.competition }}
                    <span v-if="match.platform != null">
                        ({{ match.platform }})
                    </span>
                    -
                    {{ match.round }}
                </div>
                <div class="w-full">
                    {{
                        DateTime.fromMillis(match.timestamp)
                            .setLocale(useLocale().value)
                            .toLocaleString(DateTime.DATETIME_FULL)
                    }}
                </div>
            </div>
            <div
                v-if="match.shoutcasters != null"
                class="flex flex-row font-bold text-center"
            >
                <div class="w-full text-center">
                    Shoutcasted by {{ match.shoutcasters.join(", ") }}
                </div>
                <div class="w-full text-center">
                    <span v-if="match.vodLink != null">
                        Shoutcast available:
                        <a
                            v-for="(vod, idx) in match.vodLink"
                            :key="idx"
                            class="underline text-blue-500 ml-2"
                            :href="vod"
                            target="_blank"
                            >VOD{{ idx > 0 ? ` (Part ${idx + 1})` : "" }}</a
                        >
                    </span>
                    <span v-else> Shoutcast not available </span>
                </div>
            </div>

            <div
                v-if="match.notes != null && match.notes !== ''"
                class="italic text-center"
            >
                {{ match.notes }}
            </div>

            <div
                v-if="match.bannedMaps.length > 0"
                class="text-center font-bold"
            >
                Bans
            </div>

            <div v-if="match.bannedMaps.length > 0" class="grid grid-cols-3">
                <div class="flex flex-col gap-2 text-center">
                    <MapTag
                        v-for="(ban, idx) of playerOneBans"
                        :key="idx"
                        :map="getMap(ban.map)!"
                        full-name
                        :narrow="true"
                        class="w-fit mx-auto"
                    />
                </div>
                <div />
                <div class="flex flex-col gap-2 text-center">
                    <MapTag
                        v-for="(ban, idx) of playerTwoBans"
                        :key="idx"
                        :map="getMap(ban.map)!"
                        full-name
                        :narrow="true"
                        class="w-fit mx-auto"
                    />
                </div>
            </div>

            <div class="grid grid-cols-3 gap-y-1 gap-x-20">
                <div class="font-bold">Map</div>
                <div class="font-bold">Picked by</div>
                <div class="font-bold">Won by</div>
                <template v-for="(map, idx) in match.playedMaps" :key="idx">
                    <div>
                        <MapTag :map="getMap(map.map)!" full-name />
                    </div>
                    <div>
                        <Tag :color="getPlayerColor(map.picked)">
                            {{ getPlayerName(map.picked, "Random") }}
                        </Tag>
                    </div>
                    <div>
                        <Tag :color="getPlayerColor(map.winner)">
                            {{ getPlayerName(map.winner, "Draw") }}
                        </Tag>
                        <span v-if="map.forfeit">(Won by forfeit)</span>
                        <span v-if="map.unscored">(Unscored)</span>
                    </div>
                    <div v-if="map.spin != null" class="col-span-3">
                        <TextualSpin :spin="map.spin" />
                    </div>

                    <div
                        v-if="map.notes != null && map.notes !== ''"
                        class="col-span-3 text-center italic"
                    >
                        {{ map.notes }}
                    </div>

                    <div
                        class="col-span-3 border-b border-gray-500 pb-3 mb-3 text-center"
                    >
                        RTA:
                        {{
                            map.timeTaken > 0
                                ? durationToLocale(map.timeTaken * 1000)
                                : "unknown"
                        }}
                        <Tag v-if="isMapPB(idx)" narrow color="purple">
                            Personal best ({{
                                getPlayerName(map.winner, "unknown")
                            }})
                        </Tag>
                        <Tag
                            v-if="wrStatus[idx] === RecordStatus.CURRENT"
                            narrow
                            color="#cb8900"
                        >
                            Current record
                        </Tag>
                        <Tag
                            v-if="wrStatus[idx] === RecordStatus.FORMER"
                            narrow
                            color="#926711"
                        >
                            Former record
                        </Tag>
                    </div>
                </template>
            </div>

            <div v-if="!allMapTimes.includes(-1)" class="text-center">
                Total match RTA:
                {{
                    durationToLocale(
                        allMapTimes.reduce((prev, cur) => prev + cur, 0) * 1000,
                    )
                }}
            </div>

            <div
                v-if="match.eloChange.length >= 2"
                class="flex flex-row justify-center gap-10"
            >
                <div class="text-right">
                    <Tag narrow :color="getEloTag(0)">
                        {{ match.eloChange[0] }}
                    </Tag>
                </div>
                <div>Elo Change</div>
                <div>
                    <Tag narrow :color="getEloTag(1)">
                        {{ match.eloChange[1] }}
                    </Tag>
                </div>
            </div>

            <ButtonComponent @click="dialogOpen = false">Close</ButtonComponent>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import {
    ChoosingPlayer,
    type IMatch,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";
import { DateTime, Duration } from "luxon";

enum RecordStatus {
    NONE,
    FORMER,
    CURRENT,
}

defineEmits<{
    clickOutside: [];
}>();

const props = defineProps<{
    match: IMatch;
}>();

const dialogOpen = ref(true);
const players = usePlayers();

await players.queryPlayers([props.match.playerOne, props.match.playerTwo]);

const { data: playerOneStatistics } = await useFetch(
    `/api/player/statistics?player=${props.match.playerOne}`,
);
const { data: playerTwoStatistics } = await useFetch(
    `/api/player/statistics?player=${props.match.playerTwo}`,
);
const wrStatus = ref<RecordStatus[]>(
    props.match.playedMaps.map((_) => RecordStatus.NONE),
);

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

function getPlayerName(
    player: ChoosingPlayer | WinningPlayer,
    randomDrawOption: string,
): string {
    switch (player) {
        case ChoosingPlayer.PLAYER_ONE:
        case WinningPlayer.PLAYER_ONE:
            return players.get(props.match.playerOne, "unknown");
        case ChoosingPlayer.PLAYER_TWO:
        case WinningPlayer.PLAYER_TWO:
            return players.get(props.match.playerTwo, "unknown");
        case ChoosingPlayer.RANDOM:
        case WinningPlayer.DRAW:
            return randomDrawOption;
    }
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

function isMapPB(mapIdx: number): boolean {
    const map = props.match.playedMaps[mapIdx];
    if (map.winner === WinningPlayer.PLAYER_ONE) {
        return (
            playerOneStatistics.value?.mapPBs[map.map].match?.uuid ===
                props.match.uuid &&
            playerOneStatistics.value?.mapPBs[map.map].map === mapIdx
        );
    }
    if (map.winner === WinningPlayer.PLAYER_TWO) {
        return (
            playerTwoStatistics.value?.mapPBs[map.map].match?.uuid ===
                props.match.uuid &&
            playerTwoStatistics.value?.mapPBs[map.map].map === mapIdx
        );
    }
    return false;
}

function getEloTag(index: number): string {
    if (props.match.eloChange[index] > 0) {
        return "#4caf50";
    } else if (props.match.eloChange[index] < 0) {
        return "#f44336";
    } else {
        return "#d0c033";
    }
}

const allMapTimes = computed(() => {
    return props.match.playedMaps.map((map) => map.timeTaken);
});

onBeforeMount(async () => {
    await Promise.all(
        props.match.playedMaps.map((m, idx) => {
            return new Promise<void>((resolve) => {
                $fetch("/api/records/history", { query: { map: m.map } }).then(
                    (data) => {
                        const recordIndex = data.findIndex(
                            (r) => r.match === props.match.uuid,
                        );
                        if (recordIndex === data.length - 1) {
                            wrStatus.value[idx] = RecordStatus.CURRENT;
                        } else if (recordIndex > 0) {
                            wrStatus.value[idx] = RecordStatus.FORMER;
                        }
                        resolve();
                    },
                );
            });
        }),
    );
});
</script>
