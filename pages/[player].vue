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
                                alt="Player Profile Picture"
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
                            <h1 class="text-5xl">{{ route.params.player }}</h1>
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
                            <span class="italic opacity-75">Winrate: </span
                            ><span class="text-2xl"
                                >{{ Math.round(winrate * 100) }}%</span
                            ><br />
                            <span class="italic opacity-75">Map-Winrate: </span
                            ><span class="text-2xl"
                                >{{ Math.round(mapWinrate * 100) }}%</span
                            ><br />
                            <template v-if="debut !== undefined">
                                <span class="italic opacity-75">Debut: </span
                                ><span class="text-2xl"
                                    >{{
                                        DateTime.fromMillis(debut.timestamp)
                                            .setLocale(useLocale().value)
                                            .toLocaleString(DateTime.DATE_SHORT)
                                    }}
                                    ({{ debut.competition }})</span
                                >
                            </template>
                        </div>
                    </div>
                </CardComponent>
            </div>

            <CardComponent class="flex md:flex-row w-3/5 mx-auto flex-col">
                <div class="flex-grow md:text-left text-center md:pl-10">
                    Best RR Placement: {{ bestPlacement }}
                </div>
                <div
                    class="flex-grow text-center md:border-x border-neutral-500"
                >
                    Maps played:
                    {{
                        player?.matches
                            .map((m) => m.playedMaps.length)
                            .reduce((prev, cur) => prev + cur, 0) || 0
                    }}
                </div>
                <div
                    class="flex-grow text-center md:border-x border-neutral-500"
                >
                    Matches played: {{ player?.matches.length || 0 }}
                </div>
                <div class="flex-grow md:text-right text-center md:pr-10">
                    W-T-L: {{ wtl }}
                </div>
            </CardComponent>

            <div class="flex 2xl:flex-row gap-5 flex-col-reverse">
                <CardComponent class="2xl:w-fit w-full overflow-x-visible">
                    <TabbedContainer
                        :tabs="['Competitions', 'Opponents', 'Records']"
                    >
                        <template #Competitions>
                            <CompetitionsTable
                                :placements="player?.placements"
                                :competitions="player?.competitions"
                            />
                        </template>
                        <template #Opponents>
                            <OpponentsTable
                                :matches="player?.matches || []"
                                :local-player="player?.uuid || ''"
                                :opponents="player?.opponents || {}"
                            />
                        </template>
                        <template #Records>
                            <PlayerRecordsList :player="player?.uuid || ''" />
                        </template>
                    </TabbedContainer>
                </CardComponent>
                <CardComponent class="flex-grow overflow-x-visible relative">
                    <IndefiniteProgressBar
                        v-if="stillLoading"
                        class="mb-2 absolute top-0 left-0"
                    />
                    <MatchList
                        :matches="player?.matches as IMatch[]"
                        :players="player?.opponents"
                        :local-player="player?.uuid || ''"
                    />
                </CardComponent>
            </div>

            <CardComponent class="!overflow-visible">
                <TabbedContainer :tabs="['Maps', 'Time Heatmap']">
                    <template #Maps>
                        <PlayerMapList
                            :matches="player?.matches || []"
                            :local-player="player?.uuid || ''"
                            :competitions="competitions || []"
                        />
                    </template>
                    <template #[tH]>
                        <PlaytimeHeatmap :matches="player?.matches || []" />
                    </template>
                </TabbedContainer>
            </CardComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import { IMatch } from "~/utils/interfaces/IMatch";
import { bestRRPlacement } from "~/utils/statCalculators/competitionStatCalculators";
import {
    mapsPicked,
    mapWinrate as getMapWinrate,
} from "~/utils/statCalculators/mapStatCalculators";
import {
    calculateWTL,
    calculateWinrate,
    debutMatch,
} from "~/utils/statCalculators/matchStatCalculators";

const route = useRoute();

useHead({
    title: `${route.params.player} - RRStats`,
});

const tH = "Time Heatmap";
const player = ref(
    (
        await useFetch(
            `/api/player/?player=${route.params.player}&initialLoad=true`,
        )
    ).data.value,
);
const competitions = (await useFetch("/api/competitions/list")).data;
const avatar = (
    await useFetch(`/api/player/avatar?player=${route.params.player}`)
).data;
const stillLoading = ref(player.value?.shouldRetry ?? false);

const wtl = computed(() => {
    const wtl = calculateWTL(
        player.value?.matches ?? [],
        player.value?.uuid ?? "",
    );

    return `${wtl.w}-${wtl.t}-${wtl.l}`;
});

const winrate = computed(() => {
    if (player.value === null || player.value.matches.length <= 0) {
        return 0;
    }

    return calculateWinrate(player.value.matches, player.value.uuid ?? "");
});

const mapWinrate = computed(() => {
    if (player.value === null || player.value.matches.length <= 0) {
        return 0;
    }

    return getMapWinrate(player.value.matches, player.value.uuid ?? "");
});

const pickedMaps = computed(() => {
    if (player.value?.matches === undefined) {
        return undefined;
    }

    const maps = mapsPicked(player.value.matches, player.value.uuid ?? "");
    for (const map of getAllMaps()) {
        const currentAmount = maps.filter((m) => m === map).length;
        const biasIncrease = Math.floor(currentAmount / 4);
        for (let i = 0; i < biasIncrease; i++) {
            maps.push(map);
        }
    }

    return maps;
});

const debut = computed(() => {
    if (player.value?.matches === undefined) {
        return undefined;
    }

    return debutMatch(player.value.matches);
});

const bestPlacement = computed(() => {
    if (player.value?.placements == null) {
        return "n/a";
    }

    const placement = bestRRPlacement(
        player.value.placements,
        competitions.value!,
    );
    if (placement !== undefined) {
        return formatPlacement(placement);
    } else {
        return "n/a";
    }
});

useSeoMeta({
    ogTitle: () => `${route.params.player} - RRStats`,
    ogDescription: () =>
        `${player.value?.accolade} - ${Math.round(winrate.value * 100)}% - ${
            wtl.value
        }`,
    ogImage: () => avatar.value,
    ogType: "website",
    twitterCard: "summary",
});

onMounted(async () => {
    if (player.value?.shouldRetry) {
        const playerRequest = await $fetch(`/api/player/`, {
            query: { player: route.params.player },
        });

        player.value = playerRequest;
        stillLoading.value = false;
    }
});
</script>
