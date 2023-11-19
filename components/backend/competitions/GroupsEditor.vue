<template>
    <div class="flex flex-col gap-3">
        <TextInputComponent
            placeholder="Matches between players in groups"
            v-model="settings.matchesBetweenPlayers"
            type="number"
            @update:model-value="checkAndEmit()"
        />
        <TextInputComponent
            placeholder="Max points per match"
            v-model="settings.maxPointsPerMatch"
            type="number"
            @update:model-value="checkAndEmit()"
        />

        <div class="flex flex-row gap-5">
            <DropdownComponent
                v-model="selectedGroup"
                :items="settings.groups.map((g, idx) => `Group ${idx + 1}`)"
            />

            <div class="flex-grow"></div>

            <ButtonComponent @click="removeGroup()"
                ><FontAwesomeIcon :icon="['fa', 'trash']" class="text-red-500"
            /></ButtonComponent>
            <ButtonComponent @click="addGroup()"
                ><FontAwesomeIcon :icon="['fa', 'plus']" class="text-green-500"
            /></ButtonComponent>
        </div>

        <div v-if="selectedGroupIndex != null" class="flex flex-col gap-3">
            <TextInputComponent
                v-model="settings.groups[selectedGroupIndex].groupName"
                placeholder="Group name"
                @update:model-value="checkAndEmit()"
            />
            <TextInputComponent
                v-model="settings.groups[selectedGroupIndex].advancingPlayers"
                placeholder="Number of advancing players"
                type="number"
                @update:model-value="checkAndEmit()"
            />

            <h1>
                Players in group:

                <ButtonComponent class="float-right" @click="addPlayer()"
                    ><FontAwesomeIcon
                        :icon="['fa', 'plus']"
                        class="text-green-500"
                /></ButtonComponent>
            </h1>
            <ul>
                <li
                    v-for="(player, idx) in settings.groups[selectedGroupIndex]
                        .players"
                    class="flex flex-row gap-3"
                >
                    <TextInputComponent
                        v-model="playersInGroups[selectedGroupIndex][idx]"
                        class="flex-grow"
                        :error="playersIncorrect[selectedGroupIndex][idx]"
                        @update:model-value="
                            (val) =>
                                tryLookupPlayer(val, selectedGroupIndex!, idx)
                        "
                    />
                    <ButtonComponent @click="removePlayer(idx)"
                        ><FontAwesomeIcon
                            :icon="['fa', 'trash']"
                            class="text-red-500"
                    /></ButtonComponent>
                </li>
            </ul>

            <h1>Position overrides:</h1>
            <ol>
                <li
                    v-for="(_, idx) in settings.groups[selectedGroupIndex]
                        .players"
                    class="flex flex-row"
                >
                    <span class="w-10 mt-2">{{ idx + 1 }}:</span>
                    <DropdownComponent
                        :items="positionOverrideDropdown"
                        v-model="positionOverrides[selectedGroupIndex][idx]"
                        @update:model-value="checkAndEmit()"
                    />
                </li>
            </ol>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IGroupSettings } from "~/utils/interfaces/ICompetition";

const props = defineProps({
    groupSettings: {
        type: Object as PropType<IGroupSettings>,
        required: true,
    },
});

const emits = defineEmits(["update:groupSettings"]);

const settings = toRef(props.groupSettings);
const selectedGroup = ref("");
const playerNameToUUIDs: Ref<Record<string, string>> = ref({});
const playersInGroups: Ref<string[][]> = ref([]);
const playersIncorrect: Ref<boolean[][]> = ref([]);
const positionOverrides: Ref<string[][]> = ref([]);

const selectedGroupIndex = computed(() => {
    if (selectedGroup.value === "") {
        return null;
    }
    const index = parseInt(selectedGroup.value.split(" ")[1]) - 1;
    return index;
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
            playerNameToUUIDs.value[uuidsToPlayer[uuid]] = uuid;
        }

        for (const group of settings.value.groups) {
            const groupPlayers: string[] = [];
            const groupIncorrect: boolean[] = [];
            const groupPositionOverrides: string[] = [];

            for (const player of group.players) {
                const playerName = uuidsToPlayer[player];
                groupPlayers.push(playerName || "Unknown player");
                groupIncorrect.push(playerName === undefined);
            }
            for (let i = 0; i < group.players.length; i++) {
                if (group.positionOverrides !== undefined) {
                    const playerName =
                        uuidsToPlayer[group.positionOverrides[i]];
                    groupPositionOverrides.push(playerName || "-- none --");
                } else {
                    groupPositionOverrides.push("-- none --");
                }
            }

            playersInGroups.value.push(groupPlayers);
            playersIncorrect.value.push(groupIncorrect);
            positionOverrides.value.push(groupPositionOverrides);
        }
    }
});

function checkAndEmit() {
    if (playersIncorrect.value.some((g) => g.some((p) => p === true))) {
        return;
    }

    for (let i = 0; i < settings.value.groups.length; i++) {
        settings.value.groups[i].positionOverrides = {};

        for (let j = 0; j < settings.value.groups[i].players.length; j++) {
            settings.value.groups[i].players[j] =
                playerNameToUUIDs.value[playersInGroups.value[i][j]];

            if (positionOverrides.value[i][j] !== "-- none --") {
                settings.value.groups[i].positionOverrides[j] =
                    playerNameToUUIDs.value[positionOverrides.value[i][j]];
            }
        }
    }

    emits("update:groupSettings", settings.value);
}

function tryLookupPlayer(player: string, group: number, index: number) {
    if (playerNameToUUIDs.value[player] != undefined) {
        playersIncorrect.value[group][index] = false;
        checkAndEmit();
    } else {
        playersIncorrect.value[group][index] = true;
    }
}

function addGroup() {
    settings.value.groups.push({
        groupName: "",
        advancingPlayers: 0,
        players: [],
        positionOverrides: {},
    });
    playersInGroups.value.push([]);
    playersIncorrect.value.push([]);
    positionOverrides.value.push([]);
}
function removeGroup() {
    const index = selectedGroupIndex.value;
    if (index === null) return;

    if (index !== 0) {
        selectedGroup.value = `Group ${index}`;
    } else if (settings.value.groups.length === 1) {
        selectedGroup.value = "";
    }

    settings.value.groups.splice(index, 1);
    playersInGroups.value.splice(index, 1);
    playersIncorrect.value.splice(index, 1);
    positionOverrides.value.splice(index, 1);
}
function addPlayer() {
    const group = selectedGroupIndex.value;
    if (group === null) return;

    settings.value.groups[group].players.push("");
    playersInGroups.value[group].push("");
    playersIncorrect.value[group].push(true);
    positionOverrides.value[group].push("-- none --");
}
function removePlayer(index: number) {
    const group = selectedGroupIndex.value;
    if (group === null) return;

    settings.value.groups[group].players.splice(index, 1);
    playersInGroups.value[group].splice(index, 1);
    playersIncorrect.value[group].splice(index, 1);
    positionOverrides.value[group].splice(index, 1);
}

const positionOverrideDropdown = computed(() => {
    return ["-- none --", ...playersInGroups.value[selectedGroupIndex.value!]];
});
</script>
