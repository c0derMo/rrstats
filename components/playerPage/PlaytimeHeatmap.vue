<template>
    <table class="table-fixed w-full">
        <thead>
            <tr class="w-full">
                <th></th>
                <th>00 - 02</th>
                <th>03 - 04</th>
                <th>05 - 06</th>
                <th>07 - 08</th>
                <th>09 - 10</th>
                <th>11 - 12</th>
                <th>13 - 14</th>
                <th>15 - 16</th>
                <th>17 - 18</th>
                <th>19 - 20</th>
                <th>21 - 22</th>
                <th>23 - 24</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="weekday, index in weekdays">
                <td>{{ weekday }}</td>
                <td :class="getDayColorClass(index, 0)"></td>
                <td :class="getDayColorClass(index, 1)"></td>
                <td :class="getDayColorClass(index, 2)"></td>
                <td :class="getDayColorClass(index, 3)"></td>
                <td :class="getDayColorClass(index, 4)"></td>
                <td :class="getDayColorClass(index, 5)"></td>
                <td :class="getDayColorClass(index, 6)"></td>
                <td :class="getDayColorClass(index, 7)"></td>
                <td :class="getDayColorClass(index, 8)"></td>
                <td :class="getDayColorClass(index, 9)"></td>
                <td :class="getDayColorClass(index, 10)"></td>
                <td :class="getDayColorClass(index, 11)"></td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { IMatch } from '~/utils/interfaces/IMatch';

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const colorMap = {
    0: 'bg-gray-900',
    1: 'bg-blue-900',
    2: 'bg-blue-800',
    3: 'bg-blue-700',
    4: 'bg-blue-600',
    5: 'bg-blue-500',
    6: 'bg-blue-400',
    7: 'bg-blue-300',
    8: 'bg-blue-200',
    9: 'bg-blue-100',
} as Record<number, string>;

const props = defineProps({
    'matches': {
        type: Object as PropType<IMatch[]>,
        required: true
    }
});

function getMatchesInTimeslot(weekday: number, timeslot: number): number {
    const timeframeStart = timeslot * 2;
    const timeframeEnd = timeframeStart + 1;

    const matches = props.matches.filter((m) => {
        const dt = DateTime.fromMillis(m.timestamp);
        return dt.weekday === weekday && (dt.hour >= timeframeStart && dt.hour <= timeframeEnd);
    });
    return matches.length;
}

function getDayColorClass(weekday: number, timeslot: number): string {
    const amountMatches = getMatchesInTimeslot(weekday, timeslot);
    const percentage = amountMatches / props.matches.length;
    return colorMap[Math.ceil(percentage * 10)];
}
</script>