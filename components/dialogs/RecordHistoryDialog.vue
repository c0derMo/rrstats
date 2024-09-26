<template>
    <DialogComponent
        dialog-class="w-4/5 h-4/5"
        :open="showDialog"
        @click-outside="showDialog = false"
        @closed="$emit('closed')"
    >
        <CardComponent class="w-full h-full">
            <div class="flex flex-col w-full h-full">
                <h1 class="text-center text-xl bold">Record Progression</h1>
                <MultiSelectComponent
                    v-model="selectedRecords"
                    :items="selectableRecords"
                    :column-headers="
                        props.map != null
                            ? ['Season 1', 'Season 2', 'Season 3']
                            : undefined
                    "
                    @update:model-value="requeryEverything()"
                />
                <LineChart
                    v-if="showGraph"
                    :axis-labels="axisLabels"
                    :data="data"
                    :labels="labels"
                    :y-tick-format-function="axisLabelFunction"
                    :tooltip-label-function="tooltipLabelFunction"
                    :colors="colors"
                />
                <div class="flex flex-row w-full gap-2">
                    <DropdownComponent
                        v-model="selectedScale"
                        :items="['Month', 'Year', 'All time']"
                    />
                    <DropdownComponent
                        v-if="
                            selectedScale === 'Year' ||
                            selectedScale === 'Month'
                        "
                        v-model="selectedYear"
                        :items="possibleYears"
                    />
                    <DropdownComponent
                        v-if="selectedScale === 'Month'"
                        v-model="selectedMonth"
                        :items="possibleMonths"
                    />
                </div>
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import type { TooltipItem } from "chart.js";
import { Duration, DateTime } from "luxon";
import {
    GenericRecordType,
    type IGenericRecord,
    type IMapRecord,
} from "~/utils/interfaces/IRecord";
import { getMapsBySeason } from "~/utils/mapUtils";

const props = withDefaults(
    defineProps<{
        map?: number;
        genericRecord?: string;
    }>(),
    {
        map: undefined,
        genericRecord: undefined,
    },
);

defineEmits<{
    closed: [];
}>();

const showDialog = ref(true);
const selectedRecords: Ref<(number | string)[]> = ref([]);

const records: Ref<(IMapRecord | IGenericRecord)[][]> = ref([]);
const labels: Ref<string[]> = ref([]);
const colors: Ref<string[]> = ref([]);

const playerLookup = usePlayers();

const showGraph = ref(false);

if (props.map != null) {
    selectedRecords.value.push(props.map);
}
if (props.genericRecord != null) {
    selectedRecords.value.push(props.genericRecord);
}

await requeryEverything();

async function requeryEverything() {
    showGraph.value = false;

    // Rebuild Labels & records
    labels.value = [];
    records.value = [];
    colors.value = [];

    await queryRecords();
    await queryPlayers();

    showGraph.value = true;
}

async function queryRecords() {
    for (const selectedRecord of selectedRecords.value) {
        if (props.map != null) {
            const record = await $fetch("/api/records/history", {
                query: { map: selectedRecord as number },
            });
            if (record != null) {
                records.value.push(record);
                labels.value.push(getMap(selectedRecord as number)?.name ?? "");
                colors.value.push(
                    getMap(selectedRecord as number)?.color ?? "#80D4FF",
                );
            }
        }
        if (props.genericRecord != null) {
            const record = await $fetch("/api/records/history", {
                query: { generic: selectedRecord as string },
            });
            if (record != null) {
                records.value.push(record);
                labels.value.push(selectedRecord as string);
                colors.value.push("#80D4FF");
            }
        }
    }
}

async function queryPlayers() {
    const playersToLookup: string[] = [];
    for (const record of records.value) {
        if (props.map != null) {
            playersToLookup.push(
                ...(record as IMapRecord[]).map((p) => p.player),
            );
        }
        if (props.genericRecord != null) {
            playersToLookup.push(
                ...(record as IGenericRecord[])
                    .map((p) => p.players)
                    .reduce((a, b) => a.concat(b)),
            );
        }
    }

    await playerLookup.queryPlayers(playersToLookup);
}

const selectedScale = ref("All time");
const selectedYear = ref(DateTime.now().year);
const selectedMonth = ref(DateTime.now().month);

const axisLabels = computed(() => {
    const startDate = timeSpan.value.start;
    const endDate = timeSpan.value.end;
    const amountDays = endDate.diff(startDate).as("days");

    const axisLabels = [];

    for (let i = 0; i < amountDays; i++) {
        const currentDate = startDate.plus({ days: i });

        axisLabels.push(
            currentDate
                .setLocale(useLocale().value)
                .toLocaleString(DateTime.DATE_SHORT),
        );
    }

    return axisLabels;
});

