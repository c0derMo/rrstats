<template>
    <div>
        <TableComponent :headers="headers" :rows="bannedMapData">
            <template #header-more>
                <ButtonComponent @click="addBan()">
                    <FontAwesomeIcon
                        :icon="['fa', 'plus']"
                        class="text-green-500"
                    />
                </ButtonComponent>
            </template>

            <template #map="{ index }">
                <DropdownComponent
                    v-model="bannedMapData[index].map"
                    :items="allMaps"
                    @update:model-value="
                        emits('update:bannedMaps', bannedMapData)
                    "
                />
            </template>

            <template #picked="{ index }">
                <DropdownComponent
                    v-model="bannedMapData[index].picked"
                    :items="bannedPlayerOptions"
                    @update:model-value="
                        emits('update:bannedMaps', bannedMapData)
                    "
                />
            </template>

            <template #more="{ index }">
                <ButtonComponent @click="deleteBan(index)">
                    <FontAwesomeIcon
                        :icon="['fa', 'trash']"
                        class="text-red-500"
                    />
                </ButtonComponent>
            </template>
        </TableComponent>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    bannedMaps: RRBannedMap[];
    players: string[];
}>();

const emits = defineEmits<{
    "update:bannedMaps": [value: RRBannedMap[]];
}>();

const bannedMapData = toRef(props.bannedMaps);

const headers = [
    { key: "map", title: "Map" },
    { key: "picked", title: "Banned by" },
    { key: "more", title: "" },
];

const allMaps = computed(() => {
    return getAllMaps().map((map) => {
        return { text: getMap(map)!.name, value: map };
    });
});

const bannedPlayerOptions = computed(() => {
    return [
        { text: "Random", value: ChoosingPlayer.RANDOM },
        { text: props.players[0], value: ChoosingPlayer.PLAYER_ONE },
        { text: props.players[1], value: ChoosingPlayer.PLAYER_TWO },
    ];
});

function deleteBan(index: number) {
    bannedMapData.value.splice(index, 1);
    emits("update:bannedMaps", bannedMapData.value);
}

function addBan() {
    bannedMapData.value.push({ map: 0, picked: 0 });
    emits("update:bannedMaps", bannedMapData.value);
}
</script>
