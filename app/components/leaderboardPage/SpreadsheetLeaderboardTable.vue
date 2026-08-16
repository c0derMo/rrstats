<template>
    <div class="flex flex-col gap-2">
        <SpreadsheetTable
            :columns="spreadsheetTableColumns"
            :rows="paginatedSpreadsheetTableRows"
        >
            <template #placement="{ content }">
                <PlacementTag narrow :placement="castUnknown(content)" />
            </template>

            <template #image="{ content }">
                <img class="h-6 aspect-auto mx-auto" :src="castUnknown(content)" />
            </template>

            <template #player="{ content }">
                <PlayerLinkTag :player="castUnknown(content)" />
            </template>

            <template #map="{ content }">
                <MapTag :map="getMap(castUnknown(content))!" full-name narrow />
            </template>

            <template #rowExpansion="{ row }">
                <div class="mx-4 grid gap-1" :style="getGridColsOfRow(row)">
                    <template v-for="expansionRow of row.expansionRows">
                        <div v-for="(col, colID) of expansionRow" :key="colID" class="text-center">
                            {{ col }}
                        </div>
                    </template>
                </div>
            </template>
        </SpreadsheetTable>

        <div
            class="flex flex-row mt-3 gap-1 justify-end px-3 h-fit items-center flex-nowrap text-nowrap"
        >
            <span class="md:text-base text-sm">Rows per page:</span>
            <DropdownComponent
                v-model="selectedRowsPerPage"
                :items="selectableRowsPerPage"
            />
            <div class="md:max-w-3 w-full" />
            <span class="md:text-base text-sm">
                {{ startIndex + 1 }} - {{ endIndex }} of {{ amountOfItems }}
            </span>
            <div class="md:max-w-3 w-full" />
            <ButtonComponent @click="previousPage">&lt;</ButtonComponent>
            <ButtonComponent @click="nextPage">&gt;</ButtonComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Cell, CellStyle, ColumnDefinition, Row } from '../tables/SpreadsheetTable.vue';

const players = usePlayers();

const props = defineProps<{
    tableDefinition: LeaderboardTableDefinition;
    rows: LeaderboardRow[];
    filters: Record<string, unknown>;
    search: string;
}>();

const amountOfItems = computed(() => {
    return filteredSpreadsheetTableRows.value.length;
});

const selectableRowsPerPage = [
    { text: "15", value: 15 },
    { text: "30", value: 30 },
    { text: "50", value: 50 },
    { text: "All", value: -1 },
];

const selectedRowsPerPage = ref(15);
const pageIndex = ref(0);

const startIndex = computed(() => {
    return pageIndex.value * selectedRowsPerPage.value;
});

const endIndex = computed(() => {
    if (selectedRowsPerPage.value <= 0) {
        return amountOfItems.value;
    }
    return Math.min((pageIndex.value + 1) * selectedRowsPerPage.value, amountOfItems.value);
});

const spreadsheetTableColumns = computed<ColumnDefinition[]>(() => {
    const columnDefinitions = props.tableDefinition.columns
        .filter((column) => column.type !== LeaderboardColumnType.HIDDEN)
        .map((column) => {
            const columnDefinition: ColumnDefinition = {
                name: column.name,
                title: column.name,
                width: 'auto',
                textAlign: 'left'
            };

            if (column.type === LeaderboardColumnType.PLACEMENT_TAG) {
                columnDefinition.name = 'placement';
                columnDefinition.title = '';
                columnDefinition.width = '100px';
                columnDefinition.textAlign = 'right';
            }

            if (column.type === LeaderboardColumnType.IMAGE) {
                columnDefinition.name = 'image';
                columnDefinition.title = '';
                columnDefinition.width = '50px';
                columnDefinition.textAlign = 'center';
            }

            if (column.type === LeaderboardColumnType.PLAYER_NAME) {
                columnDefinition.name = 'player';
            }
            if (column.type === LeaderboardColumnType.MAP) {
                columnDefinition.name = 'map';
            }

            return columnDefinition;
        });

    if (props.rows.some((row) => row.expandableRows != null)) {
        columnDefinitions.push({
            name: 'expansion',
            width: '50px',
            textAlign: 'center'
        });
    }

    return columnDefinitions;
});

