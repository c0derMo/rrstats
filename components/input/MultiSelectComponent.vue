<template>
    <div ref="select">
        <div
            class="p-2 border rounded w-96 h-10 dark:border-neutral-500 relative flex flex-row"
            :class="{
                'bg-neutral-400 dark:bg-neutral-900': disabled,
            }"
            @click="showDropdown = !showDropdown && !disabled"
        >
            <div class="flex-grow truncate">
                {{
                    selected.length > 0
                        ? selected.map((s) => getName(s)).join(", ")
                        : emptyText
                }}
            </div>
            <FontAwesomeIcon
                :icon="['fas', 'chevron-down']"
                class="transition mt-1"
                :class="{ 'rotate-180': showDropdown }"
            />
        </div>
        <div
            class="opacity-0 transition absolute z-50 mt-1 bg-neutral-300 dark:bg-neutral-900 rounded-xl pb-3 max-h-96 overflow-y-auto"
            :class="{ 'opacity-100': showDropdown, hidden: !showDropdown }"
        >
            <div class="flex flex-row gap-5 mt-1">
                <div
                    v-for="(row, idx) in extendedItems"
                    :key="idx"
                    class="flex flex-col gap-2 group"
                >
                    <div class="font-bold text-center">
                        {{
                            columnHeaders.length >= idx
                                ? columnHeaders[idx]
                                : ""
                        }}
                    </div>
                    <div
                        v-for="(item, rowIdx) in row"
                        :key="rowIdx"
                        class="hover:bg-neutral-400 hover:dark:bg-neutral-700 px-4 py-1"
                        @click="toggleItem(item.value)"
                    >
                        <FontAwesomeIcon :icon="getIcon(item.value)" />
                        {{ item.text }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface ExtendedOption {
    text: string;
    value: unknown;
}

const props = defineProps({
    items: {
        type: Array<
            | number
            | string
            | ExtendedOption
            | number[]
            | string[]
            | ExtendedOption[]
        >,
        required: true,
    },
    columnHeaders: {
        type: Array<string>,
        required: false,
        default: [],
    },
    modelValue: {
        type: Array<unknown>,
        required: true,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    emptyText: {
        type: String,
        default: "",
    },
});

const emits = defineEmits(["update:modelValue"]);

const select: Ref<HTMLDivElement | null> = ref(null);
const showDropdown = ref(false);
const selected: Ref<unknown[]> = toRef(props.modelValue);

const extendedItems = computed(() => {
    if (props.items.length === 0) {
        return [[]];
    }

    if (Array.isArray(props.items[0])) {
        // We already have a 2dim array
        if (!(props.items as unknown[][]).some((m) => m.length !== 0)) {
            return [[]];
        }

        if ((props.items[0][0] as ExtendedOption).text != null) {
            return props.items as ExtendedOption[][];
        } else {
            return (props.items as (string | number)[][]).map((array) => {
                return array.map((item) => {
                    return { text: item, value: item };
                });
            }) as ExtendedOption[][];
        }
    } else if ((props.items[0] as ExtendedOption).text != null) {
        return [props.items] as ExtendedOption[][];
    } else {
        return [
            props.items.map((item) => {
                return { text: item, value: item };
            }),
        ] as ExtendedOption[][];
    }
});

function toggleItem(item: unknown) {
    if (selected.value.includes(item)) {
        selected.value.splice(
            selected.value.findIndex((m) => m == item),
            1,
        );
    } else {
        selected.value.push(item);
    }
    emits("update:modelValue", selected.value);
}

function getIcon(item: unknown) {
    if (selected.value.includes(item)) {
        return ["fas", "square-check"];
    } else {
        return ["far", "square"];
    }
}

function clickOutsideListener(event: MouseEvent) {
    if (select.value == null || event.target == null) return;
    if (!select.value.contains(event.target as Node)) {
        showDropdown.value = false;
    }
}

function getName(value: unknown): string {
    return (
        extendedItems.value
            .reduce((a, b) => a.concat(b))
            .find((i) => i.value === value)?.text ?? ""
    );
}

onMounted(() => {
    document.addEventListener("click", clickOutsideListener);
});
onUnmounted(() => {
    document.removeEventListener("click", clickOutsideListener);
});
onUpdated(() => {
    selected.value = props.modelValue;
});
</script>
