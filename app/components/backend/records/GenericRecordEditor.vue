<template>
    <DialogComponent
        dialog-class="w-3/5"
        :open="showDialog"
        @closed="$emit('close')"
    >
        <CardComponent class="max-h-screen">
            <div class="flex flex-col gap-5">
                <DropdownComponent
                    v-model="recordData.record"
                    :items="Object.values(GenericRecordType)"
                    class="w-full"
                />

                <DateTimeInputComponent
                    v-model="recordData.timestamp"
                    :seconds="true"
                    placeholder="Date / Time"
                />

                <TextInputComponent
                    v-model="players"
                    :error="playersInvalid"
                    placeholder="Players (seperated by ,)"
                    @update:model-value="checkPlayersAndUpdateMatches()"
                />

                <DropdownComponent
                    v-model="recordData.match"
                    :items="possibleMatches"
                    class="w-full"
                />

                <TableComponent :headers="mapHeaders" :rows="recordData.maps">
                    <template #header-more>
                        <ButtonComponent @click="addMap()">
                            <FontAwesomeIcon
                                :icon="['fa', 'plus']"
                                class="text-green-500"
                            />
                        </ButtonComponent>
                    </template>

                    <template #map="{ row }">
                        <DropdownComponent v-model="row.map" :items="maps" />
                    </template>

                    <template #time="{ row, index }">
                        <TextInputComponent
                            v-model="row.time"
                            :error="isTimeInvalid[index]"
                            type="number"
                        />
                    </template>

                    <template #more="{ index }">
                        <ButtonComponent @click="removeMap(index)">
                            <FontAwesomeIcon
                                :icon="['fa', 'trash']"
                                class="text-red-500"
                            />
                        </ButtonComponent>
                    </template>
                </TableComponent>

                <span>Total time: {{ secondsToTime(totalTime) }}</span>
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
    record: IGenericRecord;
}>();

defineEmits<{
    close: [];
}>();
const addAlert =
    inject<(text: string, type?: string) => void>("alertHandler") ?? (() => {});

const showDialog = ref(true);
const recordData: Ref<IGenericRecord> = toRef(props.record);
const isSaving = ref(false);
const possibleMatches: Ref<{ text: string; value: string }[]> = ref([]);
const playersInvalid = ref(false);
const players = ref("");
const isTimeInvalid = ref(Array(recordData.value.maps.length).fill(false));
const playerLookup = usePlayers();

await playerLookup.queryAll();
players.value = recordData.value.players
    .map((p) => playerLookup.get(p))
    .join(", ");

const mapHeaders = [
    { title: "Map", key: "map" },
    { title: "Time (in seconds)", key: "time" },
    { title: "", key: "more" },
];

const maps = getAllMaps().map((map) => {
    return { text: getMap(map)!.name, value: map };
});

const totalTime = computed(() => {
    return recordData.value.maps
        .map((m) => m.time)
        .reduce((prev, cur) => prev + cur, 0);
});

async function checkPlayersAndUpdateMatches() {
    playersInvalid.value = false;
    players.value.split(",").forEach((player) => {
        if (playerLookup.getUUID(player.trim()) == null) {
            playersInvalid.value = true;
        }
    });
    if (playersInvalid.value) {
        return;
    }

    recordData.value.players = players.value
        .split(",")
        .map((player) => playerLookup.getUUID(player.trim()));

    const matchRequest = await $fetch<IMatch[]>("/api/matches", {
        query: { players: recordData.value.players },
    });
    possibleMatches.value = matchRequest.map((match) => {
        return {
            text: `${match.competition} ${match.round} ${playerLookup.get(
                match.playerOne,
            )} ${match.playerOneScore} - ${match.playerTwoScore} ${playerLookup.get(
                match.playerTwo,
            )}`,
            value: match.uuid,
        };
    });
    if (possibleMatches.value.length > 0) {
        recordData.value.match = possibleMatches.value[0].value;
    } else {
        recordData.value.match = "";
    }
}

function addMap() {
    recordData.value.maps.push({
        map: 0,
        time: 0,
    });
    isTimeInvalid.value.push(false);
}

function removeMap(index: number) {
    recordData.value.maps.splice(index, 1);
    isTimeInvalid.value.splice(index, 1);
}

async function save() {
    isSaving.value = true;

    for (const mapIdx in recordData.value.maps) {
        if (isNaN(recordData.value.maps[mapIdx].time)) {
            isTimeInvalid.value[parseInt(mapIdx)] = true;
        } else {
            isTimeInvalid.value[parseInt(mapIdx)] = false;
        }
    }

    if (isTimeInvalid.value.includes(true)) {
        isSaving.value = false;
        return;
    }

    recordData.value.time = totalTime.value;

    try {
        await $fetch("/api/records", {
            method: "post",
            query: { type: "generic" },
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

await checkPlayersAndUpdateMatches();
</script>
