<template>
    <div class="table" :style="wrapperStyle">
        <template v-if="hasHeaders">
            <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="cell header" :class="getCellClasses({ ...column.headerStyle, content: '' }, columnIndex)">
                {{ column.title ?? '' }}
            </div>
        </template>

        <template v-for="(row, rowIndex) in rows" :key="rowIndex">
            <div
                v-for="(cell, cellIndex) in row.cells"
                :key="cellIndex"
                class="cell"
                :class="getCellClasses(cell, cellIndex)"
            >
                <slot :name="getColumnName(cellIndex)" :content="cell.content" :cell="cell">
                    <template v-if="cell.expansionButton">
                        <div @click="expandRow(rowIndex)">
                            <FontAwesomeIcon
                                :icon="['fas', 'chevron-down']"
                                class="transition"
                                :class="{ 'rotate-180': expandedRow === rowIndex }"
                            />
                        </div>
                    </template>
                    <template v-else>
                        {{ cell.content }}
                    </template>
                </slot>
            </div>

                <div v-if="expandedRow === rowIndex && row.expandable" class="expansion-container">
                    <slot name="rowExpansion" :row="row" :index="rowIndex" />
                </div>
        </template>
    </div>
</template>

<style scoped>
.cell {
    @apply border border-neutral-200 dark:border-neutral-500;
}

.header {
    @apply font-bold;
}

.table {
    @apply dark:bg-neutral-700 bg-neutral-100;
    display: grid;
}

.expansion-container {
    grid-column: 1 / -1;
}
</style>

<script setup lang="ts" generic="R extends Row">
export interface CellStyle {
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    color?: string;
    paddingY?: number;
    paddingX?: number;
}

export interface ColumnDefinition extends CellStyle {
    name: string;
    width: string;
    title?: string;
    headerStyle?: CellStyle;
}

export interface Row {
    cells: Cell[];

    expandable?: boolean;
}

export interface Cell extends CellStyle {
    content: unknown;
    expansionButton?: boolean;
}

const props = defineProps<{
    columns: ColumnDefinition[];
    rows: R[];
}>();

const expandedRow = ref(-1);

const wrapperStyle = computed(() => {
    return {
        "grid-template-columns": props.columns.map((col) => col.width).join(" "),
    }
});

const hasHeaders = computed<boolean>(() => {
    return props.columns.some((col) => col.title != null);
});

function getColumnName(columnIndex: number): string {
    return props.columns[columnIndex]?.name ?? "";
}

function getCellClasses(cell: Cell, columnIndex: number): string[] {
    const defaultOptions: Required<CellStyle> = {
        textAlign: 'left',
        backgroundColor: '',
        color: '',
        paddingX: 2,
        paddingY: 1,
    };

    const columnStyle = props.columns[columnIndex] ?? {};

    Object.assign(defaultOptions, columnStyle);
    Object.assign(defaultOptions, cell);

    const resultingClasses: string[] = [];

    switch (defaultOptions.textAlign) {
        case 'left':
            resultingClasses.push('text-left');
            break;
        case 'center':
            resultingClasses.push('text-center');
            break;
        case 'right':
            resultingClasses.push('text-right');
            break;
    }

    if (defaultOptions.backgroundColor != '') {
        resultingClasses.push(...defaultOptions.backgroundColor.split(" "));
    }
    if (defaultOptions.color != '') {
        resultingClasses.push(...defaultOptions.color.split(" "));
    }

    resultingClasses.push(`px-${defaultOptions.paddingX}`, `py-${defaultOptions.paddingY}`);

    return resultingClasses;
}

function expandRow(index: number) {
    if (expandedRow.value === index) {
        expandedRow.value = -1;
    } else {
        expandedRow.value = index;
    }
    console.log(`Expanded ${expandedRow.value}`);
}
</script>