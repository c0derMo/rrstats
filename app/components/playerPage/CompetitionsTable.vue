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
                <PlacementTag narrow :placement="row.placement" />
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
</script>
