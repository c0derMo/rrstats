<template>
    <DialogComponent :open="showDialog" @closed="$emit('close')">
        <CardComponent class="flex flex-col gap-3">
            <TextInputComponent :model-value="achievement.name" disabled />

            <TextInputComponent
                v-model="achievementDatetime"
                type="datetime-local"
                placeholder="Datetime of achievement"
            />

            <div class="flex flex-row gap-3">
                <ButtonComponent :loading="loading" @click="unachieve()">
                    Revoke achievement
                </ButtonComponent>
                <ButtonComponent :loading="loading" @click="save()">
                    Save
                </ButtonComponent>
                <ButtonComponent :loading="loading" @click="close()">
                    Discard
                </ButtonComponent>
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";

const props = defineProps<{
    achievement: AchievedAchievement;
    player: string;
}>();

defineEmits<{
    close: [];
}>();

const showDialog = ref(true);
const achievementDatetime = ref(
    DateTime.fromMillis(props.achievement.achievedAt[0]).toISO({
        suppressMilliseconds: true,
        suppressSeconds: true,
        includeOffset: false,
    })!,
);
const loading = ref(false);

async function save() {
    loading.value = true;
    await $fetch(`/api/achievements`, {
        method: "POST",
        body: {
            player: props.player,
            achievement: props.achievement.name,
            achievedAt: Array(props.achievement.achievedAt.length).fill(
                DateTime.fromISO(achievementDatetime.value).toMillis(),
            ),
            verified: true,
        },
    });

    showDialog.value = false;
}

async function unachieve() {
    loading.value = true;
    await $fetch(`/api/achievements`, {
        method: "DELETE",
        body: {
            player: props.player,
            achievement: props.achievement.name,
        },
    });

    showDialog.value = false;
}

function close() {
    loading.value = true;
    showDialog.value = false;
}
</script>
