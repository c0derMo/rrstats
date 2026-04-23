<template>
    <div class="flex flex-col gap-5">
        <div
            v-for="(match, idx) in displayedMatches"
            :key="idx"
            class="flex flex-col bg-black/70"
        >
            <div class="top-grid">
                <img :src="match.playerOneAvatar" height="128" />
                <div class="flex flex-col gap-4">
                    <div class="text-4xl font-bold mt-2">
                        {{ match.playerOne }}
                    </div>
                    <div
                        v-if="match.bans.length > 0"
                        class="flex flex-row gap-3 items-center"
                    >
                        <span class="italic">Bans:</span>
                        <MapTag
                            v-for="(map, mapIdx) in match.bans.filter(
                                (ban) =>
                                    ban.picked === ChoosingPlayer.PLAYER_ONE,
                            )"
                            :key="mapIdx"
                            :map="getMap(map.map)!"
                            full-name
                        />
                    </div>
                </div>
                <div class="flex-grow text-center flex flex-col">
                    <div class="text-xl font-bold mt-2">
                        {{
                            DateTime.fromISO(match.datetime).toLocaleString(
                                DateTime.DATETIME_FULL,
                            )
                        }}
                    </div>
                    <div>in {{ getRelativeTime(match.datetime) }}</div>
                    <div v-if="match.cast != null" class="mt-2">
                        <a
                            :href="match.cast.link"
                            class="underline text-blue-600 dark:text-blue-400"
                        >
                            Shoutcast by {{ match.cast.name }}
                        </a>
                    </div>
                </div>
                <div class="flex flex-col gap-4 text-right">
                    <div class="text-4xl font-bold mt-2">
                        {{ match.playerTwo }}
                    </div>
                    <div
                        v-if="match.bans.length > 0"
                        class="flex flex-row gap-3 items-center justify-end"
                    >
                        <span class="italic">Bans:</span>
                        <MapTag
                            v-for="(map, mapIdx) in match.bans.filter(
                                (ban) =>
                                    ban.picked === ChoosingPlayer.PLAYER_TWO,
                            )"
                            :key="mapIdx"
                            :map="getMap(map.map)!"
                            full-name
                        />
                    </div>
                </div>
                <img :src="match.playerTwoAvatar" height="128" />
            </div>
            <div class="flex flex-row">
                <div
                    v-for="(map, mapIdx) in match.maps"
                    :key="mapIdx"
                    class="h-36 flex-grow bg-cover bg-center"
                    :style="getMapBackground(map.map)"
                >
                    <div
                        class="bg-black/50 flex flex-col h-full p-4 items-center gap-1"
                    >
                        <MapTag
                            :map="getMap(map.map)!"
                            full-name
                            class="w-fit"
                        />
                        <div class="mt-2">Picked by:</div>
                        <Tag :color="getPlayerColor(map.picked)">
                            {{
                                getPicker(
                                    map.picked,
                                    match.playerOne,
                                    match.playerTwo,
                                )
                            }}
                        </Tag>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.top-grid {
    display: grid;
    grid-template-columns: 128px 32rem 1fr 32rem 128px;
    column-gap: 1rem;
}
</style>

<script setup lang="ts">
import { DateTime } from "luxon";

interface HitmapsMatch {
    id: number;
    challongeMatchId: number;
    matchScheduledAt: string;
    matchCompletedAt?: string;
    competitors: {
        id: number;
        challongeName: string;
        avatarUrl: string;
        countryCode: string;
    }[];
    gameModeMatchId?: string;
    maps: {
        competitorId?: number;
        selectionType: "Ban" | "Pick" | "Random";
        mapSlug: string;
        missionName: string;
        missionLocation: string;
    }[];
    pointsForVictory: number;
    cast?: {
        mainCaster: {
            discordId: string;
            name: string;
        };
        mainCasterUrl: string;
        cocasters: {
            discordId: string;
            name: string;
        }[];
    };
    matchAdmin: null;
}

const props = defineProps<{
    tournamentSlug: string;
}>();

const upcomingMatches: Ref<HitmapsMatch[]> = ref([]);
const currentTime = ref(Date.now());
const timerInterval = ref<number>();

try {
    const hitmapsQuery = await useFetch<{ data: HitmapsMatch[] }>(
        `https://tournamentsapi.hitmaps.com/api/events/${props.tournamentSlug}/upcoming-matches`,
    );
    if (
        hitmapsQuery.status.value === "success" &&
        hitmapsQuery.data.value != null
    ) {
        upcomingMatches.value = hitmapsQuery.data.value.data;
    }
} catch {
    upcomingMatches.value = [];
}

const displayedMatches = computed(() => {
    return upcomingMatches.value.map((match) => {
        const playerOneId = match.competitors[0].id;
        const playerTwoId = match.competitors[1].id;

        return {
            datetime: match.matchScheduledAt,
            playerOne: match.competitors[0].challongeName.trim(),
            playerTwo: match.competitors[1].challongeName.trim(),
            playerOneAvatar: match.competitors[0].avatarUrl,
            playerTwoAvatar: match.competitors[1].avatarUrl,
            bans: match.maps
                .filter((map) => map.selectionType === "Ban")
                .map((ban) => {
                    return {
                        map: getMapBySlug(ban.mapSlug ?? "")!.map as HitmanMap,
                        picked: parseMapPicker(
                            ban.competitorId,
                            playerOneId,
                            playerTwoId,
                        ),
                    };
                }),
            maps: match.maps
                .filter(
                    (map) =>
                        map.selectionType === "Pick" ||
                        map.selectionType === "Random",
                )
                .map((pick, idx) => {
                    return {
                        map: getMapBySlug(pick.mapSlug ?? "")!.map as HitmanMap,
                        picked: parseMapPicker(
                            pick.competitorId,
                            playerOneId,
                            playerTwoId,
                        ),
                        index: idx,
                    };
                }),
            cast:
                match.cast == null
                    ? null
                    : {
                          name: `${[match.cast.mainCaster.name, ...match.cast.cocasters.map((cocaster) => cocaster.name)].join(", ")}`,
                          link: match.cast.mainCasterUrl,
                      },
        };
    });
});

function parseMapPicker(
    competitorId: number | undefined,
    playerOneId: number,
    playerTwoId: number,
): ChoosingPlayer {
    if (competitorId === playerOneId) {
        return ChoosingPlayer.PLAYER_ONE;
    }
    if (competitorId === playerTwoId) {
        return ChoosingPlayer.PLAYER_TWO;
    }
    return ChoosingPlayer.RANDOM;
}

function updateTime() {
    currentTime.value = Date.now();
}

function getRelativeTime(timestamp: string) {
    return DateTime.fromISO(timestamp)
        .diff(DateTime.fromMillis(currentTime.value))
        .rescale()
        .set({ milliseconds: 0 })
        .removeZeros()
        .toHuman();
}

function getMapBackground(map: HitmanMap) {
    return {
        "background-image": `url(${getMap(map)!.backgroundImage})`,
    };
}

function getPicker(
    picker: ChoosingPlayer,
    playerOne: string,
    playerTwo: string,
): string {
    switch (picker) {
        case ChoosingPlayer.PLAYER_ONE:
            return playerOne;
        case ChoosingPlayer.PLAYER_TWO:
            return playerTwo;
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

onMounted(() => {
    timerInterval.value = window.setInterval(updateTime, 1000);
});
onBeforeUnmount(() => {
    window.clearInterval(timerInterval.value);
});
</script>
