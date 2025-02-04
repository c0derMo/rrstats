<template>
    <div>
        <AchievementDetailDialog
            v-if="viewedAchievement != null"
            :achievement="viewedAchievement"
            :player="playerLookup.getUUID(player)"
            @closed="viewedAchievement = null"
        />
        <DialogComponent
            v-if="achievementToVerify != null"
            :open="true"
            @click-outside="achievementToVerify = null"
        >
            <CardComponent class="flex flex-col gap-3">
                <TextInputComponent
                    v-model="achievementDatetime"
                    type="datetime-local"
                    placeholder="Datetime of achievement"
                />
                <ButtonComponent @click="verifyAchievement(achievementToVerify)">
                    Verify
                </ButtonComponent>
            </CardComponent>
        </DialogComponent>

        <div class="text-3xl bold my-5">Achievements</div>

        <TabbedContainer :tabs="tabs" class="my-5">
            <template #[tabs[0]]>
                <DataTableComponent
                    :headers="unverifiedTableHeaders"
                    :rows="unverifiedAchievements"
                    :rows-per-page="[10, 25, 50]"
                    :selected-rows-per-page="10"
                >
                    <template #player="{ value }">
                        {{ playerLookup.get(value) }}
                    </template>

                    <template #data="{ value }">
                        <div class="flex flex-col">
                            <a
                                :href="value.video"
                                target="_blank"
                                class="text-blue-300 underline"
                            >
                                {{ value.video }}^
                            </a>
                            <span class="italic">{{ value.notes }}</span>
                        </div>
                    </template>

                    <template #more="{ row }">
                        <ButtonComponent @click="achievementToVerify = row">
                            <FontAwesomeIcon
                                :icon="['fas', 'check']"
                                class="text-green-500"
                            />
                        </ButtonComponent>
                        <ButtonComponent
                            confirm-button
                            @click="rejectAchievement(row)"
                        >
                            <FontAwesomeIcon
                                :icon="['fas', 'xmark']"
                                class="text-red-500"
                            />
                        </ButtonComponent>
                        <ButtonComponent>
                            <FontAwesomeIcon :icon="['fas', 'pen']" />
                        </ButtonComponent>
                    </template>
                </DataTableComponent>
            </template>

            <template #[tabs[1]]>
                <div>
                    <TextInputComponent
                        v-model="player"
                        placeholder="Player"
                        :error="playerError"
                    />

                    <DataTableComponent
                        :headers="playerAchievmentHeaders"
                        :rows="playerAchievements"
                    >
                        <template #description="{ row }">
                            {{
                                row.description[
                                    Math.max(
                                        0,
                                        row.achievedAt.findLastIndex(
                                            (i) => i > 0,
                                        ),
                                    )
                                ]
                            }}
                        </template>

                        <template #level="{ row }">
                            {{ row.achievedAt.findLastIndex((i) => i > 0) + 1 }}
                        </template>

                        <template #more="{ row }">
                            <ButtonComponent @click="viewedAchievement = row">
                                <FontAwesomeIcon
                                    :icon="['fas', 'magnifying-glass']"
                                />
                            </ButtonComponent>
                            <ButtonComponent>
                                <FontAwesomeIcon :icon="['fas', 'pen']" />
                            </ButtonComponent>
                        </template>
                    </DataTableComponent>
                </div>
            </template>
        </TabbedContainer>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type {
    AchievementInfo,
    SubmittedAchievement,
} from "~/utils/interfaces/AchievementInfo";

type DataType = {
    video: string;
    note?: string;
};

type ExtendedSubmittedAchievement = SubmittedAchievement & {
    description: string;
    data: DataType;
};

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
    pageTitle: "Achievements",
});

const tabs = ["Unverified achievements", "Achievements of player"];

const playerLookup = usePlayers();
const player = ref("");
const achievementToVerify = ref<ExtendedSubmittedAchievement | null>(null);
const achievementDatetime = ref(
    DateTime.now()
        .set({ second: 0, millisecond: 0 })
        .toISO({
            suppressMilliseconds: true,
            suppressSeconds: true,
            includeOffset: false,
        }),
);
const { data: unverifiedAchievements } = await useFetch<
    ExtendedSubmittedAchievement[]
>("/api/achievements/unverified", { default: () => [] });
const playerAchievements = ref<AchievementInfo[]>([]);
const viewedAchievement = ref<AchievementInfo | null>(null);

await playerLookup.queryAll();

const unverifiedTableHeaders = [
    { key: "player", title: "Player" },
    { key: "achievement", title: "Achievement" },
    { key: "description", title: "Description" },
    { key: "data", title: "Info" },
    { key: "more", title: "" },
];

const playerAchievmentHeaders = [
    { key: "name", title: "Achievement" },
    { key: "description", title: "Description" },
    { key: "level", title: "Achieved level" },
    { key: "more", title: "" },
];

const playerError = computed(() => {
    return playerLookup.getUUID(player.value, "") === "";
});

async function verifyAchievement(achievement: SubmittedAchievement) {
    await $fetch(`/api/achievements`, {
        method: "POST",
        body: {
            player: achievement.player,
            achievement: achievement.achievement,
            achievedAt: Array(achievement.achievedAt.length).fill(
                DateTime.fromISO(achievementDatetime.value).toMillis(),
            ),
            verified: true,
        },
    });
    unverifiedAchievements.value = await $fetch(`/api/achievements/unverified`);
    achievementToVerify.value = null;
}

async function rejectAchievement(achievement: SubmittedAchievement) {
    await $fetch(`/api/achievements`, {
        method: "DELETE",
        body: {
            player: achievement.player,
            achievement: achievement.achievement,
        },
    });
    unverifiedAchievements.value = await $fetch(`/api/achievements/unverified`);
}

watch(player, async () => {
    const uuid = playerLookup.getUUID(player.value, "");
    if (uuid === "") {
        return;
    }

    const achievements = await $fetch(
        `/api/achievements/player?player=${uuid}`,
    );
    playerAchievements.value = achievements;
});
</script>
