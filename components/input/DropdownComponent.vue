<template>
    <div ref="element" v-click-outside="() => { showDropdown = false; }">
        <ButtonComponent :class="buttonClass" @click="showDropdown = !showDropdown">
            {{ buttonText ?? (convertedItems.find(i => i.value === modelValue)?.text || modelValue) }}
            <FontAwesomeIcon
                v-if="buttonText === null"
                :icon="['fas', 'chevron-down']"
                :class="{
                    'rotate-180': showDropdown,
                }"
                class="transition float-right ml-2 mt-1"
            />
        </ButtonComponent>
        <div
            v-if="showDropdown"
            ref="dropdown"
            class="z-20 absolute bg-neutral-100 dark:bg-neutral-700 rounded-sm overflow-y-auto max-h-full flex-col"
            :style="'max-height: ' + dropdownHeight"
        >
            <div
                v-for="(item, idx) of convertedItems"
                :key="idx"
                class="px-5 py-2 transition hover:bg-neutral-300 dark:hover:bg-neutral-600"
                @click="$emit('update:modelValue', item.value); showDropdown = false;"
            >
                {{ item.text }}
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
        type: Array as () => number[] | string[] | ExtendedOption[],
        required: true,
    },
    modelValue: {
        type: [String, Number],
        default: undefined,
    },
    buttonText: {
        type: String,
        default: null,
    },
    buttonClass: {
        type: String,
        default: "",
    }
});
defineEmits(["update:modelValue"]);

const showDropdown = ref(false);
const element: Ref<HTMLElement | null> = ref(null);

const dropdownHeight = computed(() => {
    if (element.value == null) {
        return;
    }

    const windowHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
    );

    return `${windowHeight - element.value.getBoundingClientRect().bottom - 10}px`;
});

const convertedItems: ComputedRef<ExtendedOption[]> = computed(() => {
    if (props.items.length === 0) {
        return [];
    }
    if ((props.items[0] as ExtendedOption).value !== undefined) {
        return props.items as ExtendedOption[];
    }
    return (props.items as string[] | number[]).map((item) => {
        return { text: item.toString(), value: item };
    });
});
</script>
