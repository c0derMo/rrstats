<template>
    <div class="flex flex-col gap-2">
        <template v-for="(col, idx) of tableDefinition.columns" :key="idx">
            <CompetitionRangeFilter
                v-if="
                    col.filterable === LeaderboardFilterType.COMPETITION_RANGE
                "
                :model-value="castUnknown(filters[col.name])"
                @update:model-value="
                    (v) => updateFilter(col.name, v, col.serverSideFilter)
                "
            />
        </template>

        <div class="flex flex-row gap-5">
            <TextInputComponent
                v-if="hasSearchable"
                v-model="search"
                class="grow"
                :placeholder="`Search for ${searchableEntity}...`"
            />

            <template v-for="(col, idx) of tableDefinition.columns" :key="idx">
                <TextInputComponent
                    v-if="col.filterable === LeaderboardFilterType.TEXT"
                    class="grow"
                    :placeholder="`Filter by ${col.name.toLowerCase()}`"
                    :model-value="castUnknown(filters[col.name])"
                    @update:model-value="
                        (v) => updateFilter(col.name, v, col.serverSideFilter)
                    "
                />

                <TextInputComponent
                    v-if="col.filterable === LeaderboardFilterType.NUMERIC"
                    type="number"
                    class="grow"
                    :placeholder="`Minimum ${col.name.toLowerCase()}`"
                    :model-value="castUnknown(filters[col.name])"
                    @update:model-value="
                        (v) => updateFilter(col.name, v, col.serverSideFilter)
                    "
                />

                <DropdownComponent
                    v-if="
                        col.filterable === LeaderboardFilterType.MAP ||
                        col.filterable === LeaderboardFilterType.MAP_OPTIONAL
                    "
                    class="grow"
                    :model-value="castUnknown(filters[col.name])"
                    :items="selectableMapsFor(col)"
                    @update:model-value="
                        (v) => updateFilter(col.name, v, col.serverSideFilter)
                    "
                />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    tableDefinition: LeaderboardTableDefinition;
}>();

const emits = defineEmits<{
    "update-external-filters": [filters: Record<string, unknown>];
    "update-local-filters": [filters: Record<string, unknown>];
}>();

const search = defineModel<string>("search");
const filters = ref<Record<string, unknown>>({});

for (const col of props.tableDefinition.columns) {
    if (col.defaultFilter != null) {
        filters.value[col.name] = col.defaultFilter;
    }
}
emits("update-local-filters", getInternalFilters());

const hasSearchable = computed<boolean>(() => {
    return props.tableDefinition.columns.some((column) => {
        return (
            column.type === LeaderboardColumnType.PLAYER_NAME ||
            column.searchable
        );
    });
});

const searchableEntity = computed<string>(() => {
    return props.tableDefinition.columns
        .filter((column) => {
            return (
                column.type === LeaderboardColumnType.PLAYER_NAME ||
                column.searchable
            );
        })
        .map((column) => column.name.toLowerCase())
        .join(", ");
});

function selectableMapsFor(col: LeaderboardColumnDefinition) {
    if (
        col.filterable !== LeaderboardFilterType.MAP &&
        col.filterable !== LeaderboardFilterType.MAP_OPTIONAL
    ) {
        return [];
    }

    const maps = getAllMaps().map((map) => {
        return { value: map, text: getMap(map)!.name };
    });
    if (col.filterable === LeaderboardFilterType.MAP_OPTIONAL) {
        return [{ value: -1, text: "All maps" }, ...maps];
    }
    return maps;
}

function getExternalFilters() {
    const externalFilters: Record<string, unknown> = {};

    for (const col of props.tableDefinition.columns) {
        if (col.serverSideFilter) {
            externalFilters[col.name] = filters.value[col.name];
        }
    }

    return externalFilters;
}

function getInternalFilters() {
    const internalFilters: Record<string, unknown> = {};

    for (const col of props.tableDefinition.columns) {
        if (col.serverSideFilter == null || !col.serverSideFilter) {
            internalFilters[col.name] = filters.value[col.name];
        }
    }

    return internalFilters;
}

function updateFilter(col: string, val: unknown, isExternal?: boolean) {
    filters.value[col] = val;
    if (isExternal) {
        emits("update-external-filters", getExternalFilters());
    } else {
        emits("update-local-filters", getInternalFilters());
    }
}

function castUnknown<T>(val: unknown): T {
    return val as T;
}
</script>
