<template>
    <div>
        <MapBackground />

        <div class="grid grid-cols-2 gap-y-5 gap-x-1 md:gap-x-5 md:mx-10 my-5">
            <AutocompleteComponent
                :suggestions="players ?? []"
                placeholder="Left player"
                :default-text="leftPlayerRaw"
                @confirm="(val) => (leftPlayer = val)"
            />

            <AutocompleteComponent
                :suggestions="players ?? []"
                placeholder="Right player"
                :default-text="rightPlayerRaw"
                @confirm="(val) => (rightPlayer = val)"
            />

            <div class="text-center">
                <FontAwesomeIcon
                    v-if="leftPlayerLoading"
                    :icon="['fas', 'spinner']"
                    class="animate-spin"
                    size="2x"
                />
            </div>

            <div class="text-center">
                <FontAwesomeIcon
                    v-if="rightPlayerLoading"
                    :icon="['fas', 'spinner']"
                    class="animate-spin"
                    size="2x"
                />
            </div>

            <div>
                <ComparingPlayer
                    v-if="leftPlayerObject !== null"
                    :player="leftPlayerObject.player"
                    :player-avatar="leftPlayerObject.avatar"
                    :player-statistics="leftPlayerObject.statistics"
                    :comparing-statistics="rightPlayerObject?.statistics"
                />
            </div>

            <div>
                <ComparingPlayer
                    v-if="rightPlayerObject !== null"
                    :reverse="true"
                    :player="rightPlayerObject.player"
                    :player-avatar="rightPlayerObject.avatar"
                    :player-statistics="rightPlayerObject.statistics"
                    :comparing-statistics="leftPlayerObject?.statistics"
                />
            </div>

            <TabbedContainer
                v-if="leftPlayerObject !== null || rightPlayerObject !== null"
                class="col-span-2"
                :tabs="['Season 1', 'Season 2', 'Season 3']"
                @change-tab="(val) => (selectedSeason = val)"
            />

            <MapComparison
                v-if="leftPlayerObject !== null"
                class="col-span-2 md:col-span-1"
                :maps="comparingMaps"
                :statistics="leftPlayerObject.statistics"
                :comparing-statistics="rightPlayerObject?.statistics"
            />

            <MapComparison
                v-if="rightPlayerObject !== null"
                class="col-span-2 md:col-span-1"
                :maps="comparingMaps"
                :statistics="rightPlayerObject.statistics"
                :comparing-statistics="leftPlayerObject?.statistics"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IMatch } from "~/utils/interfaces/IMatch";
import type { IPlayer, IPlayerStatistics } from "~/utils/interfaces/IPlayer";
import type { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";

interface ComparisonData {
    player: IPlayer;
    matches: IMatch[];
    avatar: string;
    placements: ICompetitionPlacement[];
    statistics: IPlayerStatistics;
}

useHead({
    title: "Comparison - RRStats",
});

const { data: players } = await useFetch<string[]>("/api/player/list");
const route = useRoute();

const leftPlayerRaw = ref("");
const rightPlayerRaw = ref("");
const leftPlayer = ref("");
const rightPlayer = ref("");

const leftPlayerObject: Ref<ComparisonData | null> = ref(null);
const rightPlayerObject: Ref<ComparisonData | null> = ref(null);
const leftPlayerLoading = ref(false);
const rightPlayerLoading = ref(false);

const selectedSeason = ref("Season 1");

onMounted(async () => {
    if (route.query.leftPlayer !== undefined) {
        leftPlayer.value = route.query.leftPlayer as string;
        leftPlayerRaw.value = leftPlayer.value;
    }
    if (route.query.rightPlayer !== undefined) {
        rightPlayer.value = route.query.rightPlayer as string;
        rightPlayerRaw.value = rightPlayer.value;
    }
});

watch(leftPlayer, async () => {
    leftPlayerLoading.value = true;
    leftPlayerObject.value = await getComparisonData(leftPlayer.value);
    leftPlayerLoading.value = false;
    const currentQuery = new URLSearchParams(window.location.search);
    currentQuery.set("leftPlayer", leftPlayer.value);
    const newPath = window.location.pathname + "?" + currentQuery.toString();
    await navigateTo(newPath, { replace: true });
});
watch(rightPlayer, async () => {
    rightPlayerLoading.value = true;
    rightPlayerObject.value = await getComparisonData(rightPlayer.value);
    rightPlayerLoading.value = false;
    const currentQuery = new URLSearchParams(window.location.search);
    currentQuery.set("rightPlayer", rightPlayer.value);
    const newPath = window.location.pathname + "?" + currentQuery.toString();
    await navigateTo(newPath, { replace: true });
});

async function getComparisonData(
    player: string,
): Promise<ComparisonData | null> {
    if (player === "") {
        return null;
    }
    try {
        const playerData = await $fetch(`/api/player/?player=${player}`);
        const avatar = await $fetch(`/api/player/avatar?player=${player}`);
        const statistics = await $fetch(
            `/api/player/statistics?player=${playerData.uuid}`,
        );
        return {
            player: playerData as IPlayer,
            matches: playerData.matches,
            avatar: avatar,
            placements: playerData.placements,
            statistics: statistics,
        };
    } catch {
        return null;
    }
}

const comparingMaps = computed(() => {
    if (selectedSeason.value === "Season 1") {
        return [
            HitmanMap.PARIS,
            HitmanMap.SAPIENZA,
            HitmanMap.MARRAKESH,
            HitmanMap.BANGKOK,
            HitmanMap.COLORADO,
            HitmanMap.HOKKAIDO,
        ];
    }
    if (selectedSeason.value === "Season 2") {
        return [
            HitmanMap.MIAMI,
            HitmanMap.SANTA_FORTUNA,
            HitmanMap.MUMBAI,
            HitmanMap.WHITTLETON_CREEK,
            HitmanMap.ISLE_OF_SGAIL,
            HitmanMap.NEW_YORK,
            HitmanMap.HAVEN_ISLAND,
        ];
    }
    if (selectedSeason.value === "Season 3") {
        return [
            HitmanMap.DUBAI,
            HitmanMap.DARTMOOR,
            HitmanMap.BERLIN,
            HitmanMap.CHONGQING,
            HitmanMap.MENDOZA,
            HitmanMap.AMBROSE_ISLAND,
        ];
    }
    return [];
});
</script>
