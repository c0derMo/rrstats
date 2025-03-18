<template>
    <div>
        <AchievementDetailDialog
            v-if="openedAchievement != null"
            :achievement="openedAchievement"
            :player="player"
            @closed="openedAchievement = null"
        />
        <div v-if="loading" class="mx-auto w-fit">
            <FontAwesomeIcon
                :icon="['fa', 'spinner']"
                class="animate-spin text-5xl"
            />
        </div>
        <div v-else>
            <div
                class="flex flex-col md:flex-row justify-center gap-5 items-center"
            >
                <SwitchComponent
                    id="achievementsHideMissing"
                    v-model="hideMissing"
                    label="Hide missing"
                />
                <SwitchComponent
                    id="achievementsHideCompleted"
                    v-model="hideCompleted"
                    label="Hide completed"
                />
                <TextInputComponent v-model="search" placeholder="Search" />
                <DropdownComponent v-model="sort" :items="sortingOptions" />
                <SwitchComponent
                    id="achievementsGroup"
                    v-model="groupCategories"
                    label="Group by categories"
                />
            </div>

            <template v-if="groupCategories">
                <template
                    v-for="category of Object.values(AchievementCategory)"
                    :key="category"
                >
                    <div
                        class="flex flex-row gap-3 my-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition py-2 px-2"
                        @click="toggleCategory(category)"
                    >
                        <div
                            class="flex-grow border-b -translate-y-1/2 border-gray-600"
                        />
                        <Tag
                            narrow
                            :color="getColorOfAchievementCategory(category)"
                            class="text-gray-800 italic"
                            >{{ category }}</Tag
                        >
                        <FontAwesomeIcon
                            class="mt-1 transition"
                            :icon="['fas', 'chevron-up']"
                            :class="{
                                'rotate-180': !expandedRows.includes(category),
                            }"
                        />
                        <div
                            class="flex-grow border-b -translate-y-1/2 border-gray-600"
                        />
                    </div>
                    <div
                        class="grid grid-cols-2 gap-x-5 gap-y-2 overflow-hidden transition-all max-h-[2200px] md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 duration-200"
                        :class="{
                            '!max-h-0': !expandedRows.includes(category),
                        }"
                    >
                        <AchievementBox
                            v-for="(
                                achievement, key
                            ) of getAchievementsInCategory(category)"
                            :key="key"
                            :achievement="achievement"
                            @click="openedAchievement = achievement"
                        />
                    </div>
                </template>
            </template>

            <div
                v-else
                class="grid grid-cols-2 gap-x-5 gap-y-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mt-5"
            >
                <AchievementBox
                    v-for="(achievement, key) of filteredSortedAchievements"
                    :key="key"
                    :achievement="achievement"
                    @click="openedAchievement = achievement"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
    type AchievedAchievement,
    AchievementCategory,
} from "~/utils/interfaces/AchievementInfo";
import ld from "lodash";

const props = defineProps<{
    player: string;
}>();

const sortingOptions = ["Sort by name", "Sort by rarity", "Sort by completion"];

const loading = ref(true);
const achievements = ref<AchievedAchievement[]>([]);
const achievementCompletions = ref<Record<string, number[]>>({});
const sort = ref(sortingOptions[2]);
const search = ref("");
const hideCompleted = ref(false);
const hideMissing = ref(false);
const groupCategories = ref(true);

const openedAchievement = ref<AchievedAchievement | null>(null);
const expandedRows = ref<AchievementCategory[]>([
    ...(Object.values(AchievementCategory) as AchievementCategory[]),
]);

const filteredSortedAchievements = computed(() => {
    let result = [...achievements.value];

    if (hideMissing.value) {
        result = result.filter(
            (achievement) => ld.last(achievement.achievedAt)! > 0,
        );
    }
    if (hideCompleted.value) {
        result = result.filter(
            (achievement) => ld.last(achievement.achievedAt)! <= 0,
        );
    }

    if (search.value.length > 0) {
        result = result.filter((achievement) =>
            achievement.name.includes(search.value),
        );
    }

    switch (sort.value) {
        case sortingOptions[0]: // Sort by name
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case sortingOptions[1]: // Sort by rarity
            result.sort((a, b) => {
                const currentStageA = Math.max(
                    0,
                    a.achievedAt.findLastIndex((a) => a > 0),
                );
                const currentStageB = Math.max(
                    0,
                    b.achievedAt.findLastIndex((a) => a > 0),
                );
                if (a.tier[currentStageA] !== b.tier[currentStageB]) {
                    return b.tier[currentStageB] - a.tier[currentStageA];
                }

                if (ld.last(a.achievedAt)! > 0 && ld.last(b.achievedAt)! <= 0) {
                    return -1;
                }
                if (ld.last(b.achievedAt)! > 0 && ld.last(a.achievedAt)! <= 0) {
                    return 1;
                }
                if (
                    a.achievedAt.some((v) => v > 0) &&
                    b.achievedAt.every((v) => v <= 0)
                ) {
                    return -1;
                }
                if (
                    b.achievedAt.some((v) => v > 0) &&
                    a.achievedAt.every((v) => v <= 0)
                ) {
                    return 1;
                }

                const completionRateA =
                    achievementCompletions.value[a.name]?.[currentStageA] ?? 0;
                const completionRateB =
                    achievementCompletions.value[b.name]?.[currentStageB] ?? 0;

                return completionRateA - completionRateB;
            });
            break;
        case sortingOptions[2]: // Sort by completion
            result.sort((a, b) => {
                if (ld.last(a.achievedAt)! > 0 || ld.last(b.achievedAt)! > 0) {
                    return ld.last(b.achievedAt)! - ld.last(a.achievedAt)!;
                }

                const currentStageA = Math.max(
                    0,
                    a.achievedAt.findLastIndex((a) => a <= 0),
                );
                const currentStageB = Math.max(
                    0,
                    b.achievedAt.findLastIndex((b) => b <= 0),
                );

                return (
                    b.progression[currentStageB] - a.progression[currentStageA]
                );
            });
            break;
    }

    return result;
});

function getAchievementsInCategory(
    category: AchievementCategory,
): AchievedAchievement[] {
    return filteredSortedAchievements.value.filter((achievement) => {
        return achievement.category === category;
    });
}

function toggleCategory(category: AchievementCategory) {
    if (expandedRows.value.includes(category)) {
        expandedRows.value = expandedRows.value.filter((e) => e !== category);
    } else {
        expandedRows.value.push(category);
    }
}

onMounted(async () => {
    const newAchievements = await $fetch<AchievedAchievement[]>(
        `/api/achievements/player?player=${props.player}`,
    );
    achievements.value = newAchievements ?? [];
    const globalCompletion = await $fetch("/api/achievements/statistics");
    achievementCompletions.value = globalCompletion ?? {};
    loading.value = false;
});
</script>
