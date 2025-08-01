<template>
    <div>
        <MapBackground :maps="pickedMaps" />
        <div class="flex flex-col gap-5 mt-5 lg:mx-10 mx-1">
            <div class="flex flex-row gap-5 justify-center">
                <CardComponent class="lg:w-3/5">
                    <div class="flex md:flex-row flex-col">
                        <div class="w-20 h-20 self-center relative">
                            <img
                                class="rounded-full self-center"
                                :src="avatar!"
                                alt="Player Avatar"
                            />
                            <img
                                v-if="
                                    player != null && player.nationality != null
                                "
                                class="absolute bottom-1 right-1 w-5 h-5"
                                :src="`https://flagicons.lipis.dev/flags/4x3/${player.nationality}.svg`"
                                alt="Player nationality"
                            />
                        </div>
                        <div class="flex-grow ml-5">
                            <h1 class="text-5xl">
                                {{ player?.primaryName ?? route.params.player }}
                            </h1>
                            <h3
                                :class="{ italic: player?.hasCustomTitle }"
                                class="mt-1"
                            >
                                {{ player?.accolade }}
                            </h3>
                            <h3
                                v-if="
                                    player?.alternativeNames &&
                                    player?.alternativeNames.length > 0
                                "
                            >
                                Also played as:
                                {{ player?.alternativeNames?.join(", ") }}
                            </h3>
                        </div>
                        <div class="text-xl font-light text-right">
                            <span class="italic opacity-75">Winrate: </span>
                            <span class="text-2xl">
                                {{
                                    Math.round(
                                        (statistics?.winrate ?? 0) * 100,
                                    )
                                }}%
                            </span>
                            <br />
                            <span class="italic opacity-75">Map-Winrate: </span>
                            <span class="text-2xl">
                                {{
                                    Math.round(
                                        (statistics?.mapWinrate ?? 0) * 100,
                                    )
                                }}%
                            </span>
                            <br />
                            <template v-if="statistics.debutMatch != null">
                                <span class="italic opacity-75">Debut: </span>
                                <span class="text-2xl">
                                    {{
                                        DateTime.fromMillis(
                                            statistics.debutMatch.timestamp,
                                        )
                                            .setLocale(useLocale().value)
                                            .toLocaleString(DateTime.DATE_SHORT)
                                    }}
                                    ({{ statistics.debutMatch.competition }})
                                </span>
                            </template>
                        </div>
                    </div>
                </CardComponent>
            </div>

            <CardComponent class="flex md:flex-row w-3/5 mx-auto flex-col">
                <div class="flex-grow md:text-left text-center md:pl-10">
                    Best RR Placement:
                    {{
                        statistics?.bestPlacement
                            ? formatPlacement(statistics.bestPlacement)
                            : "n/a"
                    }}
                </div>
                <div
                    class="flex-grow text-center md:border-x border-neutral-500"
                >
                    Elo rating:
                    {{ ld.last(statistics?.eloProgression)?.elo ?? 1000 }}
                </div>
                <div
                    class="flex-grow text-center md:border-x border-neutral-500"
                >
                    Maps played:
                    {{ statistics?.mapCount }}
                </div>
                <div
                    class="flex-grow text-center md:border-x border-neutral-500"
                >
                    Matches played:
                    {{ statistics?.matchCount }}
                </div>
                <div class="flex-grow md:text-right text-center md:pr-10">
                    W-T-L: {{ wtl }}
                </div>
            </CardComponent>

            <div class="flex 2xl:flex-row gap-5 flex-col-reverse">
                <CardComponent class="2xl:w-3/12 w-full !overflow-visible">
                    <TabbedContainer
                        :tabs="['Competitions', 'Opponents', 'Records']"
                    >
                        <template #Competitions>
                            <CompetitionsTable
                                :placements="placements"
                                :competitions="competitions"
                            />
                        </template>
                        <template #Opponents>
                            <OpponentsTable
                                :matches="matches"
                                :local-player="player?.uuid || ''"
                            />
                        </template>
                        <template #Records>
                            <PlayerRecordsList :player="player?.uuid || ''" />
                        </template>
                    </TabbedContainer>
                </CardComponent>
                <CardComponent class="flex-grow !overflow-visible relative">
                    <IndefiniteProgressBar
                        v-if="stillLoading"
                        class="mb-2 absolute top-0 left-0"
                    />
                    <MatchList
                        :matches="matches"
                        :local-player="player?.uuid || ''"
                    />
                </CardComponent>
            </div>

            <CardComponent class="!overflow-visible">
                <TabbedContainer
                    :tabs="[
                        'Maps',
                        'Time Heatmap',
                        'Personal Bests',
                        'Elo Progression',
                        'Achievements',
                    ]"
                >
                    <template #Maps>
                        <PlayerMapList
                            :matches="matches || []"
                            :local-player="player?.uuid || ''"
                            :competitions="competitions || []"
                        />
                    </template>
                    <template #[tH]>
                        <PlaytimeHeatmap :matches="matches || []" />
                    </template>
                    <template #[pB]>
                        <PersonalBestTable
                            :local-player="player?.uuid || ''"
                            :statistics="statistics"
                        />
                    </template>

                    <template #[eP]>
                        <EloGraph
                            :player-statistics="statistics"
                            :player="player?.primaryName ?? ''"
                        />
                    </template>

                    <template #Achievements>
                        <AchievementsGrid :player="player?.uuid ?? ''" />
                    </template>
                </TabbedContainer>
            </CardComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type { IMatch } from "~/utils/interfaces/IMatch";
