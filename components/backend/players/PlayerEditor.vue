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
                    v-model="playerData.discordId"
                    placeholder="Discord id"
                    class="w-full"
                />

                <TextInputComponent
                    v-model="playerData.title"
                    placeholder="Override Accolate"
                    class="w-full"
                />

                <SwitchComponent
                    id="customTitle"
                    v-model="playerData.hasCustomTitle"
                    label="Has custom accolate:"
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
import { IPlayer } from "~/utils/interfaces/IPlayer";

const props = defineProps({
    player: {
        type: Object as PropType<IPlayer>,
        required: true,
    },
});

const emits = defineEmits(["close"]);

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

async function save() {
    isSaving.value = true;

    await useFetch("/api/player", {
        method: "post",
        body: playerData.value,
    });

    isSaving.value = false;
    emits("close");
}

function close() {
    emits("close");
}
</script>