<template>
    <DialogComponent
        :open="dialogOpen"
        @click-outside="dialogOpen = false"
        @closed="emit('close')"
    >
        <CardComponent class="flex flex-col gap-3 !overflow-visible">
            <h1 class="text-3xl">Change your accolade</h1>

            <div class="flex flex-col">
                <div class="text-xl">Your current accolade:</div>
                <div class="font-bold text-lg">
                    {{ currentAccolade }}
                </div>
            </div>

            <div v-if="canEdit" class="flex flex-col gap-2">
                <div>
                    You can select one of your achievements as your accolade, or
                    revert to the default one instead.
                </div>

                <div>
                    Your default accolade:
                    <span class="italic">
                        {{ defaultAccolade }}
                    </span>
                </div>

                <div class="flex flex-row gap-3 items-center">
                    <div>Achievements to select:</div>
                    <DropdownComponent
                        v-model="selectedAccolade"
                        class="flex-grow"
                        :items="achievementAccolades"
                    />
                </div>
            </div>
            <div v-else>
                Your accolade is currently locked. Please return again in the
                future to change your accolade!
            </div>

            <div class="flex flex-row gap-2">
                <ButtonComponent v-if="canEdit" @click="revertToDefault"
                    >Revert to default</ButtonComponent
                >
                <AsyncWaitingButtonComponent v-if="canEdit" :handler="update"
                    >Save</AsyncWaitingButtonComponent
                >
                <ButtonComponent @click="dialogOpen = false"
                    >Close</ButtonComponent
                >
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
const props = defineProps<{
    currentAccolade: string;
    defaultAccolade: string;
    achievements: AchievedAchievement[];
    canEdit: boolean;
    player: string;
}>();

const emit = defineEmits<{
    close: [];
    update: [string];
}>();

const dialogOpen = ref(true);
const selectedAccolade = ref(props.currentAccolade);

const achievementAccolades = props.achievements.map((achievement) => {
    return achievement.name;
});

async function update() {
    await $fetch("/api/player/accolade", {
        method: "POST",
        body: {
            player: props.player,
            accolade: selectedAccolade.value,
        },
    });
    emit("update", selectedAccolade.value);
    dialogOpen.value = false;
}

function revertToDefault() {
    selectedAccolade.value = props.defaultAccolade;
}
</script>
