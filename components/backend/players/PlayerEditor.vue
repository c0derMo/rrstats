<template>
    <DialogComponent dialog-class="w-3/5">
        <CardComponent>
            <div class="flex flex-col gap-5">
                <TextInputComponent
                    v-model="playerData.uuid"
                    placeholder="UUID"
                    class="w-full"
                    :disabled="true"
                />
                <TextInputComponent
                    v-model="playerData.primaryName"
                    placeholder="Primary name"
                    class="w-full"
                />

                <TextInputComponent
                    v-model="alternativeNames"
                    placeholder="Alternative names, seperated by comma"
                    class="w-full"
                />

                <TextInputComponent
                    v-model="discordId"
                    placeholder="Discord id"
                    class="w-full"
                />

                <TextInputComponent
                    v-model="nationality"
                    placeholder="Nationality"
                    class="w-full"
                />

                <TextInputComponent
                    v-model="title"
                    placeholder="Override Accolade"
                    class="w-full"
                />

                <SwitchComponent
                    id="customTitle"
                    v-model="playerData.hasCustomTitle"
                    label="Has custom accolade:"
                />

                <SwitchComponent
                    id="excludedFromSearch"
                    v-model="playerData.excludedFromSearch"
                    label="Excluded from search:"
                />
            </div>

            <div class="flex flex-row gap-3 mt-2">
                <ButtonComponent :loading="isSaving" @click="save()"
                    >Save</ButtonComponent
                >
                <ButtonComponent @click="close()">Discard</ButtonComponent>
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import type { IPlayer } from "~/utils/interfaces/IPlayer";

const props = defineProps<{
    player: IPlayer;
}>();

const emits = defineEmits<{
    close: [];
}>();
const addAlert =
    inject<(text: string, type?: string) => void>("alertHandler") ?? (() => {});

const playerData = toRef(props.player);
const isSaving = ref(false);

const alternativeNames = computed({
    get() {
        return playerData.value.alternativeNames.join(", ");
    },
    set(newValue: string) {
        playerData.value.alternativeNames = newValue
            .split(",")
            .map((name) => name.trim());
    },
});

const discordId = computed({
    get() {
        return playerData.value.discordId ?? "";
    },
    set(newValue: string) {
        playerData.value.discordId = newValue;
    },
});

const title = computed({
    get() {
        return playerData.value.title ?? "";
    },
    set(newValue: string) {
        playerData.value.title = newValue;
    },
});

const nationality = computed({
    get() {
        return playerData.value.nationality ?? "";
    },
    set(newValue: string) {
        playerData.value.nationality = newValue;
    },
});

async function save() {
    isSaving.value = true;

    try {
        await $fetch("/api/player", {
            method: "post",
            body: playerData.value,
        });
        addAlert("Player saved successfully.", "success");
    } catch {
        addAlert("Error upon saving player.", "error");
    }

    isSaving.value = false;
    emits("close");
}

function close() {
    emits("close");
}
</script>
