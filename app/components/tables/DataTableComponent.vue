<template>
    <IndefiniteProgressBar v-if="asyncIsQuerying" />
    <TableComponent
        :headers="convertedHeaders"
        :rows="filteredRows"
        @click-row="(row, idx) => $emit('click-row', row, idx)"
    >
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
                />
                <slot
                    :name="`header-${String(header.key)}`"
                    :value="header.title"
                >
                    {{ value }}
                </slot>
            </span>
        </template>

        <template v-if="$slots['before-row']" #before-row="{ row, index }">
            <slot name="before-row" :row="row" :index="index" />
        </template>

        <template
            v-for="header of convertedHeaders"
            :key="header.key"
            #[header.key]="{ value, row, index }"
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

        <template v-if="$slots['after-row']" #after-row="{ row, index }">
            <slot name="after-row" :row="row" :index="index" />
        </template>
    </TableComponent>

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
</template>

<script setup lang="ts" generic="R">
interface ExtendedHeader {
    key: string;
    title: string;
    disableSort?: boolean;
    sort?: (a: unknown, b: unknown, objectA: R, objectB: R) => number;
}

const props = withDefaults(
    defineProps<{
        headers: string[] | ExtendedHeader[];
        rows?: R[];
        enableSorting?: boolean;
        alwaysSort?: boolean;
        defaultSortingKey?: string;
        defaultSortingOrder?: string;
        rowsPerPage?: number[];
        selectedRowsPerPage?: number;
        disableAllPerPage?: boolean;
        numberOfItems?: number;
        queryFunction?: (
            skip: number,
            take: number,
            orderBy: string | null,
            sortingOrder: "ASC" | "DESC" | null,
        ) => Promise<R[]>;
    }>(),
    {
        rows: undefined,
        enableSorting: true,
        alwaysSort: false,
        defaultSortingKey: undefined,
        defaultSortingOrder: "DESC",
        rowsPerPage: () => [5, 10, 20],
        selectedRowsPerPage: 5,
        disableAllPerPage: false,
        numberOfItems: undefined,
        queryFunction: undefined,
    },
);

const emits = defineEmits<{
    "update:selectedRowsPerPage": [value: number];
    "click-row": [row: R, index: number];
}>();

if (
    props.rows == null &&
    (props.numberOfItems == null || props.queryFunction == null)
) {
    throw new Error("rows or numberOfItems and queryFunction must be set");
}

const selectedRowsPerPage = ref(props.selectedRowsPerPage);
const selectedPage = ref(1);
const sortingBy: Ref<ExtendedHeader | null> = ref(null);
const sortingOrder: Ref<"ASC" | "DESC" | null> = ref(null);
const asyncItems: Ref<R[]> = ref([]);
const asyncIsQuerying = ref(false);

watch(selectedRowsPerPage, () => {
    emits("update:selectedRowsPerPage", selectedRowsPerPage.value);
});
watch(
    () => props.selectedRowsPerPage,
    () => {
        selectedRowsPerPage.value = props.selectedRowsPerPage;
    },
);

const isAsync = computed<boolean>(() => {
    return props.queryFunction != null;
});

const amountOfItems = computed<number>(() => {
    if (props.rows != null) {
        return props.rows.length;
    }
    if (props.numberOfItems != null) {
        return props.numberOfItems;
    }
    throw new Error("rows or numberOfItems and queryFunction must be set");
});

const convertedHeaders: ComputedRef<ExtendedHeader[]> = computed(() => {
    if (props.headers.length === 0) {
        return [];
    }
    if ((props.headers[0] as ExtendedHeader).key !== undefined) {
        return props.headers as ExtendedHeader[];
    }
    return (props.headers as string[]).map((header) => {
        return { key: header, title: header } as ExtendedHeader;
    });
});

const selectableRowsPerPage = computed(() => {
    const converted = props.rowsPerPage.map((rPP) => {
        return { text: String(rPP), value: rPP };
    });
    if (!props.disableAllPerPage) {
        converted.push({ text: "All", value: amountOfItems.value });
    }
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
        amountOfItems.value,
    );
});

const filteredRows = computed<R[]>(() => {
    if (isAsync.value) {
        return asyncItems.value as R[];
    }
    if (props.rows == null) {
        throw new Error("rows or numberOfItems and queryFunction must be set");
    }
    let result = [...props.rows];

    if (sortingBy.value !== null && props.enableSorting) {
        result = result.sort((a, b) => {
            const valA = a[sortingBy.value!.key as keyof R];
            const valB = b[sortingBy.value!.key as keyof R];

            if (sortingBy.value!.sort !== undefined) {
                return sortingBy.value!.sort(valA, valB, a, b);
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

async function requery() {
    if (props.queryFunction == null) {
        throw new Error("rows or numberOfItems and queryFunction must be set");
    }
    asyncIsQuerying.value = true;
    asyncItems.value = await props.queryFunction(
        Math.max(0, startIndex.value),
        selectedRowsPerPage.value,
        sortingBy.value?.key ?? null,
        sortingOrder.value,
    );
    asyncIsQuerying.value = false;
}

async function nextPage() {
    if (selectedPage.value < amountOfItems.value / selectedRowsPerPage.value) {
        selectedPage.value++;
        if (isAsync.value) {
            await requery();
        }
    }
}

async function previousPage() {
    if (selectedPage.value > 1) {
        selectedPage.value--;
        if (isAsync.value) {
            await requery();
        }
    }
}

async function changeSorting(key: ExtendedHeader) {
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
    if (isAsync.value) {
        await requery();
    }
}

watch(selectedRowsPerPage, async () => {
    if (selectedPage.value > amountOfItems.value / selectedRowsPerPage.value) {
        selectedPage.value = Math.ceil(
            amountOfItems.value / selectedRowsPerPage.value,
        );
    }
    if (isAsync.value) {
        await requery();
    }
});

onMounted(async () => {
    if (isAsync.value) {
        await requery();
    }
});
</script>
