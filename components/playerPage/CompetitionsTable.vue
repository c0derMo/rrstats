<template>
    <TableComponent :headers="headers" :rows="placements">

        <template v-slot:competition="{ row }">
            {{ competitionNames[row.competition] }}
            <span v-if="row.bracket !== ''"> - {{ row.bracket }}</span>
        </template>

        <template v-slot:placement="{ row }">
            {{ formatPlacement(row.placement) }}
        </template>

    </TableComponent>
</template>

<script setup lang="ts">
import { ICompetitionPlacement } from '~/utils/interfaces/ICompetition';

defineProps({
    placements: {
        type: Array<ICompetitionPlacement>,
        default: []
    },
    competitionNames: {
        type: Object as PropType<Record<string, string>>,
        default: {}
    }
});

const headers = [
    { key: 'competition', title: 'Competiton' },
    { key: 'placement', title: 'Placement' }
];

function formatPlacement(placement?: number): string {
    if (placement == null) {
        return "GS";
    }
    if (placement === 1) {
        return '1st';
    }
    if (placement === 2) {
        return '2nd';
    }
    if (placement === 3) {
        return '3rd';
    }
    return `${placement}th`;
}
</script>