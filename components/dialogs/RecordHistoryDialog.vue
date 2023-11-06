<template>
    <DialogComponent dialogClass="w-4/5 h-4/5">
        <CardComponent class="w-full h-full">
            <div class="flex flex-col w-full h-full">
                <h1 class="text-center text-xl bold">Record Progression</h1>
                <LineChart :labels="labels" :data="data" :label="label" :y-tick-format-function="axisLabelFunction" :tooltip-label-function="tooltipLabelFunction" :color="getMap(map || -1)?.color || '#80D4FF'" />
                <div class="flex flex-row w-full gap-2">
                    <DropdownComponent :items="['Month', 'Year', 'All time']" v-model="selectedScale" />
                    <DropdownComponent :items="possibleYears" v-model="selectedYear" v-if="selectedScale === 'Year' || selectedScale === 'Month'"/>
                    <DropdownComponent :items="possibleMonths" v-model="selectedMonth" v-if="selectedScale === 'Month'" />
                </div>
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import { TooltipItem } from 'chart.js';
import { Duration, DateTime } from 'luxon';
import { IGenericRecord, IMapRecord } from '~/utils/interfaces/IRecord';

const props = defineProps({
    'map': {
        type: Number,
        required: false,
    },
    'genericRecord': {
        type: String,
        required: false,
    },
    'players': {
        type: Object as PropType<Record<string, string>>,
        required: false,
        default: {}
    }
});

const label = getMap(props.map ?? -1)?.name ?? props.genericRecord ?? "";
const records = (await useFetch("/api/records/history", { query: { map: props.map, generic: props.genericRecord } })).data;

const selectedScale = ref('Year');
const selectedYear = ref(DateTime.now().year);
const selectedMonth = ref(DateTime.now().month);

const labels = computed(() => {
    const startDate = timeSpan.value.start;
    const endDate = timeSpan.value.end;
    const amountDays = endDate.diff(startDate).as('days');

    const labels = [];

    for (let i = 0; i < amountDays; i++) {
        const currentDate = startDate.plus({ days: i });

        labels.push(currentDate.toLocaleString(DateTime.DATE_SHORT));
    }

    return labels;
});

const data = computed(() => {
    const startDate = timeSpan.value.start;
    const endDate = timeSpan.value.end;
    const amountDays = endDate.diff(startDate).as('days');

    const data: unknown[] = [];
    const sortedRecords = records.value?.toSorted((a, b) => a.timestamp - b.timestamp) || [];

    // Finding the first record in our timeframe
    let currentRecordIndex = sortedRecords.findIndex(r => r.timestamp >= startDate.toMillis()) - 1;
    if (currentRecordIndex < 0) currentRecordIndex = 0;

    for (let i = 0; i < amountDays; i++) {
        if (sortedRecords[currentRecordIndex+1]?.timestamp < startDate.plus({ days: i }).toMillis()) {
            currentRecordIndex++;
        }

        const recordHolders: string[] = [];
        const record = sortedRecords[currentRecordIndex];
        if (isMapRecord(record)) {
            recordHolders.push(props.players[record.player] || `Unknown player: ${record.player}`);
        }
        if (isGenericRecord(record)) {
            recordHolders.push(...record.players.map(p => props.players[p] || `Unknown player: ${p}`));
        }


        data.push({y: sortedRecords[currentRecordIndex].time, x: startDate.plus({ days: i }).toMillis(), recordHolders });
    }

    return data;
});

const timeSpan = computed(() => {
    if (selectedScale.value === 'Year') {
        return {
            start: DateTime.fromObject({ year: selectedYear.value, month: 1, day: 1 }),
            end: DateTime.min(DateTime.fromObject({ year: selectedYear.value, month: 12, day: 31 }), DateTime.now())
        };
    }
    if (selectedScale.value === 'Month') {
        return {
            start: DateTime.fromObject({ year: selectedYear.value, month: selectedMonth.value, day: 1 }),
            end: DateTime.min(DateTime.fromObject({ year: selectedYear.value, month: selectedMonth.value + 1, day: 1 }).minus({ day: 1 }), DateTime.now())
        };
    }
    return {
        start: earliestRecordTime.value,
        end: DateTime.now()
    }
});

const possibleYears = computed(() => {
    const start = earliestRecordTime.value;
    const end = DateTime.now().endOf('year');
    const amountYears = end.diff(start).as('years');
    
    const years: number[] = [];

    for (let i = 0; i < amountYears; i++) {
        years.push(start.year + i);
    }

    return years;
});

const possibleMonths = computed(() => {
    const start = DateTime.fromObject({ year: selectedYear.value, month: 1, day: 1 });
    const end = DateTime.min(DateTime.fromObject({ year: selectedYear.value, month: 12, day: 31 }), DateTime.now().endOf('month'));
    const amountMonths = end.diff(start).as('months');

    const months: number[] = [];
    
    for (let i = 0; i < amountMonths - 1; i++) {
        months.push(start.month + i);
    }

    return months;
});

const earliestRecordTime = computed(() => {
    if (records.value === null) {
        return DateTime.now();
    }
    if (records.value.length === 0) {
        return DateTime.now();
    }
    let earliestRecord = records.value[0];
    for (const record of records.value) {
        if (record.timestamp < earliestRecord.timestamp) {
            earliestRecord = record;
        }
    }
    return DateTime.fromMillis(earliestRecord.timestamp);
});

function axisLabelFunction(value: string | number, index: number, ticks: unknown[]): string {
    return Duration.fromMillis(value as number * 1000).toFormat('hh:mm:ss');
}

function tooltipLabelFunction(item: TooltipItem<"line">): string {
    return Duration.fromMillis(item.parsed.y * 1000).toFormat('hh:mm:ss') + " by " + (item.raw as { recordHolders: string[] }).recordHolders.join(", ");
}

function isGenericRecord(record: IGenericRecord | IMapRecord): record is IGenericRecord {
    return 'players' in record && 'record' in record;
}

function isMapRecord(record: IGenericRecord | IMapRecord): record is IMapRecord {
    return 'player' in record && 'map' in record;
}
</script>