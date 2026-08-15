<template>
    <div class="flex flex-col gap-2">
        <TextInputComponent
            v-model="search"
            class="w-full"
            :placeholder="`Search for player...`"
        />

        <SpreadsheetTable
            :columns="spreadsheetTableColumns"
            :rows="spreadsheetTableRows"
        >
            <template #placement="{ content }">
                <PlacementTag narrow :placement="unknownToNumber(content)" />
            </template>

            <template #image="{ content }">
                <img class="h-6 aspect-auto mx-auto" :src="unknownAsString(content)" />
            </template>
    
        </SpreadsheetTable>
    </div>
</template>

<script setup lang="ts">
import type { Cell, CellStyle, ColumnDefinition, Row } from '../tables/SpreadsheetTable.vue';

const players = usePlayers();

const props = defineProps<{
    tableDefinition: LeaderboardTableDefinition;
    rows: LeaderboardRow[];
}>();

const search = ref("");

const spreadsheetTableColumns = computed<ColumnDefinition[]>(() => {
    return props.tableDefinition.columns.map((column) => {
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

        return columnDefinition;
    });
});

const spreadsheetTableRows = computed<Row[]>(() => {
    return props.rows
        .map((row) => {
            const columns: Cell[] = [];
            const searchables: string[] = [];

            const sharedOptions: CellStyle = {};
            if (row.backgroundColor != null) {
                sharedOptions.backgroundColor = row.backgroundColor;
            }
            if (row.color != null) {
                sharedOptions.color = row.color;
            }

            for (const column of props.tableDefinition.columns) {
                if (row.columns[column.name] != null) {
                    let value = row.columns[column.name];

                    if (column.type === LeaderboardColumnType.PLAYER_NAME) {
                        value = players.get(value as string);
                        searchables.push(value as string);
                    }

                    columns.push({
                        ...sharedOptions,
                        content: value
                    });
                }
            }

            return {
                columns,
                searchables,
                order: row.order
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
            cells: row.columns
        }));
});

function unknownToNumber(val: unknown): number {
    return val as number;
}

function unknownAsString(val: unknown): string {
    return val as string;
}
</script>