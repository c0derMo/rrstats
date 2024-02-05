<template>
    <div>
        <SwitchComponent id="showUnofficialToggle" v-model="showUnofficial" label="Show unofficial competitions" />
        <DataTableComponent :headers="headers" :rows="sortedPlacements">
            <template #competition="{ row }">
                {{ competitions[row.competition].name }}
                <span v-if="row.bracket !== ''"> - {{ row.bracket }}</span>
            </template>
    
            <template #placement="{ row }">
                <Tag class="!py-0" :color="getTagColor(row.placement)">
                    {{ formatPlacement(row.placement) }}
                </Tag>
            </template>
        </DataTableComponent>
    </div>
</template>

<script setup lang="ts">
import { ICompetition, ICompetitionPlacement } from "~/utils/interfaces/ICompetition";

const props = defineProps({
    placements: {
        type: Array<ICompetitionPlacement>,
        default: [],
    },
    competitions: {
        type: Object as PropType<Record<string, ICompetition>>,
        default: () => {},
    },
});

const headers = [
    { key: "competition", title: "Competiton" },
    { key: "placement", title: "Placement" },
];

const showUnofficial = ref(true);

const sortedPlacements = computed(() => {
    return props.placements.filter((a) => {
        return showUnofficial.value || props.competitions[a.competition].officialCompetition;
    }).sort((a, b) => {
        return props.competitions[b.competition].startingTimestamp - props.competitions[a.competition].startingTimestamp;
    });
});

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
