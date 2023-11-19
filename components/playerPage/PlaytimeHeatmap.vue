<template>
    <table class="table-fixed w-full">
        <thead>
            <tr class="w-full">
                <th></th>
                <th v-for="timeslot in timeslots">{{ timeslot }}</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="(weekday, index) in weekdays"
                class="text-center transition-all"
            >
                <td>{{ weekday }}</td>
                <td
                    v-for="(timeslot, tIndex) in timeslots"
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
import { IMatch } from "~/utils/interfaces/IMatch";

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
    0: "bg-gray-900 text-white dark:text-white",
    1: "bg-blue-950 text-white dark:text-white",
    2: "bg-blue-900 text-white dark:text-white",
    3: "bg-blue-800 text-white dark:text-white",
    4: "bg-blue-700 text-white dark:text-white",
    5: "bg-blue-600 text-white dark:text-white",
    6: "bg-blue-500 text-white dark:text-white",
    7: "bg-blue-400 text-black dark:text-black",
    8: "bg-blue-300 text-black dark:text-black",
    9: "bg-blue-200 text-black dark:text-black",
    10: "bg-blue-100 text-black dark:text-black",
} as Record<number, string>;

const props = defineProps({
    matches: {
        type: Object as PropType<IMatch[]>,
        required: true,
    },
});

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