import { emptyStatistics } from "~/utils/interfaces/IPlayer";
import ld from "lodash";
import type { ICompetition } from "~/utils/interfaces/ICompetition";

const route = useRoute();

useHead({
    title: `${route.params.player} - RRStats`,
});

const tH = "Time Heatmap";
const pB = "Personal Bests";
const eP = "Elo Progression";
const { data: player } = await useFetch(
    `/api/player/?player=${route.params.player}&initialLoad=true`,
);
const competitions = ref<ICompetition[]>(
    (await useNavigatorInfo().getCompetitions()) as ICompetition[],
);
const { data: avatar } = await useFetch(
    `/api/player/avatar?player=${route.params.player}`,
);
const { data: statistics } = await useFetch(
    `/api/player/statistics?player=${player.value?.uuid}`,
    { default: emptyStatistics },
);
const { data: matches } = await useFetch<IMatch[]>(
    `/api/matches?player=${player.value?.uuid}`,
    { default: () => [] },
);
const { data: placements } = await useFetch(
    `/api/competitions/placements?player=${player.value?.uuid}`,
    { default: () => [] },
);

const stillLoading = ref(player.value?.shouldRetry ?? false);

const wtl = computed(() => {
    return `${statistics.value.winTieLoss.w}-${statistics.value.winTieLoss.t}-${statistics.value.winTieLoss.l}`;
});

const pickedMaps = computed(() => {
    const maps: number[] = [];

    for (const map of getAllMaps()) {
        const currentAmount = statistics.value.mapsPicked[map];
        const totalAmount = Math.floor(currentAmount / 4) + currentAmount;
        for (let i = 0; i < totalAmount; i++) {
            maps.push(map);
        }
    }

    return maps;
});

useSeoMeta({
    ogTitle: () => `${route.params.player} - RRStats`,
    ogDescription: () =>
        `${player.value?.accolade} - ${Math.round(
            (statistics.value?.winrate ?? 0) * 100,
        )}% - ${wtl.value}`,
    ogImage: () => avatar.value,
    ogType: "website",
    twitterCard: "summary",
});

onMounted(async () => {
    if (player.value?.shouldRetry) {
        const playerRequest = await $fetch(`/api/player/`, {
            query: { player: route.params.player },
        });
        const statisticsRequest = await $fetch(
            `/api/player/statistics?player=${player.value.uuid}`,
        );

        player.value = playerRequest;
        statistics.value = statisticsRequest;
        stillLoading.value = false;
    }
});
</script>
