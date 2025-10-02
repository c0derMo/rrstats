<template>
    <div>
        <SwitchComponent
            id="showUnofficialToggle"
            v-model="showUnofficial"
            label="Show unofficial competitions"
        />
        <DataTableComponent :headers="headers" :rows="filteredCompetitions">
            <template #competition="{ row }">
                {{
                    competitions?.find((comp) => comp.tag === row.competition)
                        ?.name
                }}
                <span v-if="row.bracket !== ''"> - {{ row.bracket }}</span>
            </template>

            <template #placement="{ row }">
                <Tag :color="getTagColor(row.placement)" :narrow="true">
                    {{ formatPlacement(row.placement) }}
                </Tag>
            </template>
        </DataTableComponent>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        placements?: ICompetitionPlacement[];
        competitions?: ICompetition[] | null;
    }>(),
    {
        placements: () => [],
        competitions: () => [],
    },
);

const headers = [
    { key: "competition", title: "Competiton" },
    { key: "placement", title: "Placement" },
];

const showUnofficial = ref(true);

const filteredCompetitions = computed(() => {
    return props.placements.filter((a) => {
        return (
            showUnofficial.value ||
            props.competitions?.find((comp) => comp.tag === a.competition)
                ?.officialCompetition
        );
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
