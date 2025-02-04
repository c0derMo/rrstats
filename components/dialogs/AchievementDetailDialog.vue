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
                            <div
                                v-if="achievement.levels > 1"
                                class="font-bold"
                            >
                                Level {{ tier }}
                            </div>
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
                        <div v-else>not achieved</div>
                    </div>
                </template>
            </div>

            <template
                v-if="
                    achievement.manual &&
                    achievement.achievedAt[achievement.levels - 1] <= 0
                "
            >
                <div class="w-full border-b border-gray-600 my-6" />

                <div class="flex flex-col gap-2">
                    <div class="text-center font-bold">
                        Submit achievement completion:
                    </div>
                    <div>
                        If you believe this player has completed the
                        achievement, please link a video
                        <span class="font-bold">with timestamp</span>
                        of the completion below.<br />
                        The achievement will be manually reviewed and added to
                        the profile afterwards. This may take a bit of time.
                    </div>
                    <TextInputComponent
                        v-model="completionLink"
                        placeholder="Video with timestamp"
                    />
                    <TextInputComponent
                        v-model="completionText"
                        placeholder="Additional notes (optional)"
                    />
                    <div class="flex flex-row gap-3">
                        <ButtonComponent :loading="loading" @click="submit">
                            Submit
                        </ButtonComponent>
                        <span v-if="videoError" class="text-red-500">
                            Please enter a valid URL into the video field.
                        </span>
                        <span v-if="submitError" class="text-red-500">
                            There was an error with your submission. Please try
                            again later.
                        </span>
                        <span v-if="submitSuccess" class="text-green-500">
                            Achievement successfully submitted!
                        </span>
                    </div>
                </div>
            </template>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type { AchievementInfo } from "~/utils/interfaces/AchievementInfo";

const props = defineProps<{
    achievement: AchievementInfo;
    player: string;
}>();

defineEmits<{
    closed: [];
}>();

const dialogOpen = ref(true);
const completionLink = ref("");
const completionText = ref("");
const loading = ref(false);
const videoError = ref(false);
const submitError = ref(false);
const submitSuccess = ref(false);

function getColorOfTierOrUnachieved(tier: number, achievedAt: number) {
    if (achievedAt <= 0) {
        return { color: "#4f4f4f" };
    }
    return getColorOfTier(tier);
}

async function submit() {
    videoError.value = false;
    submitError.value = false;
    submitSuccess.value = false;
    loading.value = true;

    try {
        new URL(completionLink.value);
    } catch {
        loading.value = false;
        videoError.value = true;
        return;
    }

    try {
        await $fetch("/api/achievements/submit", {
            method: "POST",
            body: {
                player: props.player,
                achievement: props.achievement.name,
                video: completionLink.value,
                notes: completionText.value,
            },
        });
        submitSuccess.value = true;
    } catch {
        submitError.value = true;
    } finally {
        loading.value = false;
    }
}
</script>
