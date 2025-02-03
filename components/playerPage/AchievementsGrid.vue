<template>
    <AchievementDetailDialog
        v-if="openedAchievement != null"
        :achievement="openedAchievement"
        @closed="openedAchievement = null"
    />
    <div class="grid grid-cols-6 gap-x-5 gap-y-2">
        <AchievementBox
            v-for="(achievement, key) of testingAchievements"
            :key="key"
            :achievement="achievement"
            @click="openedAchievement = achievement"
        />
    </div>
</template>

<script setup lang="ts">
import type { AchievementInfo } from "~/utils/interfaces/AchievementInfo";

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
</script>
