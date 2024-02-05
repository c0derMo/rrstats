<template>
    <TableComponent :headers="headers" :rows="placements">
        <template #competition="{ row }">
            {{ competitionNames[row.competition] }}
            <span v-if="row.bracket !== ''"> - {{ row.bracket }}</span>
        </template>

        <template #placement="{ row }">
            <Tag class="py-0" :color="getTagColor(row.placement)">
                {{ formatPlacement(row.placement) }}
            </Tag>
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

function getTagColor(placement?: number) {
    if (placement === 1) {
        return "rgb(214, 175, 54)";
    }
    if (placement === 2) {
        return "rgb(167, 167, 167)";
    }
    if (placement === 3) {
        return "rgb(167, 112, 68)";
    }
    return "rgb(85, 85, 85)";
}
</script>
