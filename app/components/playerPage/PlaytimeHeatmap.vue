<template>
    <table class="table-fixed w-full">
        <thead>
            <tr class="w-full">
                <th />
                <th v-for="timeslot in timeslots" :key="timeslot">
                    {{ timeslot }}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="(weekday, index) in weekdays"
                :key="index"
                class="text-center transition-all"
            >
                <td>{{ weekday }}</td>
                <td
                    v-for="(timeslot, tIndex) in timeslots"
                    :key="tIndex"
                    :class="getDayColorClass(index, tIndex)"
                    class="text-[0px] hover:text-base transition-all"
                >
                    {{ getMatchesInTimeslot(index, tIndex) }}
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";

const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
const timeslots = [
    "00 - 01",
    "02 - 03",
    "04 - 05",
    "06 - 07",
    "08 - 09",
    "10 - 11",
    "12 - 13",
    "14 - 15",
    "16 - 17",
    "18 - 19",
    "20 - 21",
    "22 - 23",
];

const colorMap = {
    0: "dark:bg-gray-900 bg-gray-100 text-black dark:text-white",
    1: "dark:bg-blue-950 bg-blue-100 text-black dark:text-white",
    2: "dark:bg-blue-900 bg-blue-200 text-black dark:text-white",
    3: "dark:bg-blue-800 bg-blue-300 text-black dark:text-white",
    4: "dark:bg-blue-700 bg-blue-400 text-white dark:text-white",
    5: "dark:bg-blue-600 bg-blue-500 text-white dark:text-white",
    6: "dark:bg-blue-500 bg-blue-600 text-white dark:text-white",
    7: "dark:bg-blue-400 bg-blue-700 text-white dark:text-black",
    8: "dark:bg-blue-300 bg-blue-800 text-white dark:text-black",
    9: "dark:bg-blue-200 bg-blue-900 text-white dark:text-black",
    10: "dark:bg-blue-100 bg-blue-950 text-white dark:text-black",
} as Record<number, string>;

const props = defineProps<{
    matches: IMatch[];
}>();

const matchesInSlots = computed(() => {
    const timeslots: number[] = Array(7 * 12).fill(0);

    for (const match of props.matches) {
        const dt = DateTime.fromMillis(match.timestamp);
        const index = (dt.weekday - 1) * 12 + Math.floor(dt.hour / 2);
        timeslots[index]++;
    }

    return timeslots;
});

function getMatchesInTimeslot(weekday: number, timeslot: number): number {
    return matchesInSlots.value[weekday * 12 + timeslot];
}

function getDayColorClass(weekday: number, timeslot: number): string {
    const amountMatches = getMatchesInTimeslot(weekday, timeslot);
    const percentage =
        amountMatches / matchesInSlots.value.reduce((a, b) => Math.max(a, b));
    return colorMap[Math.ceil(percentage * 10)];
}
</script>
