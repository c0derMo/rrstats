<template>
    <TableComponent :headers="convertedHeaders" :rows="filteredRows">
        <template
            v-for="header of convertedHeaders"
            :key="header.key"
            #[`header-${header.key}`]="{ value }"
        >
            <span
                class="group whitespace-nowrap"
                @click="changeSorting(header)"
            >
                <FontAwesomeIcon
                    v-if="enableSorting"
                    :icon="['fas', 'arrow-down']"
                    :class="{
                        'rotate-180':
                            sortingOrder === 'ASC' &&
                            sortingBy?.key === header.key,
                        '!opacity-100': sortingBy?.key === header.key,
                        'group-hover:opacity-40':
                            enableSorting && !header.disableSort,
                    }"
                    class="transition opacity-0 mr-1"
                ></FontAwesomeIcon>
                <slot :name="`header-${header.key}`" :value="header.title">
                    {{ value }}
                </slot>
            </span>
        </template>

        <template
            v-for="header of convertedHeaders"
            :key="header.key"
            #[`${header.key}`]="{ value, row, index }"
        >
            <div :class="{ 'ml-4': enableSorting }">
                <slot
                    :name="header.key"
                    :value="value"
                    :row="row"
                    :index="startIndex + index"
                >
                    {{ value }}
                </slot>
            </div>
        </template>
    </TableComponent>

    <div class="flex flex-row mt-3 gap-1 justify-end px-3 h-fit items-center">
        <span class="md:text-base text-sm">Rows per page:</span>
        <DropdownComponent
            v-model="selectedRowsPerPage"
            :items="selectableRowsPerPage"
        ></DropdownComponent>
        <div class="md:w-3"></div>
        <span class="md:text-base text-sm">
            {{ startIndex + 1 }} - {{ endIndex }} of {{ props.rows.length }}
        </span>
        <div class="md:w-3"></div>
        <ButtonComponent @click="previousPage">&lt;</ButtonComponent>
        <ButtonComponent @click="nextPage">&gt;</ButtonComponent>
    </div>
</template>

<script setup lang="ts" generic="R extends { [key in keyof any]: unknown }">
interface ExtendedHeader {
    key: string;
    title: string;
    disableSort?: boolean;
    sort?: (a: unknown, b: unknown) => number;
}

const props = defineProps({
    headers: {
        type: Array as () => string[] | ExtendedHeader[],
        required: true,
    },
    rows: {
        type: Array as () => R[],
        required: true,
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
    defaultSortingKey: {
        type: String,
        required: false,
        default: undefined,
    },
    defaultSortingOrder: {
        type: String,
        required: false,
        default: "DESC",
        validator: (v) => v === "ASC" || v === "DESC",
    },
    rowsPerPage: {
        type: Array<number>,
        required: false,
        default: [5, 10, 20],
    },
    itemsPerPage: {
        type: Number,
        required: false,
        default: 5,
    },
});

const emits = defineEmits(["update:itemsPerPage"]);

const selectedRowsPerPage = ref(props.itemsPerPage);
const selectedPage = ref(1);
const sortingBy: Ref<ExtendedHeader | null> = ref(null);
const sortingOrder: Ref<"ASC" | "DESC" | null> = ref(null);

watch(selectedRowsPerPage, () => {
    emits("update:itemsPerPage", selectedRowsPerPage.value);
});
watch(
    () => props.itemsPerPage,
    () => {
        selectedRowsPerPage.value = props.itemsPerPage;
    },
);

const convertedHeaders: ComputedRef<ExtendedHeader[]> = computed(() => {
    if (props.headers.length === 0) {
        return [];
    }
    if ((props.headers[0] as ExtendedHeader).key !== undefined) {
        return props.headers as ExtendedHeader[];
    }
    return (props.headers as string[]).map((header) => {
        return { key: header, title: header };
    });
});

const selectableRowsPerPage = computed(() => {
    const converted = props.rowsPerPage.map((rPP) => {
        return { text: String(rPP), value: rPP };
    });
    converted.push({ text: "All", value: props.rows.length });
    return converted;
});

if (props.alwaysSort) {
    if (props.defaultSortingKey) {
        const searchedHeader = convertedHeaders.value.find(
            (h) => h.key === props.defaultSortingKey,
        );
        if (searchedHeader) {
            sortingBy.value = searchedHeader;
        }
    } else {
        const firstSortable = convertedHeaders.value.find(
            (v) => !v.disableSort,
        );
        if (firstSortable === undefined) {
            throw new Error("AlwaysSort enabled, but no sortable column found");
        }
        sortingBy.value = firstSortable;
    }
    sortingOrder.value = props.defaultSortingOrder as "ASC" | "DESC";
}

const startIndex = computed(() => {
    return (selectedPage.value - 1) * selectedRowsPerPage.value;
});
const endIndex = computed(() => {
    return Math.min(
        selectedPage.value * selectedRowsPerPage.value,
        props.rows.length,
    );
});

const filteredRows = computed(() => {
    let result = props.rows.slice();

    if (sortingBy.value !== null && props.enableSorting) {
        result = result.sort((a, b) => {
            const valA = a[sortingBy.value!.key];
            const valB = b[sortingBy.value!.key];

            if (sortingBy.value!.sort !== undefined) {
                return sortingBy.value!.sort(valA, valB);
            }

            if (!isNaN(valA as number) && !isNaN(valB as number)) {
                return (valA as number) - (valB as number);
            }

            return (valA as string).localeCompare(valB as string);
        });
    }

    if (sortingOrder.value === "DESC") {
        result.reverse();
    }

    result = result.slice(startIndex.value, endIndex.value);

    return result;
});

function nextPage() {
    if (selectedPage.value < props.rows.length / selectedRowsPerPage.value) {
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
    if (sortingBy.value?.key !== key.key) {
        sortingBy.value = key;
        sortingOrder.value = "DESC";
    } else {
        switch (sortingOrder.value) {
            case "DESC":
                sortingOrder.value = "ASC";
                break;
            case "ASC":
                if (props.alwaysSort) {
                    sortingOrder.value = "DESC";
                } else {
                    sortingBy.value = null;
                    sortingOrder.value = null;
                }
                break;
        }
    }
}

watch(selectedRowsPerPage, () => {
    if (selectedPage.value > props.rows.length / selectedRowsPerPage.value) {
        selectedPage.value = Math.ceil(
            props.rows.length / selectedRowsPerPage.value,
        );
    }
});
</script>
