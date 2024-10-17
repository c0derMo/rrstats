<template>
    <AccordionComponent
        v-if="upcomingMatches.length > 0"
        class="!bg-opacity-50"
    >
        <template #title> Upcoming matches </template>

        <TableComponent :headers="headers" :rows="displayedMatches">
            <template #datetime="{ value }">
                {{
                    DateTime.fromISO(value).toLocaleString(
                        DateTime.DATETIME_MED,
                    )
                }}
            </template>

            <template #playerOne="{ value }">
                <a :href="`${value}`">
                    {{ value }}
                </a>
            </template>
            <template #playerTwo="{ value }">
                <a :href="`${value}`">
                    {{ value }}
                </a>
            </template>

            <template #bans="{ row }">
                <template v-if="row.bans.length != 0">
                    <TooltipComponent v-for="(ban, idx) in row.bans" :key="idx">
                        <MapTag :map="getMapBySlug(ban.map)!" />

                        <template #tooltip>
                            Map: {{ getMapBySlug(ban.map)!.name }}<br />
                            Banned by:
                            {{
                                getMapPicker(
                                    ban.picked,
                                    row.playerOne,
                                    row.playerTwo,
                                )
                            }}
                        </template>
                    </TooltipComponent>
                </template>
            </template>

            <template #maps="{ row }">
                <TooltipComponent v-for="(map, idx) in row.maps" :key="idx">
                    <MapTag :map="getMapBySlug(map.map)!" />

                    <template #tooltip>
                        Map: {{ getMapBySlug(map.map)!.name }}<br />
                        Picked by:
                        {{
                            getMapPicker(
                                map.picked,
                                row.playerOne,
                                row.playerTwo,
                            )
                        }}
                    </template>
                </TooltipComponent>
            </template>

            <template #cast="{ row }">
                <span v-if="row.cast === null">No caster assigned</span>
                <span v-else>
                    <a
                        class="underline text-blue-600 dark:text-blue-400"
                        :href="row.cast.link"
                        >{{ row.cast.name }}</a
                    >
                </span>
            </template>
        </TableComponent>
    </AccordionComponent>
</template>

<script setup lang="ts">
import { ChoosingPlayer } from "~/utils/interfaces/IMatch";
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

const headers = [
    { title: "Date & Time", key: "datetime" },
    { title: "Player 1", key: "playerOne" },
    { title: "Player 2", key: "playerTwo" },
    { title: "Bans", key: "bans" },
    { title: "Maps", key: "maps" },
    { title: "Caster", key: "cast" },
];

const upcomingMatches: Ref<HitmapsMatch[]> = ref([]);

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
            bans: match.maps
                .filter((map) => map.selectionType === "Ban")
                .map((ban) => {
                    return {
                        map: ban.mapSlug,
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
                .map((pick) => {
                    return {
                        map: pick.mapSlug,
                        picked: parseMapPicker(
                            pick.competitorId,
                            playerOneId,
                            playerTwoId,
                        ),
                    };
                }),
            cast:
                match.cast == null
                    ? null
                    : {
                          name: match.cast.mainCaster.name,
                          link: match.cast.mainCasterUrl,
                      },
        };
    });
});

function getMapPicker(
    choosingPlayer: ChoosingPlayer,
    playerOne: string,
    playerTwo: string,
): string {
    switch (choosingPlayer) {
        case ChoosingPlayer.PLAYER_ONE:
            return playerOne;
        case ChoosingPlayer.PLAYER_TWO:
            return playerTwo;
        case ChoosingPlayer.RANDOM:
            return "Random";
    }
}

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
</script>