function rebuildRecord(
    records: (IGenericRecord | IMapRecord)[],
    startDate: DateTime,
    amountDays: number,
) {
    const sortedRecords = records.toSorted((a, b) => a.timestamp - b.timestamp);

    let currentRecordIndex =
        sortedRecords.findIndex((r) => r.timestamp >= startDate.toMillis()) - 1;
    let startingI = 0;
    if (currentRecordIndex < 0) {
        currentRecordIndex = 0;
        startingI = Math.abs(
            startDate
                .diff(
                    DateTime.fromMillis(
                        sortedRecords[currentRecordIndex].timestamp,
                    ),
                )
                .as("days"),
        );
    }
    const startingRecord = sortedRecords[currentRecordIndex];

    let recordHolders: string[] = [];
    if (isMapRecord(startingRecord)) {
        recordHolders = [playerLookup.get(startingRecord.player)];
    }
    if (isGenericRecord(startingRecord)) {
        recordHolders = startingRecord.players.map((p) => playerLookup.get(p));
    }

    const points: unknown[] = [];

    for (let i = 0; i < amountDays; i++) {
        if (
            sortedRecords[currentRecordIndex + 1]?.timestamp <
            startDate.plus({ days: i }).toMillis()
        ) {
            currentRecordIndex++;
            const record = sortedRecords[currentRecordIndex];
            if (isMapRecord(record)) {
                recordHolders = [playerLookup.get(record.player)];
            }
            if (isGenericRecord(record)) {
                recordHolders = record.players.map((p) => playerLookup.get(p));
            }
        }

        points.push({
            y: i < startingI ? null : sortedRecords[currentRecordIndex].time,
            x: startDate.plus({ days: i }).toMillis(),
            recordHolders,
        });
    }
    return points;
}

const data = computed(() => {
    const startDate = timeSpan.value.start;
    const endDate = timeSpan.value.end;
    const amountDays = endDate.diff(startDate).as("days");

    const dataSets: unknown[][] = [];
    for (const record of records.value) {
        dataSets.push(rebuildRecord(record, startDate, amountDays));
    }

    return dataSets;
});

const timeSpan = computed(() => {
    if (selectedScale.value === "Year") {
        return {
            start: DateTime.fromObject({
                year: selectedYear.value,
                month: 1,
                day: 1,
            }),
            end: DateTime.min(
                DateTime.fromObject({
                    year: selectedYear.value,
                    month: 12,
                    day: 31,
                }),
                DateTime.now(),
            ),
        };
    }
    if (selectedScale.value === "Month") {
        return {
            start: DateTime.fromObject({
                year: selectedYear.value,
                month: selectedMonth.value,
                day: 1,
            }),
            end: DateTime.min(
                DateTime.fromObject({
                    year: selectedYear.value,
                    month: selectedMonth.value + 1,
                    day: 1,
                }).minus({ day: 1 }),
                DateTime.now(),
            ),
        };
    }
    return {
        start: earliestRecordTime.value,
        end: DateTime.now(),
    };
});

const possibleYears = computed(() => {
    const start = earliestRecordTime.value;
    const end = DateTime.now().endOf("year");
    const amountYears = end.diff(start).as("years");

    const years: number[] = [];

    for (let i = 0; i < amountYears; i++) {
        years.push(start.year + i);
    }

    return years;
});

const possibleMonths = computed(() => {
    const start = DateTime.fromObject({
        year: selectedYear.value,
        month: 1,
        day: 1,
    });
    const end = DateTime.min(
        DateTime.fromObject({ year: selectedYear.value, month: 12, day: 31 }),
        DateTime.now().endOf("month"),
    );
    const amountMonths = end.diff(start).as("months");

    const months: number[] = [];

    for (let i = 0; i < amountMonths - 1; i++) {
        months.push(start.month + i);
    }

    return months;
});

const earliestRecordTime = computed(() => {
    let earliestRecord = undefined;
    for (const recordType of records.value) {
        for (const record of recordType) {
            if (
                earliestRecord === undefined ||
                record.timestamp < earliestRecord.timestamp
            ) {
                earliestRecord = record;
            }
        }
    }

    if (earliestRecord === undefined) {
        return DateTime.now();
    }

    return DateTime.fromMillis(earliestRecord.timestamp);
});

function axisLabelFunction(value: string | number): string {
    return Duration.fromMillis((value as number) * 1000).toFormat("hh:mm:ss");
}

function tooltipLabelFunction(item: TooltipItem<"line">): string {
    return (
        Duration.fromMillis(item.parsed.y * 1000).toFormat("hh:mm:ss") +
        " by " +
        (item.raw as { recordHolders: string[] }).recordHolders.join(", ")
    );
}

function isGenericRecord(
    record: IGenericRecord | IMapRecord,
): record is IGenericRecord {
    return "players" in record && "record" in record;
}

function isMapRecord(
    record: IGenericRecord | IMapRecord,
): record is IMapRecord {
    return "player" in record && "map" in record;
}

const selectableRecords = computed(() => {
    if (props.map != null) {
        const sorted = [
            getMapsBySeason(1),
            getMapsBySeason(2),
            getMapsBySeason(3),
        ];

        return sorted.map((season) =>
            season.map((map) => {
                return {
                    text: getMap(map)!.name,
                    value: map,
                };
            }),
        );
    }
    if (props.genericRecord != null) {
        return [Object.values(GenericRecordType)];
    }
    return [];
});
</script>
