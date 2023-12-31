<template>
    <div>
        <GenericRecordEditor v-if="genericRecordToEdit != null" :record="genericRecordToEdit" @close="genericRecordToEdit = null; updateLists();"/>

        <div class="ml-5 text-3xl bold my-5">Records</div>

        <TabbedContainer :tabs="['Maps', 'Generic']">
            <template #Maps>
                <DropdownComponent v-model="mapFilter" :items="mapFilterOptions" />

                <DataTableComponent
                    :headers="mapHeaders"
                    :rows="filteredMapRecords"
                    :enable-sorting="false"
                    :rows-per-page="[25, 50, 100]"
                    :items-per-page="25"
                >
                    <template #map="{ value }">
                        {{ getMap(value as HitmanMap)!.name }}
                    </template>
                    <template #timestamp="{ value }">
                        {{  DateTime.fromMillis(value as number).setLocale(useLocale().value).toLocaleString(DateTime.DATETIME_FULL) }}
                    </template>
                    <template #player="{ value }">
                        {{ playerLookupTable[value as string] ?? `unknown player: ${value}` }}
                    </template>
                    <template #time="{ value }">
                        {{ secondsToTime(value as number) }}
                    </template>
                </DataTableComponent>
            </template>

            <template #Generic>
                <DropdownComponent v-model="genericFilter" :items="genericFilterOptions" />

                <div
                    v-if="genericFilter !== '' && isRetiredRecord(genericFilter as GenericRecordType)"
                    class="p-2 mx-5 my-2 border border-yellow-300 rounded"
                >
                    This record is retired. Only edit these records if there's anything wrong with them.
                </div>

                <DataTableComponent
                    :headers="genericHeaders"
                    :rows="filteredGenericRecords"
                    :enable-sorting="false"
                    :rows-per-page="[25, 50, 100]"
                    :items-per-page="25"
                >
                    <template #header-more>
                        <ButtonComponent @click="newGenericRecord()">
                            <FontAwesomeIcon
                                :icon="['fa', 'plus']"
                                class="text-green-500"
                            />
                        </ButtonComponent>
                    </template>

                    <template #timestamp="{ value }">
                        {{  DateTime.fromMillis(value as number).setLocale(useLocale().value).toLocaleString(DateTime.DATETIME_FULL) }}
                    </template>
                    <template #players="{ value }">
                        {{ (value as string[]).map(player => playerLookupTable[player] ?? `unknown player: ${player}`).join(", ") }}
                    </template>
                    <template #time="{ value }">
                        {{ secondsToTime(value as number) }}
                    </template>
                    <template #more="{ row }">
                        <ButtonComponent @click="genericRecordToEdit = row">
                            <FontAwesomeIcon :icon="['fa', 'pen']" />
                        </ButtonComponent>
                    </template>
                </DataTableComponent>
            </template>
        </TabbedContainer>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { GenericRecordType, IGenericRecord, IMapRecord, isRetiredRecord } from '~/utils/interfaces/IRecord';
import { HitmanMap } from '~/utils/mapUtils';

definePageMeta({
    layout: "backend",
    middleware: ["auth"]
});

const mapRecords: Ref<IMapRecord[]> = ref([]);
const genericRecords: Ref<IGenericRecord[]> = ref([]);
const mapFilter = ref(-1);
const genericFilter = ref("");
const playerLookupTable: Ref<Record<string, string>> = ref({});
const genericRecordToEdit: Ref<IGenericRecord | null> = ref(null);

const mapFilterOptions = computed(() => {
    return [
        { text: "-- all maps --", value: -1 },
        ...getAllMaps().map(map => { return { text: getMap(map)!.name, value: map } })
    ]
});

const genericFilterOptions = computed(() => {
    return [
        { text: "-- all records --", value: "" },
        ...Object.values(GenericRecordType).map(record => { return { text: record, value: record }})
    ]
})

const mapHeaders = [
    { key: "map", title: "Map" },
    { key: "timestamp", title: "Date" },
    { key: "player", title: "Player" },
    { key: "time", title: "Time" },
    { key: "more", title: "" }
];

const genericHeaders = [
    { key: "record", title: "Record" },
    { key: "timestamp", title: "Date" },
    { key: "players", title: "Players" },
    { key: "time", title: "Time" },
    { key: "more", title: "" }
]

const filteredMapRecords = computed(() => {
    if (mapFilter.value < 0) {
        return mapRecords.value;
    } else {
        return mapRecords.value.filter((record) => record.map === mapFilter.value);
    }
});

const filteredGenericRecords = computed(() => {
    if (genericFilter.value === "") {
        return genericRecords.value;
    } else {
        return genericRecords.value.filter(record => record.record === genericFilter.value);
    }
});

function newGenericRecord() {
    genericRecordToEdit.value = {
        timestamp: DateTime.now().toMillis(),
        record: GenericRecordType.LONGEST_REGULAR_MATCH,
        players: [],
        time: 0,
        match: "",
        maps: []
    }
}

async function updatePlayerLookupTable() {
    const playerQuery = await useFetch("/api/player/lookup");

    if (playerQuery.status.value !== "success" || playerQuery.data.value == null) {
        return;
    }

    playerLookupTable.value = playerQuery.data.value as Record<string, string>;
}

async function updateLists() {
    const recordQuery = await useFetch("/api/records/list");
    if (recordQuery.status.value !== "success" || recordQuery.data.value == null) {
        return;
    }

    mapRecords.value = recordQuery.data.value.mapRecords as IMapRecord[];
    genericRecords.value = recordQuery.data.value.genericRecords as IGenericRecord[];
}

await updateLists();
await updatePlayerLookupTable();
</script>