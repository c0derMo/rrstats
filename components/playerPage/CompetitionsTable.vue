<template>
    <TableComponent :headers="headers" :rows="placements">
        <template #competition="{ row }">
            {{ competitionNames[row.competition] }}
            <span v-if="row.bracket !== ''"> - {{ row.bracket }}</span>
        </template>

        <template #placement="{ row }">
            {{ formatPlacement(row.placement) }}
        </template>
    </TableComponent>
</template>

<script setup lang="ts">
import { ICompetitionPlacement } from "~/utils/interfaces/ICompetition";

defineProps({
    placements: {
        type: Array<ICompetitionPlacement>,
        default: [],
    },
    competitionNames: {
        type: Object as PropType<Record<string, string>>,
        default: () => {},
    },
});

const headers = [
    { key: "competition", title: "Competiton" },
    { key: "placement", title: "Placement" },
];
</script>
