<template>
    <div>
        <GenericRecordEditor
            v-if="genericRecordToEdit != null"
            :record="genericRecordToEdit"
            @close="
                genericRecordToEdit = null;
                updateLists();
            "
        />
        <MapRecordEditor
            v-if="mapRecordToEdit != null"
            :record="mapRecordToEdit"
            @close="
                mapRecordToEdit = null;
                updateLists();
            "
        />

        <div class="text-3xl bold my-5">Records</div>

        <TabbedContainer :tabs="['Maps', 'Generic']">
            <template #Maps>
                <DropdownComponent
                    v-model="mapFilter"
                    :items="mapFilterOptions"
                />

                <DataTableComponent
                    :headers="mapHeaders"
                    :rows="filteredMapRecords"
                    :enable-sorting="false"
                    :rows-per-page="[25, 50, 100]"
                    :selected-rows-per-page="25"
                >
                    <template #header-more>
                        <ButtonComponent @click="newMapRecord()">
                            <FontAwesomeIcon
                                :icon="['fa', 'plus']"
                                class="text-green-500"
                            />
                        </ButtonComponent>
                    </template>

                    <template #map="{ value }: { value: HitmanMap }">
                        {{ getMap(value)!.name }}
                    </template>
                    <template #timestamp="{ value }">
                        {{
                            DateTime.fromMillis(value)
                                .setLocale(useLocale().value)
                                .toLocaleString(DateTime.DATETIME_FULL)
                        }}
                    </template>
                    <template #player="{ value }">
                        {{ playerLookup.get(value) }}
                    </template>
                    <template #time="{ value }">
                        {{ secondsToTime(value) }}
                    </template>
                    <template #more="{ row, index }">
                        <ButtonComponent @click="mapRecordToEdit = row">
                            <FontAwesomeIcon :icon="['fa', 'pen']" />
                        </ButtonComponent>
                        <ButtonComponent
                            :loading="currentlyDeleting == index"
                            :confirm-button="true"
                            @click="deleteRecord(row, 'map', index)"
                        >
                            <FontAwesomeIcon
                                :icon="['fa', 'trash']"
                                class="text-red-500"
                            />
                        </ButtonComponent>
                    </template>
                </DataTableComponent>
            </template>

            <template #Generic>
                <DropdownComponent
                    v-model="genericFilter"
                    :items="genericFilterOptions"
                />

                <div
                    v-if="
                        genericFilter !== '' &&
                        isRetiredRecord(genericFilter as GenericRecordType)
                    "
                    class="p-2 mx-5 my-2 border border-yellow-300 rounded"
                >
                    This record is retired. Only edit these records if there's
                    anything wrong with them.
                </div>

                <DataTableComponent
                    :headers="genericHeaders"
                    :rows="filteredGenericRecords"
                    :enable-sorting="false"
                    :rows-per-page="[25, 50, 100]"
                    :selected-rows-per-page="25"
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
                        {{
                            DateTime.fromMillis(value)
                                .setLocale(useLocale().value)
                                .toLocaleString(DateTime.DATETIME_FULL)
                        }}
                    </template>
                    <template #players="{ value }: { value: string[] }">
                        {{
                            value
                                .map((player) => playerLookup.get(player))
                                .join(", ")
                        }}
                    </template>
                    <template #time="{ value }">
                        {{ secondsToTime(value) }}
                    </template>
                    <template #more="{ row, index }">
                        <ButtonComponent @click="genericRecordToEdit = row">
                            <FontAwesomeIcon :icon="['fa', 'pen']" />
                        </ButtonComponent>
                        <ButtonComponent
                            :loading="currentlyDeleting == index"
                            :confirm-button="true"
                            @click="deleteRecord(row, 'generic', index)"
                        >
                            <FontAwesomeIcon
                                :icon="['fa', 'trash']"
                                class="text-red-500"
                            />
                        </ButtonComponent>
                    </template>
                </DataTableComponent>
            </template>
        </TabbedContainer>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import {
    GenericRecordType,
    type IGenericRecord,
    type IMapRecord,
    isRetiredRecord,
} from "~/utils/interfaces/IRecord";
import { HitmanMap } from "~/utils/mapUtils";

definePageMeta({
    pageTitle: "Records",
});

const mapRecords: Ref<IMapRecord[]> = ref([]);
const genericRecords: Ref<IGenericRecord[]> = ref([]);
const mapFilter = ref(-1);
const genericFilter = ref("");
const currentlyDeleting = ref(-1);
const genericRecordToEdit: Ref<IGenericRecord | null> = ref(null);
const mapRecordToEdit: Ref<IMapRecord | null> = ref(null);
const playerLookup = usePlayers();

await playerLookup.queryAll();

const mapFilterOptions = computed(() => {
    return [
        { text: "-- all maps --", value: -1 },
        ...getAllMaps().map((map) => {
            return { text: getMap(map)!.name, value: map };
        }),
    ];
});

const genericFilterOptions = computed(() => {
    return [
        { text: "-- all records --", value: "" },
        ...Object.values(GenericRecordType).map((record) => {
            return { text: record, value: record };
        }),
    ];
});

const mapHeaders = [
    { key: "map", title: "Map" },
    { key: "timestamp", title: "Date" },
    { key: "player", title: "Player" },
    { key: "time", title: "Time" },
    { key: "more", title: "" },
];

const genericHeaders = [
    { key: "record", title: "Record" },
    { key: "timestamp", title: "Date" },
    { key: "players", title: "Players" },
    { key: "time", title: "Time" },
    { key: "more", title: "" },
];

const filteredMapRecords = computed(() => {
    if (mapFilter.value < 0) {
        return mapRecords.value;
    } else {
        return mapRecords.value.filter(
            (record) => record.map === mapFilter.value,
        );
    }
});

const filteredGenericRecords = computed(() => {
    if (genericFilter.value === "") {
        return genericRecords.value;
    } else {
        return genericRecords.value.filter(
            (record) => record.record === genericFilter.value,
        );
    }
});

function newGenericRecord() {
    genericRecordToEdit.value = {
        timestamp: DateTime.now().toMillis(),
        record: GenericRecordType.LONGEST_REGULAR_MATCH,
        players: [],
        time: 0,
        match: "",
        maps: [],
    };
}

function newMapRecord() {
    mapRecordToEdit.value = {
        timestamp: DateTime.now().toMillis(),
        map: HitmanMap.PARIS,
        player: "",
        time: 0,
        match: "",
        mapIndex: 0,
    };
}

async function deleteRecord(
    record: IMapRecord | IGenericRecord,
    type: "generic" | "map",
    index: number,
) {
    currentlyDeleting.value = index;

    await $fetch("/api/records/", {
        method: "delete",
        body: record,
        query: { type: type },
    });
    await updateLists();

    currentlyDeleting.value = -1;
}

async function updateLists() {
    const recordQuery = await $fetch("/api/records/list", {
        headers: useRequestHeaders(),
    });
    mapRecords.value = recordQuery.mapRecords;
    genericRecords.value = recordQuery.genericRecords;
}

await updateLists();
</script>
