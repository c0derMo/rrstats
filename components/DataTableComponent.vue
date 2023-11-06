<template>
    <TableComponent :headers="convertedHeaders" :rows="filteredRows">
        <template v-for="header of convertedHeaders" :key="header.key" v-slot:[`header-${header.key}`]="{ value }">
            <span @click="changeSorting(header)" class="group">
                <FontAwesomeIcon
                    :icon="['fas', 'arrow-up']"
                    :class="{
                        'rotate-180': sortingOrder === 'DESC' && sortingBy === header.key,
                        '!opacity-100': sortingBy === header.key,
                        'group-hover:opacity-40': enableSorting && !header.disableSort
                    }"
                    class="transition opacity-0 mr-1"
                ></FontAwesomeIcon>
                <slot :name="`header-${header.key}`" :value="header.title">
                    {{ value }}
                </slot>
            </span>
        </template>

        <template v-for="header of convertedHeaders" :key="header.key" v-slot:[`${header.key}`]="{ value, row }">
            <span class="ml-4">
                <slot :name="header.key" :value="value" :row="row">
                    {{ value }}
                </slot>
            </span>
        </template>
    </TableComponent>

    <div class="flex flex-row mt-3 space-x-1 justify-end px-3 h-fit items-center">
        <span>Rows per page:</span>
        <DropdownComponent :items="rowsPerPage" v-model="selectedRowsPerPage"></DropdownComponent>
        <div class="w-3"></div>
        <span>{{ startIndex + 1 }} - {{ endIndex }} of {{ props.rows.length }}</span>
        <div class="w-3"></div>
        <ButtonComponent @click="previousPage">&lt;</ButtonComponent>
        <ButtonComponent @click="nextPage">&gt;</ButtonComponent>
    </div>
</template>

<script setup lang="ts" generic="R extends { [key in keyof any]: unknown }">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

interface ExtendedHeader {
    key: string,
    title: string,
    disableSort?: boolean,
}

library.add(faArrowUp);

const props = defineProps({
    headers: {
        type: Array as () => string[] | ExtendedHeader[],
        required: true
    },
    rows: {
        type: Array as () => R[],
        required: true
    },
    enableSorting: {
        type: Boolean,
        required: false,
        default: true,
    },
    alwaysSort: {
        type: Boolean,
        required: false,
        default: false,
    },
    rowsPerPage: {
        type: Array<number>,
        required: false,
        default: [5, 10, 20]
    },
    defaultRowsPerPage: {
        type: Number,
        required: false,
        default: 5
    }
});

const selectedRowsPerPage = ref(props.defaultRowsPerPage);
const selectedPage = ref(1);
const sortingBy: Ref<string | null> = ref(null);
const sortingOrder: Ref<"ASC" | "DESC" | null> = ref(null);

const convertedHeaders: ComputedRef<ExtendedHeader[]> = computed(() => {
    if (props.headers.length === 0) {
        return [];
    };
    if ((props.headers[0] as ExtendedHeader).key !== undefined) {
        return props.headers as ExtendedHeader[];
    }
    return (props.headers as string[]).map(header => {
        return { key: header, title: header }
    });
});

if (props.alwaysSort) {
    sortingBy.value = convertedHeaders.value[0].key;
    sortingOrder.value = 'ASC';
}

const startIndex = computed(() => {
    return (selectedPage.value - 1) * selectedRowsPerPage.value;
});
const endIndex = computed(() => {
    return Math.min(selectedPage.value * selectedRowsPerPage.value, props.rows.length);
});

const filteredRows = computed(() => {
    let result = props.rows.slice();

    if (sortingBy.value !== null && props.enableSorting) {
        result = result.sort((a, b) => {
            const valA = a[sortingBy.value as string];
            const valB = b[sortingBy.value as string];

            if (!isNaN(valA as number) && !isNaN(valB as number)) {
                if (sortingOrder.value === 'ASC') {
                    return valA as number - (valB as number);
                } else {
                    return valB as number - (valA as number);
                }
            }

            if (sortingOrder.value === 'ASC') {
                return (valA as string).localeCompare((valB as string));
            } else {
                return (valB as string).localeCompare((valA as string));
            }
        });
    }

    result = result.slice(startIndex.value, endIndex.value);

    return result;
});

function nextPage() {
    if (selectedPage.value < (props.rows.length / selectedRowsPerPage.value)) {
        selectedPage.value++;
    }
}

function previousPage() {
    if (selectedPage.value > 1) {
        selectedPage.value--;
    }
}

function changeSorting(key: ExtendedHeader) {
    if (!props.enableSorting || key.disableSort) {
        return;
    }
    if (sortingBy.value !== key.key) {
        sortingBy.value = key.key;
        sortingOrder.value = 'ASC';
    } else {
        switch (sortingOrder.value) {
            case 'ASC':
                sortingOrder.value = 'DESC';
                break;
            case 'DESC':
                if (props.alwaysSort) {
                    sortingOrder.value = 'ASC';
                } else {
                    sortingBy.value = null;
                    sortingOrder.value = null;
                }
                break;
        }
    }
}

watch(selectedRowsPerPage, () => {
    if (selectedPage.value > (props.rows.length / selectedRowsPerPage.value)) {
        selectedPage.value = Math.ceil(props.rows.length / selectedRowsPerPage.value);
    }
});
</script>