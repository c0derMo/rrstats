<template>
    <div>
        <span class="italic"
            >Leave "Bracket" empty if there are no seperate brackets. Leave
            "Placement" empty to add Group Stage Participation.</span
        >

        <TableComponent :headers="placementsHeaders" :rows="placementsData">
            <template #player="{ index }">
                <TextInputComponent
                    v-model="placementPlayers[index]"
                    :error="playersIncorrect[index]"
                    @update:model-value="
                        (val) => tryLookupPlayer(val as string, index)
                    "
                />
            </template>
            <template #bracket="{ index }">
                <TextInputComponent
                    v-model="placementsData[index].bracket"
                    class="w-64"
                    @update:model-value="checkAndEmit()"
                />
            </template>
            <template #placement="{ index }">
                <TextInputComponent
                    v-model="placementsData[index].placement"
                    type="number"
                    class="w-24"
                    @update:model-value="checkAndEmit()"
                />
            </template>
            <template #more="{ index }">
                <ButtonComponent @click="removePlacement(index)"
                    >Delete</ButtonComponent
                >
            </template>
        </TableComponent>

        <div class="flex flex-row place-content-end">
            <ButtonComponent class="mt-3 mr-10" @click="addPlacement()">
                Add
            </ButtonComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    placements: ICompetitionPlacement[];
}>();

const emits = defineEmits<{
    "update:placements": [value: ICompetitionPlacement[]];
}>();

const placementsData = toRef(props.placements);
const placementPlayers: Ref<string[]> = ref([]);
const playersIncorrect: Ref<boolean[]> = ref([]);
const playerLookup = usePlayers();

const placementsHeaders = [
    { key: "player", title: "Player" },
    { key: "bracket", title: "Bracket" },
    { key: "placement", title: "Placement" },
    { key: "more", title: "" },
];

onBeforeMount(async () => {
    await playerLookup.queryAll();
    for (const placement of placementsData.value) {
        const playerName = playerLookup.get(placement.player, null);
        placementPlayers.value.push(playerName || "Unknown player");
        playersIncorrect.value.push(playerName == null);
    }
});

function checkAndEmit() {
    if (playersIncorrect.value.some((b) => b === true)) {
        return;
    }

    for (let i = 0; i < placementsData.value.length; i++) {
        placementsData.value[i].player = playerLookup.getUUID(
            placementPlayers.value[i],
        );
        if (placementsData.value[i].placement === 0) {
            placementsData.value[i].placement = undefined;
        }
    }

    emits("update:placements", placementsData.value);
}

function addPlacement() {
    placementsData.value.push({
        player: "",
        bracket: "",
        competition: "",
        placement: undefined,
    });
    placementPlayers.value.push("");
    playersIncorrect.value.push(true);
}

function removePlacement(index: number) {
    placementsData.value.splice(index, 1);
    placementPlayers.value.splice(index, 1);
    playersIncorrect.value.splice(index, 1);
    checkAndEmit();
}

function tryLookupPlayer(player: string, index: number) {
    if (playerLookup.getUUID(player) != null) {
        playersIncorrect.value[index] = false;
        checkAndEmit();
    } else {
        playersIncorrect.value[index] = true;
    }
}
</script>
