<template>
    <AchievementDetailDialog
        v-if="openedAchievement != null"
        :achievement="openedAchievement"
        :player="player"
        @closed="openedAchievement = null"
    />
    <template v-for="category of Object.values(AchievementCategory)" :key="category">
        <div
            class="flex flex-row gap-3 my-1 rounded-md hover:bg-gray-700 transition py-2 px-2"
            @click="toggleCategory(category)"
        >
            <div class="flex-grow border-b -translate-y-1/2 border-gray-600" />
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
            <div class="flex-grow border-b -translate-y-1/2 border-gray-600" />
        </div>
        <div
            class="grid grid-cols-6 gap-x-5 gap-y-2 overflow-hidden transition-all max-h-[999px]"
            :class="{
                '!max-h-0': !expandedRows.includes(category),
            }"
        >
            <AchievementBox
                v-for="(achievement, key) of getAchievementsInCategory(
                    category,
                )"
                :key="key"
                :achievement="achievement"
                @click="openedAchievement = achievement"
            />
        </div>
    </template>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { AchievementInfo } from "~/utils/interfaces/AchievementInfo";
import { AchievementCategory } from "~/utils/interfaces/AchievementInfo";

const props = defineProps<{
    player: string;
}>();

const { data: achievements } = await useFetch(
    `/api/player/achievements?player=${props.player}`,
    {
        default: () => [],
    },
);

const openedAchievement = ref<AchievementInfo | null>(null);
const expandedRows = ref<AchievementCategory[]>([
    ...(Object.values(AchievementCategory) as AchievementCategory[]),
]);

// TODO: Remove this!
const testingAchievements = [
    { ...achievements.value[0], achievedAt: [0, 0, 0, 0, 0, 0, 0] },
    { ...achievements.value[0], achievedAt: [1, 0, 0, 0, 0, 0, 0] },
    { ...achievements.value[0], achievedAt: [1, 1, 0, 0, 0, 0, 0] },
    { ...achievements.value[0], achievedAt: [1, 1, 1, 0, 0, 0, 0] },
    { ...achievements.value[0], achievedAt: [1, 1, 1, 1, 0, 0, 0] },
    { ...achievements.value[0], achievedAt: [1, 1, 1, 1, 1, 0, 0] },
    { ...achievements.value[0], achievedAt: [1, 1, 1, 1, 1, 1, 0] },
    { ...achievements.value[0], achievedAt: [1, 1, 1, 1, 1, 1, 1] },
    ...achievements.value,
];

function getAchievementsInCategory(
    category: AchievementCategory,
): AchievementInfo[] {
    return testingAchievements.filter((achievement) => {
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
</script>
