<template>
    <DialogComponent dialog-class="w-3/5">
        <CardComponent>
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
import { IMatch } from "~/utils/interfaces/IMatch";
import { IMapRecord } from "~/utils/interfaces/IRecord";

const props = defineProps({
    record: {
        type: Object as PropType<IMapRecord>,
        required: true,
    },
});

const emits = defineEmits(["close"]);

const recordData: Ref<IMapRecord> = toRef(props.record);
const isSaving = ref(false);
const rawMatches: Ref<IMatch[]> = ref([]);
const possibleMaps: Ref<{ text: string; value: number }[]> = ref([]);
const playerInvalid = ref(false);
const player = ref("");
const playerToUUIDTable: Ref<Record<string, string>> = ref({});
const uuidToPlayerTable: Ref<Record<string, string>> = ref({});
const showAllMatches = ref(false);

const maps = getAllMaps().map((map) => {
    return { text: getMap(map)!.name, value: map };
});

const shownMatches = computed(() => {
    return rawMatches.value.filter((match) => {
        return match.playedMaps.some((map) => map.map === recordData.value.map);
    });
});

const possibleMatches = computed(() => {
    return shownMatches.value.map((match) => {
        return {
            text: `${match.competition} ${match.round} ${
                uuidToPlayerTable.value[match.playerOne]
            } ${match.playerOneScore} - ${match.playerTwoScore} ${
                uuidToPlayerTable.value[match.playerTwo]
            }`,
            value: match.uuid,
        };
    });
});

async function checkPlayerAndUpdateMatches() {
    playerInvalid.value = false;
    if (playerToUUIDTable.value[player.value.trim()] == null) {
        playerInvalid.value = true;
        return;
    }

    recordData.value.player = playerToUUIDTable.value[player.value.trim()];

    const matchRequest = await useFetch("/api/matches/player", {
        query: { player: recordData.value.player },
    });
    if (
        matchRequest.data.value == null ||
        matchRequest.status.value !== "success"
    ) {
        return;
    }

    rawMatches.value = matchRequest.data.value;

    if (possibleMatches.value.length <= 0) {
        recordData.value.match = "";
        return;
    }

    recordData.value.match = rawMatches.value[0].uuid;
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

    await useFetch("/api/records", {
        method: "post",
        query: { type: "map" },
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

    player.value = uuidToPlayerTable.value[recordData.value.player] ?? "";
}

await loadPlayers();
await checkPlayerAndUpdateMatches();
</script>
