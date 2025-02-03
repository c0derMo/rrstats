<template>
    <DialogComponent
        :open="dialogOpen"
        @click-outside="dialogOpen = false"
        @closed="$emit('closed')"
    >
        <CardComponent>
            <h1 class="text-2xl text-center mb-5">
                Achievement: {{ achievement.name }}
            </h1>
            <div class="grid grid-cols-2 gap-x-28 gap-y-3">
                <template v-for="tier in achievement.levels" :key="tier">
                    <div class="flex flex-row gap-2 items-center">
                        <FontAwesomeIcon
                            :icon="['fas', 'trophy']"
                            :style="
                                getColorOfTierOrUnachieved(
                                    achievement.tier[tier - 1],
                                    achievement.achievedAt[tier - 1],
                                )
                            "
                            class="!h-8"
                        />
                        <div>
                            <div class="font-bold">Level {{ tier }}</div>
                            <div class="italic">
                                {{ achievement.description[tier - 1] }}
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div v-if="achievement.achievedAt[tier - 1] > 0">
                            Achieved at
                            {{
                                DateTime.fromMillis(
                                    achievement.achievedAt[tier - 1],
                                )
                                    .setLocale(useLocale().value)
                                    .toLocaleString(DateTime.DATETIME_MED)
                            }}
                        </div>
                        <div v-else-if="achievement.progress[tier - 1] > 0">
                            <div class="flex flex-col gap-3 h-5">
                                <div
                                    class="relative h-1 w-full flex-grow bg-gray-600 rounded-full mt-2 flex-shrink-0"
                                >
                                    <div
                                        class="h-1 rounded-full left-0 top-0 absolute bg-blue-700"
                                        :style="`width: ${achievement.progress[tier - 1] * 100}%`"
                                    />
                                </div>
                                <div>
                                    Progress:
                                    {{
                                        (
                                            achievement.progress[tier - 1] * 100
                                        ).toFixed(2)
                                    }}%
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type { AchievementInfo } from "~/utils/interfaces/AchievementInfo";

defineProps<{
    achievement: AchievementInfo;
}>();

defineEmits<{
    closed: [];
}>();

const dialogOpen = ref(true);

function getColorOfTierOrUnachieved(tier: number, achievedAt: number) {
    if (achievedAt <= 0) {
        return { color: "#4f4f4f" };
    }
    return getColorOfTier(tier);
}
</script>