const filteredSpreadsheetTableRows = computed<(Row & { expansionRows?: string[][]})[]>(() => {
    return props.rows
        .filter((row) => {
            return props.tableDefinition.columns.map((column) => {
                if (column.serverSideFilter === true || column.filterable == null || props.filters[column.name] == null) {
                    return true;
                }
                switch (column.filterable) {
                    case LeaderboardFilterType.TEXT:
                        if (typeof row.columns[column.name] !== "string") {
                            return true;
                        }
                        return (row.columns[column.name] as string).toLowerCase().includes(props.filters[column.name] as string ?? "");
                    case LeaderboardFilterType.MAP:
                    case LeaderboardFilterType.MAP_OPTIONAL:
                        if (typeof row.columns[column.name] !== "number" || props.filters[column.name] as number < 0) {
                            return true;
                        }
                        return (row.columns[column.name] as number) === props.filters[column.name];
                    case LeaderboardFilterType.NUMERIC:
                        if (typeof row.columns[column.name] !== "number" || props.filters[column.name] as number < 0) {
                            return true;
                        }
                        return (row.columns[column.name] as number) >= (props.filters[column.name] as number);
                }
                return true;
            }).reduce((prev, cur) => prev && cur);
        })
        .map((row, _, array) => {
            const columns: Cell[] = [];
            const searchables: string[] = [];
            const placement = array.findIndex((search) => search.order === row.order) + 1;

            for (const column of props.tableDefinition.columns) {
                if (row.columns[column.name] != null) {
                    const cellStyle: CellStyle = {};
                    let value = row.columns[column.name];

                    if (column.type === LeaderboardColumnType.PLAYER_NAME) {
                        value = players.get(value as string);
                        searchables.push(value as string);
                    }
                    
                    if (column.colored && row.backgroundColor != null) {
                        cellStyle.backgroundColor = row.backgroundColor;
                    }
                    if (column.colored && row.color != null) {
                        cellStyle.color = row.color;
                    }
                    if (column.searchable) {
                        searchables.push(value as string);
                    }

                    columns.push({
                        ...cellStyle,
                        content: value
                    });
                }
                if (column.type === LeaderboardColumnType.PLACEMENT_TAG) {
                    columns.push({
                        content: placement
                    });
                }
            }

            if (row.expandableRows != null) {
                columns.push({
                    content: "",
                    expansionButton: true
                });
            }

            return {
                columns,
                searchables,
                order: row.order,
                expansionRows: row.expandableRows as string[][]
            };
        })
        .sort((a, b) => a.order - b.order)
        .filter(
            (row) => {
                return props.search === '' ||
                    row.searchables.some((searchable) => searchable.toLowerCase().includes(props.search.toLowerCase()))
            }
        )
        .map((row) => ({
            cells: row.columns,
            expansionRows: row.expansionRows,
            expandable: row.expansionRows != null,
        }));
});

const paginatedSpreadsheetTableRows = computed<(Row & { expansionRows?: string[][] })[]>(() => {
    if (selectedRowsPerPage.value < 0) {
        return filteredSpreadsheetTableRows.value;
    }
    return filteredSpreadsheetTableRows.value
        .slice(startIndex.value, endIndex.value + 1);
});

function getGridColsOfRow(row: Row & { expansionRows?: string[][] }) {
    if (row.expansionRows == null) {
        return {};
    }

    return { 
        'grid-template-columns': "1fr ".repeat(row.expansionRows[0].length)
    };
}

function nextPage() {
    pageIndex.value = Math.min(
        pageIndex.value + 1,
        Math.floor(amountOfItems.value / selectedRowsPerPage.value)
    );
}

function previousPage() {
    pageIndex.value = Math.max(
        pageIndex.value - 1,
        0
    );
}

function castUnknown<T>(val: unknown): T {
    return val as T;
}
</script>