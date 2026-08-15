<template>
    <div class="flex flex-col gap-2">
        <TextInputComponent
            v-model="search"
            class="w-full"
            :placeholder="`Search for player...`"
        />

        <SpreadsheetTable
            :columns="spreadsheetTableColumns"
            :rows="paginatedSpreadsheetTableRows"
        >
            <template #placement="{ content }">
                <PlacementTag narrow :placement="unknownToNumber(content)" />
            </template>

            <template #image="{ content }">
                <img class="h-6 aspect-auto mx-auto" :src="unknownAsString(content)" />
            </template>

            <template #player="{ content }">
                <PlayerLinkTag :player="unknownAsString(content)" />
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

const search = ref("");
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
    const columnDefinitions = props.tableDefinition.columns.map((column) => {
        const columnDefinition: ColumnDefinition = {
            name: column.name,
            title: column.name,
            width: 'auto',
            textAlign: 'left',
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

const filteredSpreadsheetTableRows = computed<(Row & { expansionRows?: string[][] })[]>(() => {
    return props.rows
        .map((row) => {
            const columns: Cell[] = [];
            const searchables: string[] = [];

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

                    columns.push({
                        ...cellStyle,
                        content: value
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
                return search.value === '' ||
                    row.searchables.some((searchable) => searchable.toLowerCase().includes(search.value.toLowerCase()))
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

function unknownToNumber(val: unknown): number {
    return val as number;
}

function unknownAsString(val: unknown): string {
    return val as string;
}
</script>