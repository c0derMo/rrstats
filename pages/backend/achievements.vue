<template>
    <div>
        <AchievementDetailDialog
            v-if="viewedAchievement != null"
            :achievement="viewedAchievement"
            :player="playerLookup.getUUID(player)"
            @closed="viewedAchievement = null"
        />

        <div class="text-3xl bold my-5">Achievements</div>

        <TabbedContainer
            :tabs="tabs"
            class="my-5"
            @change-tab="(tab) => (selectedTab = tab)"
        >
            <template #[tabs[1]]>
                <div>
                    <TextInputComponent
                        v-model="player"
                        placeholder="Player"
                        :error="playerError"
                    />
                </div>
            </template>
        </TabbedContainer>

        <div>
            <DataTableComponent
                :headers="tableHeaders"
                :rows="achievementsToShow"
            >
                <template #player="{ value }">
                    {{ playerLookup.get(value) }}
                </template>

                <template #more="{ row }">
                    <ButtonComponent v-if="selectedTab === tabs[0]">
                        Approve
                    </ButtonComponent>
                    <ButtonComponent v-if="selectedTab === tabs[0]">
                        Deny
                    </ButtonComponent>
                    <ButtonComponent
                        v-if="selectedTab === tabs[1]"
                        @click="viewedAchievement = row"
                    >
                        View
                    </ButtonComponent>
                    <ButtonComponent> Edit </ButtonComponent>
                </template>
            </DataTableComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AchievementInfo } from "~/utils/interfaces/AchievementInfo";

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
    pageTitle: "Achievements",
});

const tabs = ["Unverified achievements", "Achievements of player"];

const playerLookup = usePlayers();
const selectedTab = ref(tabs[0]);
const player = ref("");
const { data: unverifiedAchievements } = await useFetch<AchievementInfo[]>(
    "/api/achievements/unverified",
    { default: () => [] },
);
const playerAchievements = ref<AchievementInfo[]>([]);
const viewedAchievement = ref<AchievementInfo | null>(null);

await playerLookup.queryAll();

const tableHeaders = [
    { key: "player", title: "Player" },
    { key: "achievement", title: "Achievement" },
    { key: "more", title: "" },
];

const achievementsToShow = computed<AchievementInfo[]>(() => {
    if (selectedTab.value === tabs[0]) {
        return unverifiedAchievements.value;
    } else if (selectedTab.value === tabs[1]) {
        return playerAchievements.value;
    }
    return [];
});

const playerError = computed(() => {
    return playerLookup.getUUID(player.value, "") === "";
});

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
