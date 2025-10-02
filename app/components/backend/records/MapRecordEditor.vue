<template>
    <DialogComponent
        dialog-class="w-3/5"
        :open="showDialog"
        @closed="$emit('close')"
    >
        <CardComponent class="overflow-x-visible">
            <div class="flex flex-col gap-5">
                <DropdownComponent
                    v-model="recordData.map"
                    :items="maps"
                    class="w-full"
                />

                <DateTimeInputComponent
                    v-model="recordData.timestamp"
                    :seconds="true"
                    placeholder="Date / Time"
                />

                <TextInputComponent
                    v-model="player"
                    :error="playerInvalid"
                    placeholder="Player"
                    @update:model-value="checkPlayerAndUpdateMatches()"
                />

                <SwitchComponent
                    id="showAllMatches"
                    v-model="showAllMatches"
                    label="Show all matches"
                />

                <DropdownComponent
                    v-model="recordData.match"
                    :items="possibleMatches"
                    class="w-full"
                    @update:model-value="updatePossibleMaps()"
                />

                <DropdownComponent
                    v-model="recordData.mapIndex"
                    :items="possibleMaps"
                    class="w-full"
                />

                <TextInputComponent
                    v-model="recordData.time"
                    type="number"
                    placeholder="Record time (in seconds)"
                />
            </div>

            <div class="flex flex-row gap-3 mt-2">
                <ButtonComponent :loading="isSaving" @click="save()">
                    Save
                </ButtonComponent>
                <ButtonComponent @click="close()">Discard</ButtonComponent>
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
const props = defineProps<{
    record: IMapRecord;
}>();

defineEmits<{
    close: [];
}>();
const addAlert =
    inject<(text: string, type?: string) => void>("alertHandler") ?? (() => {});

const showDialog = ref(true);
const recordData: Ref<IMapRecord> = toRef(props.record);
const isSaving = ref(false);
const rawMatches: Ref<IMatch[]> = ref([]);
const possibleMaps: Ref<{ text: string; value: number }[]> = ref([]);
const playerInvalid = ref(false);
const player = ref("");
const showAllMatches = ref(false);
const playerLookup = usePlayers();

await playerLookup.queryAll();
player.value = playerLookup.get(recordData.value.player);

const maps = getAllMaps().map((map) => {
    return { text: getMap(map)!.name, value: map };
});

const shownMatches = computed(() => {
    if (showAllMatches.value) {
        return rawMatches.value;
    }
    return rawMatches.value.filter((match) => {
        return match.playedMaps.some((map) => map.map === recordData.value.map);
    });
});

const possibleMatches = computed(() => {
    return shownMatches.value.map((match) => {
        return {
            text: `${match.competition} ${match.round} ${playerLookup.get(
                match.playerOne,
            )} ${match.playerOneScore} - ${match.playerTwoScore} ${playerLookup.get(
                match.playerTwo,
            )}`,
            value: match.uuid,
        };
    });
});

async function checkPlayerAndUpdateMatches(initialLoad?: boolean) {
    playerInvalid.value = false;
    if (playerLookup.getUUID(player.value.trim()) == null) {
        playerInvalid.value = true;
        return;
    }

    recordData.value.player = playerLookup.getUUID(player.value.trim());

    const matchRequest = await $fetch<IMatch[]>("/api/matches", {
        query: { player: recordData.value.player },
    });
    rawMatches.value = matchRequest;

    if (possibleMatches.value.length <= 0) {
        recordData.value.match = "";
        return;
    }

    if (!initialLoad) {
        recordData.value.match = possibleMatches.value[0].value;
    }
}

function updatePossibleMaps() {
    const match = rawMatches.value.find(
        (match) => match.uuid === recordData.value.match,
    );
    if (match == null) {
        possibleMaps.value = [];
        return;
    }
    possibleMaps.value = match.playedMaps.map((map, idx) => {
        return {
            text: `Map ${idx + 1}: ${getMap(map.map)!.name}`,
            value: idx,
        };
    });
    recordData.value.mapIndex = Math.max(
        match.playedMaps.findIndex((map) => map.map === recordData.value.map),
        0,
    );
}

async function save() {
    isSaving.value = true;

    try {
        await $fetch("/api/records", {
            method: "post",
            query: { type: "map" },
            body: recordData.value,
        });
        addAlert("Record saved successfully.", "success");
    } catch {
        addAlert("Error upon saving record.", "error");
    }

    isSaving.value = false;
    showDialog.value = false;
}

function close() {
    showDialog.value = false;
}

await checkPlayerAndUpdateMatches(true);
</script>
