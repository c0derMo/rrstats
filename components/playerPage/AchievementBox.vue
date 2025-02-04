<template>
    <div
        class="rounded bg-gray-700 bg-opacity-50 text-center py-2 hover:bg-gray-600 transition duration-500"
        :class="{
            'completed-shadow-plat': completedAll && tier === 3,
            'completed-shadow': completedAll && tier !== 3,
        }"
        @click="$emit('click')"
    >
        <div class="relative mx-auto w-fit">
            <!-- Circles not there, filling inside out -->
            <div
                v-if="achievedLevel > 4"
                class="rounded-full bg-gray-900 w-16 h-16 translate-x-[-5.5rem] scale-[70%] absolute"
            >
                <FontAwesomeIcon
                    :icon="['fas', 'trophy']"
                    :style="getColorOfTier(achievement.tier[achievedLevel - 5])"
                    class="!h-8 mt-4 opacity-50"
                />
            </div>

            <div
                v-if="achievedLevel > 2"
                class="rounded-full bg-gray-900 w-16 h-16 -translate-x-16 scale-[80%] absolute z-10"
            >
                <FontAwesomeIcon
                    :icon="['fas', 'trophy']"
                    :style="getColorOfTier(achievement.tier[achievedLevel - 3])"
                    class="!h-8 mt-4 opacity-50"
                />
            </div>

            <div
                v-if="achievedLevel > 0"
                class="rounded-full bg-gray-900 w-16 h-16 -translate-x-8 scale-90 absolute z-20"
            >
                <FontAwesomeIcon
                    :icon="['fas', 'trophy']"
                    :style="getColorOfTier(achievement.tier[achievedLevel - 1])"
                    class="!h-8 mt-4 opacity-50"
                />
            </div>

            <div
                v-if="achievedLevel > 1"
                class="rounded-full bg-gray-900 w-16 h-16 translate-x-8 scale-90 absolute z-20"
            >
                <FontAwesomeIcon
                    :icon="['fas', 'trophy']"
                    :style="getColorOfTier(achievement.tier[achievedLevel - 2])"
                    class="!h-8 mt-4 opacity-50"
                />
            </div>

            <div
                v-if="achievedLevel > 3"
                class="rounded-full bg-gray-900 w-16 h-16 translate-x-16 scale-[80%] absolute z-10"
            >
                <FontAwesomeIcon
                    :icon="['fas', 'trophy']"
                    :style="getColorOfTier(achievement.tier[achievedLevel - 4])"
                    class="!h-8 mt-4 opacity-50"
                />
            </div>

            <div
                v-if="achievedLevel > 5"
                class="rounded-full bg-gray-900 w-16 h-16 translate-x-[5.5rem] scale-[70%] absolute"
            >
                <FontAwesomeIcon
                    :icon="['fas', 'trophy']"
                    :style="getColorOfTier(achievement.tier[achievedLevel - 6])"
                    class="!h-8 mt-4 opacity-50"
                />
            </div>

            <div class="rounded-full bg-gray-900 w-16 h-16 z-30 relative">
                <FontAwesomeIcon
                    :icon="['fas', 'trophy']"
                    :style="getColorOfTier(tier)"
                    class="!h-8 mt-4"
                />
            </div>

            <div
                v-if="achievedLevel >= 0 && achievement.levels > 1"
                class="rounded-full bg-white w-4 h-4 absolute z-30 bottom-0 right-0 text-black text-xs"
            >
                {{ numberToRoman(achievedLevel + 1) }}
            </div>
        </div>
        <div>{{ title }}</div>
        <div class="italic mb-3 min-h-12">{{ description }}</div>

        <div v-if="completedAll" class="italic">
            Achieved at
            {{
                DateTime.fromMillis(lastCompletion)
                    .setLocale(useLocale().value)
                    .toLocaleString(DateTime.DATETIME_MED)
            }}
        </div>
        <TooltipComponent v-else-if="currentProgress > 0">
            <div class="italic flex flex-row mx-5 gap-3 h-5">
                <div
                    class="relative h-1 w-full flex-grow bg-gray-900 rounded-full mt-2"
                >
                    <div
                        class="h-1 rounded-full left-0 top-0 absolute bg-blue-700"
                        :style="`width: ${currentProgress * 100}%`"
                    />
                </div>
            </div>
            <template #tooltip>
                Progress: {{ (currentProgress * 100).toFixed(2) }}%
            </template>
        </TooltipComponent>
        <div v-else class="italic">
            not achieved
            <span v-if="achievement.manual"> (click to submit) </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type { AchievementInfo } from "~/utils/interfaces/AchievementInfo";

const props = defineProps<{
    achievement: AchievementInfo;
}>();
defineEmits<{
    click: [];
}>();

const achievedLevel = computed(() => {
    return props.achievement.achievedAt.findLastIndex((v) => v > 0);
});

const title = computed(() => {
    if (props.achievement.levels <= 1) {
        return props.achievement.name;
    }
    if (achievedLevel.value < 0) {
        return props.achievement.name;
    } else if (achievedLevel.value === props.achievement.levels - 1) {
        return (
            props.achievement.name +
            " " +
            numberToRoman(props.achievement.levels)
        );
    } else {
        return (
            props.achievement.name +
            " " +
            numberToRoman(achievedLevel.value + 2)
        );
    }
});

const description = computed(() => {
    if (achievedLevel.value < 0) {
        return props.achievement.description[0];
    }
    if (achievedLevel.value === props.achievement.levels - 1) {
        return props.achievement.description[props.achievement.levels - 1];
    }
    return props.achievement.description[achievedLevel.value + 1];
});

const tier = computed(() => {
    if (achievedLevel.value < 0) {
        return -1;
    }
    return props.achievement.tier[achievedLevel.value];
});

const completedAll = computed(() => {
    return achievedLevel.value === props.achievement.levels - 1;
});

const lastCompletion = computed(() => {
    return props.achievement.achievedAt[props.achievement.levels - 1];
});

const currentProgress = computed(() => {
    return props.achievement.progress[achievedLevel.value + 1] ?? 1;
});
</script>

<style scoped>
.completed-shadow-plat {
    box-shadow: inset 0 2px 10px 0 #ca8a04;
}
.completed-shadow {
    box-shadow: inset 0 2px 10px 0 #ffffff;
}
</style>
