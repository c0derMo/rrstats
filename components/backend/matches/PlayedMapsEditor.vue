<template>
    <div>
        <div class="flex flex-row w-full justify-between">
            <DropdownComponent v-model="selectedMap" :items="selectableMaps" />

            <div>
                <ButtonComponent @click="deleteMap()">
                    <FontAwesomeIcon
                        :icon="['fa', 'trash']"
                        class="text-red-500"
                    />
                </ButtonComponent>
                <ButtonComponent @click="addMap()">
                    <FontAwesomeIcon
                        :icon="['fa', 'plus']"
                        class="text-green-500"
                    />
                </ButtonComponent>
            </div>
        </div>

        <div
            v-if="selectableMaps.length > 0"
            class="flex flex-col w-full gap-5 mt-5"
        >
            <div>
                Map:
                <DropdownComponent
                    v-model="playedMapData[selectedMap].map"
                    :items="allMaps"
                    @update:model-value="
                        $emit('update:playedMaps', playedMapData)
                    "
                />
            </div>

            <div>
                Picked by:
                <DropdownComponent
                    v-model="playedMapData[selectedMap].picked"
                    :items="pickedPlayerOptions"
                    @update:model-value="
                        $emit('update:playedMaps', playedMapData)
                    "
                />
            </div>

            <div>
                Won by:
                <DropdownComponent
                    v-model="playedMapData[selectedMap].winner"
                    :items="winningPlayerOptions"
                    @update:model-value="
                        $emit('update:playedMaps', playedMapData)
                    "
                />
            </div>

            <SwitchComponent
                id="wonByForfeit"
                v-model="playedMapData[selectedMap].forfeit"
                label="Won by forfeit?"
                @update:model-value="$emit('update:playedMaps', playedMapData)"
            />

            <DateTimeInputComponent
                v-model="playedMapData[selectedMap].startedTimestamp"
                placeholder="Started at"
                :seconds="true"
                @update:model-value="$emit('update:playedMaps', playedMapData)"
            />

            <DateTimeInputComponent
                v-model="playedMapData[selectedMap].endedTimestamp"
                placeholder="Ended at"
                :seconds="true"
                @update:model-value="$emit('update:playedMaps', playedMapData)"
            />

            <SwitchComponent
                id="timeAccurate"
                v-model="playedMapData[selectedMap].timeAccurate"
                label="Time accurate?"
                @update:model-value="$emit('update:playedMaps', playedMapData)"
            />

            <div>
                Spin:<br />
                <TextareaComponent v-model="spin" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import {
    ChoosingPlayer,
    RRMap,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";

const props = defineProps({
    playedMaps: {
        type: Array<RRMap>,
        required: true,
    },
    players: {
        type: Array<string>,
        required: true,
    },
});

const emits = defineEmits(["update:playedMaps"]);

const playedMapData = toRef(props.playedMaps);
const selectedMap = ref(0);

const allMaps = computed(() => {
    return getAllMaps().map((map) => {
        return { text: getMap(map)!.name, value: map };
    });
});

const pickedPlayerOptions = computed(() => {
    return [
        { text: "Random", value: ChoosingPlayer.RANDOM },
        { text: props.players[0], value: ChoosingPlayer.PLAYER_ONE },
        { text: props.players[1], value: ChoosingPlayer.PLAYER_TWO },
    ];
});

const winningPlayerOptions = computed(() => {
    return [
        { text: "Tie", value: WinningPlayer.DRAW },
        { text: props.players[0], value: WinningPlayer.PLAYER_ONE },
        { text: props.players[1], value: WinningPlayer.PLAYER_TWO },
    ];
});

const selectableMaps = computed(() => {
    return playedMapData.value.map((map, idx) => {
        return { text: `Map ${idx + 1}: ${getMap(map.map)!.name}`, value: idx };
    });
});

const spin = computed({
    get() {
        return JSON.stringify(playedMapData.value[selectedMap.value].spin);
    },
    set(nV: string) {
        playedMapData.value[selectedMap.value].spin =
            JSON.parse(nV) || playedMapData.value[selectedMap.value].spin;
    },
});

function deleteMap() {
    const index = selectedMap.value;

    if (index !== 0) {
        selectedMap.value -= 1;
    }

    playedMapData.value.splice(index, 1);
    emits("update:playedMaps", playedMapData);
}

function addMap() {
    playedMapData.value.push({
        map: 0,
        picked: 0,
        winner: 0,
        startedTimestamp: DateTime.now().toMillis(),
        endedTimestamp: DateTime.now().toMillis(),
    });
    emits("update:playedMaps", playedMapData);
}
</script>
