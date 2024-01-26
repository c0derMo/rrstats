<template>
    <DialogComponent dialog-class="w-3/5">
        <CardComponent>
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
import { GenericRecordType } from "~/utils/interfaces/IRecord";

const props = defineProps({
    record: {
        type: Object as PropType<IGenericRecord>,
        required: true,
    },
});

const emits = defineEmits(["close"]);

const recordData: Ref<IGenericRecord> = toRef(props.record);
const isSaving = ref(false);
const possibleMatches = ref([]);
const playersInvalid = ref(false);
const players = ref("");
const playerToUUIDTable: Ref<Record<string, string>> = ref({});
const uuidToPlayerTable: Ref<Record<string, string>> = ref({});
const isTimeInvalid = ref(Array(recordData.value.maps.length).fill(false));

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
        .map((m) => parseInt(m.time))
        .reduce((prev, cur) => prev + cur, 0);
});

async function checkPlayersAndUpdateMatches() {
    playersInvalid.value = false;
    players.value.split(",").forEach((player) => {
        if (playerToUUIDTable.value[player.trim()] == null) {
            playersInvalid.value = true;
        }
    });
    if (playersInvalid.value) {
        return;
    }

    recordData.value.players = players.value
        .split(",")
        .map((player) => playerToUUIDTable.value[player.trim()]);

    const matchRequest = await useFetch("/api/matches/versus", {
        query: { players: recordData.value.players },
    });
    if (
        matchRequest.data.value == null ||
        matchRequest.status.value !== "success"
    ) {
        return;
    }

    possibleMatches.value = matchRequest.data.value.map((match) => {
        return {
            text: `${match.competition} ${match.round} ${
                uuidToPlayerTable.value[match.playerOne]
            } ${match.playerOneScore} - ${match.playerTwoScore} ${
                uuidToPlayerTable.value[match.playerTwo]
            }`,
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
        recordData.value.maps[mapIdx].time = parseInt(
            recordData.value.maps[mapIdx].time,
        );
        if (isNaN(recordData.value.maps[mapIdx].time)) {
            isTimeInvalid.value[mapIdx] = true;
        } else {
            isTimeInvalid.value[mapIdx] = false;
        }
    }

    if (isTimeInvalid.value.includes(true)) {
        isSaving.value = false;
        return;
    }

    recordData.value.time = totalTime;

    await useFetch("/api/records", {
        method: "post",
        query: { type: "generic" },
        body: recordData.value,
    });

    isSaving.value = false;
    emits("close");
}

function close() {
    emits("close");
}

async function loadPlayers() {
    const playersRequest = await useFetch("/api/player/lookup");
    if (
        playersRequest.data.value == null ||
        playersRequest.status.value !== "success"
    ) {
        return;
    }

    uuidToPlayerTable.value = playersRequest.data.value as Record<
        string,
        string
    >;
    for (const uuid in uuidToPlayerTable.value) {
        playerToUUIDTable.value[uuidToPlayerTable.value[uuid]] = uuid;
    }

    players.value = recordData.value.players
        .map((player) => uuidToPlayerTable.value[player])
        .join(", ");
}

await loadPlayers();
await checkPlayersAndUpdateMatches();
</script>
