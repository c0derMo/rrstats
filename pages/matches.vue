<template>
    <div>
        <MatchDetailsDialog
            v-if="matchToShow != null"
            :match="matchToShow"
            :opponents="data?.players || {}"
            @click-outside="matchToShow = null"
        />
        <CompetitionBackground
            :competitions="[
                competition?.backgroundImage || (tournament as string),
            ]"
        />

        <div class="flex flex-col gap-3 md:mx-10">
            <h1 class="text-center text-5xl bold">
                {{ competition?.name }} - Matches
            </h1>

            <GroupsTables
                v-if="
                    competition?.groupsConfig !== null &&
                    competition?.groupsConfig !== undefined
                "
                :groups-info="competition.groupsConfig"
                :matches="sortedMatches"
                :players="data?.players ?? {}"
            />

            <div v-if="competition?.hitmapsStatsUrl != null" class="border-2 rounded p-3 text-center mx-auto my-4 border-blue-600 dark:border-blue-400">
                <FontAwesomeIcon :icon="['fas', 'chart-simple']" class="mr-3" />
                HITMAPS has tournament-specific statistics available! Check them out <a class="underline" :href="competition.hitmapsStatsUrl">here</a>!
            </div>

            <DataTableComponent
                :headers="headers"
                :rows="sortedMatches"
                :enable-sorting="false"
                :rows-per-page="[10, 25, 50, 100]"
                :items-per-page="25"
            >
                <template #timestamp="{ value }">
                    {{
                        DateTime.fromMillis(value as number)
                            .setLocale(useLocale().value)
                            .toLocaleString(DateTime.DATETIME_FULL)
                    }}
                </template>

                <template #playerOne="{ value }">
                    {{
                        data?.players[value as string] ||
                        `Unknown player: ${value}`
                    }}
                </template>

                <template #score="{ row }">
                    <span class="whitespace-nowrap"
                        >{{ row.playerOneScore }} -
                        {{ row.playerTwoScore }}</span
                    >
                </template>

                <template #playerTwo="{ value }">
                    {{
                        data?.players[value as string] ||
                        `Unknown player: ${value}`
                    }}
                </template>

                <template #bans="{ row }">
                    <div class="flex flex-wrap">
                        <TooltipComponent
                            v-for="(
                                ban, idx
                            ) in row.bannedMaps as RRBannedMap[]"
                            :key="idx"
                        >
                            <Tag :color="getMap(ban.map)?.color">{{
                                getMap(ban.map)?.abbreviation
                            }}</Tag>

                            <template #tooltip>
                                Map: {{ getMap(ban.map)?.name }}<br />
                                Banned by: {{ getMapPicker(ban, row) }}
                            </template>
                        </TooltipComponent>
                    </div>
                </template>

                <template #playedMaps="{ value, row }">
                    <div class="flex flex-wrap">
                        <TooltipComponent
                            v-for="(play, idx) in value as RRMap[]"
                            :key="idx"
                        >
                            <Tag :color="getMap(play.map)?.color">{{
                                getMap(play.map)?.abbreviation
                            }}</Tag>

                            <template #tooltip>
                                Map: {{ getMap(play.map)?.name }}<br />
                                Picked by: {{ getMapPicker(play, row) }}<br />
                                Won by: {{ getMapWinner(play, row) }}
                            </template>
                        </TooltipComponent>
                    </div>
                </template>

                <template #shoutcasters="{ value }">
                    <span v-if="value !== null">{{
                        (value as string[]).join(", ")
                    }}</span>
                </template>

                <template #actions="{ row }">
                    <ButtonComponent @click="matchToShow = row">
                        <FontAwesomeIcon
                            :icon="['fas', 'ellipsis-h']"
                            size="xs"
                        />
                    </ButtonComponent>
                </template>
            </DataTableComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { DateTime } from "luxon";
import { ICompetition } from "~/utils/interfaces/ICompetition";
import {
    ChoosingPlayer,
    IMatch,
    RRBannedMap,
    RRMap,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";

const matchToShow: Ref<IMatch | null> = ref(null);

const headers = [
    { title: "Date & Time", key: "timestamp" },
    { title: "Player 1", key: "playerOne" },
    { title: "", key: "score" },
    { title: "Player 2", key: "playerTwo" },
    { title: "Bans", key: "bans" },
    { title: "Maps", key: "playedMaps" },
    { title: "Shoutcast", key: "shoutcasters" },
    { title: "", key: "actions" },
];

const tournament = useRoute().query.tournament;
const data = (await useFetch("/api/matches", { query: { tournament } })).data;
const competition = (
    await useFetch("/api/competitions", { query: { tag: tournament } })
).data as Ref<ICompetition | null>;

useHead({
    title: `${competition.value?.name} - RRStats`,
});

const sortedMatches = computed(() => {
    if (data.value === null) {
        return [];
    }
    return data.value.matches.sort((a, b) => b.timestamp - a.timestamp);
});

function getMapPicker(map: RRMap | RRBannedMap, match: IMatch): string {
    if (map.picked === ChoosingPlayer.RANDOM) return "Random";
    if (map.picked === ChoosingPlayer.PLAYER_ONE)
        return data.value?.players[match.playerOne] ?? "Unknown";
    if (map.picked === ChoosingPlayer.PLAYER_TWO)
        return data.value?.players[match.playerTwo] ?? "Unknown";
    return "Unknown";
}

function getMapWinner(map: RRMap, match: IMatch): string {
    if (map.winner === WinningPlayer.DRAW) return "Draw";
    if (map.winner === WinningPlayer.PLAYER_ONE)
        return data.value?.players[match.playerOne] ?? "Unknown";
    if (map.winner === WinningPlayer.PLAYER_TWO)
        return data.value?.players[match.playerTwo] ?? "Unknown";
    return "Unknown";
}
</script>
