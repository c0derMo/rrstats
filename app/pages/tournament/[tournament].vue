<template>
    <div>
        <MatchDetailsDialog
            v-if="matchToShow != null"
            :match="matchToShow"
            @click-outside="matchToShow = null"
        />
        <DownloadCompetitionCSVDialog
            v-if="showDownload"
            :competition="competition?.tag ?? ''"
            @closed="showDownload = false"
        />
        <CompetitionBackground
            :competitions="[
                competition?.backgroundImage || (tournament as string),
            ]"
        />

        <div class="flex flex-col gap-3 md:mx-10">
            <h1 class="text-center text-5xl bold">
                {{ competition?.name }}
            </h1>

            <div
                v-if="competition?.hitmapsStatsUrl != null"
                class="border-2 rounded p-3 text-center mx-auto my-4 border-blue-600 dark:border-blue-400"
            >
                <FontAwesomeIcon :icon="['fas', 'chart-simple']" class="mr-3" />
                HITMAPS has tournament-specific statistics available! Check them
                out
                <a class="underline" :href="competition.hitmapsStatsUrl">here</a
                >!
            </div>

            <TabbedContainer :tabs="tabs">
                <template #[`Matches`]>
                    <IndefiniteProgressBar v-if="stillLoading" />
                    <DataTableComponent
                        :headers="headers"
                        :rows="sortedMatches"
                        :enable-sorting="false"
                        :rows-per-page="[10, 25, 50, 100]"
                        :selected-rows-per-page="25"
                    >
                        <template #header-actions>
                            <ButtonComponent @click="showDownload = true">
                                <FontAwesomeIcon
                                    :icon="['fas', 'download']"
                                    size="xs"
                                />
                            </ButtonComponent>
                        </template>

                        <template #timestamp="{ value }">
                            {{
                                DateTime.fromMillis(value)
                                    .setLocale(useLocale().value)
                                    .toLocaleString(DateTime.DATETIME_MED)
                            }}
                        </template>

                        <template #playerOne="{ value }">
                            <PlayerLinkTag :player="players.get(value)" />
                        </template>

                        <template #score="{ row }">
                            <span class="whitespace-nowrap">
                                {{ row.playerOneScore }} -
                                {{ row.playerTwoScore }}
                            </span>
                        </template>

                        <template #playerTwo="{ value }">
                            <PlayerLinkTag :player="players.get(value)" />
                        </template>

                        <template #bans="{ row }: { row: IMatch }">
                            <div class="flex flex-wrap max-w-60">
                                <MatchBansTooltip
                                    :maps="row.bannedMaps"
                                    :players="[row.playerOne, row.playerTwo]"
                                    :score="[
                                        row.playerOneScore,
                                        row.playerTwoScore,
                                    ]"
                                >
                                    <MapTag
                                        v-for="(map, idx) in row.bannedMaps"
                                        :key="idx"
                                        :map="getMap(map.map)!"
                                    />
                                </MatchBansTooltip>
                            </div>
                        </template>

                        <template
                            #playedMaps="{
                                value,
                                row,
                            }: {
                                value: RRMap[];
                                row: IMatch;
                            }"
                        >
                            <div class="flex flex-wrap">
                                <MatchMapsTooltip
                                    :maps="value"
                                    :players="[row.playerOne, row.playerTwo]"
                                    :score="[
                                        row.playerOneScore,
                                        row.playerTwoScore,
                                    ]"
                                >
                                    <MapTag
                                        v-for="(map, idx) in value"
                                        :key="idx"
                                        :map="getMap(map.map)!"
                                    />
                                </MatchMapsTooltip>
                            </div>
                        </template>

                        <template
                            #shoutcasters="{
                                value,
                                row,
                            }: {
                                value: string[];
                                row: IMatch;
                            }"
                        >
                            <a
                                v-if="value !== null"
                                :href="
                                    row.vodLink != null &&
                                    row.vodLink.length > 0
                                        ? row.vodLink[0]
                                        : ''
                                "
                                :class="{
                                    'underline text-blue-600 dark:text-blue-400':
                                        row.vodLink != null &&
                                        row.vodLink.length > 0,
                                }"
                            >
                                {{ value.join(", ") }}
                            </a>

                            <template
                                v-for="(vod, idx) of row.vodLink"
                                :key="idx"
                            >
                                <a
                                    v-if="idx > 0"
                                    class="underline text-blue-600 dark:text-blue-400 ml-1"
                                    :href="vod"
                                >
                                    (Part {{ idx + 1 }})
                                </a>
                            </template>
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
                </template>

                <template #[uM]>
                    <UpcomingMatches
                        :tournament-slug="competition!.hitmapsSlug!"
                    />
                </template>

                <template #Groups>
                    <GroupsTables
                        :groups-info="competition!.groupsConfig!"
                        :matches="sortedMatches"
                    />
                </template>

                <template
                    v-for="bracket in brackets"
                    :key="bracket.index"
                    #[getBracketTabName(bracket)]
                >
                    <BracketViewer
                        :matches="matches ?? []"
                        :bracket="bracket"
                    />
                </template>
            </TabbedContainer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { DateTime } from "luxon";

definePageMeta({
    key: (route) => route.fullPath,
});

const matchToShow: Ref<IMatch | null> = ref(null);
const showDownload = ref(false);
const uM = "Upcoming matches";

const headers = [
    { title: "Date & Time", key: "timestamp" },
    { title: "Round", key: "round" },
    { title: "Player 1", key: "playerOne" },
    { title: "", key: "score" },
    { title: "Player 2", key: "playerTwo" },
    { title: "Bans", key: "bans" },
    { title: "Maps", key: "playedMaps" },
    { title: "Shoutcast", key: "shoutcasters" },
    { title: "", key: "actions" },
];

const tournament = useRoute().params.tournament;
const { data: matches } = await useFetch<IMatch[]>("/api/matches", {
    query: { tournament },
});
const { data: competition } = await useFetch<
    (ICompetition & { shouldRetry: boolean }) | null
>("/api/competitions", {
    query: { tag: tournament, initialLoad: true },
});
const { data: brackets } = await useFetch<IBracket[]>(
    "/api/competitions/brackets",
    {
        query: { tag: tournament },
        default: () => [],
    },
);

const stillLoading = ref(competition.value?.shouldRetry ?? false);
const players = usePlayers();
await players.queryFromMatches(matches.value ?? []);

useHead({
    title: `${competition.value?.name} - RRStats`,
});

const sortedMatches = computed(() => {
    if (matches.value == null) {
        return [];
    }
    return [...matches.value].sort((a, b) => b.timestamp - a.timestamp);
});

const tabs = computed(() => {
    const result = ["Matches"];
    if (
        competition.value?.hitmapsSlug != null &&
        competition.value?.updateWithHitmaps
    ) {
        result.push("Upcoming matches");
    }
    if (competition.value?.groupsConfig != null) {
        result.push("Groups");
    }
    brackets.value.forEach((bracket) => {
        result.push(getBracketTabName(bracket));
    });
    return result;
});

function getBracketTabName(bracket: IBracket) {
    return `Bracket - ${bracket.name}`;
}

onMounted(async () => {
    if (competition.value?.shouldRetry) {
        await $fetch("/api/competitions", { query: { tag: tournament } });
        const matchRequest = await $fetch<IMatch[]>("/api/matches", {
            query: { tournament: tournament },
        });

        matches.value = matchRequest;
        await players.queryFromMatches(matches.value ?? []);
        stillLoading.value = false;
    }
});
</script>
