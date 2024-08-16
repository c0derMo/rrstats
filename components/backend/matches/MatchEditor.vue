<template>
    <DialogComponent
        dialog-class="w-3/5"
        :open="showDialog"
        @closed="$emit('close')"
    >
        <CardComponent class="max-h-screen !overflow-visible">
            <TextInputComponent
                v-model="matchData.uuid"
                class="w-full mb-2"
                placeholder="UUID"
                disabled
            />
            <TabbedContainer :tabs="['Basic', 'Banned', 'Played']">
                <template #Basic>
                    <div class="grid grid-cols-2 gap-5 gap-x-10 w-full">
                        <TextInputComponent
                            v-model="players[0]"
                            :error="playersInvalid[0]"
                            placeholder="Player one"
                            @update:model-value="checkPlayers()"
                        />
                        <TextInputComponent
                            v-model="players[1]"
                            :error="playersInvalid[1]"
                            placeholder="Player two"
                            @update:model-value="checkPlayers()"
                        />
                        <TextInputComponent
                            v-model="matchData.playerOneScore"
                            placeholder="Player one score"
                        />
                        <TextInputComponent
                            v-model="matchData.playerTwoScore"
                            placeholder="Player two score"
                        />
                        <SwitchComponent
                            id="annulated"
                            v-model="matchData.annulated"
                            label="Match annulated (doesn't count towards group stages)"
                            :reverse="true"
                        />
                    </div>

                    <div class="mt-10 grid grid-cols-6 gap-5 gap-x-10 w-full">
                        <DateTimeInputComponent
                            v-model="matchData.timestamp"
                            class="col-span-3"
                            placeholder="Timestamp"
                        />
                        <TextInputComponent
                            v-model="matchData.hitmapsMatchId"
                            class="col-span-3"
                            placeholder="Hitmaps Match Id"
                        />
                        <TextInputComponent
                            v-model="matchData.competition"
                            class="col-span-2"
                            placeholder="Competition"
                        />
                        <TextInputComponent
                            v-model="matchData.round"
                            class="col-span-2"
                            placeholder="Round"
                        />
                        <TextInputComponent
                            v-model="matchData.platform"
                            class="col-span-2"
                            placeholder="Platform"
                        />
                    </div>
                    <div
                        class="mt-10 flex flex-row gap-10 justify-stretch w-full"
                    >
                        <TextInputComponent
                            v-model="shoutcasters"
                            class="grow"
                            placeholder="Shoutcasters"
                        />
                        <TextInputComponent
                            v-model="vodLink"
                            class="grow"
                            placeholder="VOD Link"
                        />
                    </div>
                </template>

                <template #Banned>
                    <BannedMapsEditor
                        v-model:banned-maps="matchData.bannedMaps"
                        :players="players"
                    />
                </template>

                <template #Played>
                    <PlayedMapsEditor
                        v-model:played-maps="matchData.playedMaps"
                        :players="players"
                        :hitmaps-overlay-url="hitmapsOverlayUrl"
                        @update:hitmaps-overlay-url="
                            (v) => $emit('update:hitmapsOverlayUrl', v)
                        "
                    />
                </template>
            </TabbedContainer>

            <div class="flex flex-row gap-3 mt-5">
                <ButtonComponent :loading="isSaving" @click="save()"
                    >Save</ButtonComponent
                >
                <ButtonComponent @click="close()">Discard</ButtonComponent>
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import type { IMatch } from "~/utils/interfaces/IMatch";

const props = withDefaults(
    defineProps<{
        match: IMatch;
        hitmapsOverlayUrl?: string;
    }>(),
    {
        hitmapsOverlayUrl: "",
    },
);

defineEmits<{
    close: [];
    "update:hitmapsOverlayUrl": [value: string];
}>();

const showDialog = ref(true);
const matchData: Ref<IMatch> = ref(props.match);
const playerToUUIDTable: Ref<Record<string, string>> = ref({});
const players = ref([matchData.value.playerOne, matchData.value.playerTwo]);
const playersInvalid = ref([false, false]);
const isSaving = ref(false);

const addAlert =
    inject<(text: string, type?: string) => void>("alertHandler") ?? (() => {});

const shoutcasters = computed({
    get() {
        return matchData.value.shoutcasters?.join(", ") ?? "";
    },
    set(newValue: string) {
        matchData.value.shoutcasters = newValue
            .split(",")
            .map((name) => name.trim());
    },
});
const vodLink = computed({
    get() {
        return matchData.value.vodLink?.join(", ") ?? "";
    },
    set(newValue: string) {
        matchData.value.vodLink = newValue
            .split(",")
            .map((name) => name.trim());
    },
});

onBeforeMount(async () => {
    const playersRequest = await useFetch("/api/player/lookup");
    if (
        playersRequest.data.value != null &&
        playersRequest.status.value === "success"
    ) {
        const uuidsToPlayer = playersRequest.data.value as Record<
            string,
            string
        >;
        for (const uuid in playersRequest.data.value) {
            playerToUUIDTable.value[uuidsToPlayer[uuid]] = uuid;
        }

        players.value.forEach((uuid, idx) => {
            players.value[idx] = uuidsToPlayer[uuid];
        });
    }
});

function checkPlayers() {
    players.value.forEach((player, index) => {
        if (playerToUUIDTable.value[player] == null) {
            playersInvalid.value[index] = true;
        } else {
            playersInvalid.value[index] = false;
        }
    });
}

async function save() {
    isSaving.value = true;

    matchData.value.playerOne =
        playerToUUIDTable.value[players.value[0]] ?? matchData.value.playerOne;
    matchData.value.playerTwo =
        playerToUUIDTable.value[players.value[1]] ?? matchData.value.playerTwo;

    try {
        await $fetch("/api/matches", {
            method: "post",
            body: matchData.value,
        });
        addAlert("Match saved successfully.", "success");
    } catch (e) {
        addAlert("Error upon saving match.", "error");
    }

    isSaving.value = false;
    showDialog.value = false;
}

function close() {
    showDialog.value = false;
}
</script>
