<template>
    <div
        ref="element"
        v-click-outside="
            () => {
                showDropdown = false;
            }
        "
        class="w-fit"
    >
        <ButtonComponent
            :class="buttonClass"
            @click="showDropdown = !showDropdown"
        >
            <div class="text-nowrap">
                {{
                    buttonText ??
                    (convertedItems.find((i) => i.value === modelValue)?.text ||
                        modelValue)
                }}
                <FontAwesomeIcon
                    v-if="buttonText === null"
                    :icon="['fas', 'chevron-down']"
                    :class="{
                        'rotate-180': showDropdown,
                    }"
                    class="transition float-right ml-2 mt-1"
                />
            </div>
        </ButtonComponent>
        <div class="relative">
            <div
                v-if="showDropdown"
                ref="dropdown"
                class="z-20 absolute bg-neutral-100 dark:bg-neutral-700 rounded-sm overflow-y-auto flex-col"
                :style="shouldDropUp ? dropupHeight : dropdownHeight"
            >
                <div
                    v-for="(item, idx) of convertedItems"
                    :key="idx"
                    class="px-5 py-2 transition hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    @click="
                        $emit('update:modelValue', item.value);
                        showDropdown = false;
                    "
                >
                    {{ item.text }}
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
    },
});
defineEmits(["update:modelValue"]);

const showDropdown = ref(false);
const element: Ref<HTMLElement | null> = ref(null);
const elementBottom = ref(element.value?.getBoundingClientRect().bottom ?? 0);
const elementHeight = ref(element.value?.getBoundingClientRect().height ?? 0);

const dropdownHeight = computed(() => {
    return `max-height: ${
        window.innerHeight - elementBottom.value - 10
    }px; top: 0px;`;
});

const dropupHeight = computed(() => {
    return `max-height: ${
        elementBottom.value - elementHeight.value - 10
    }px; bottom: ${elementHeight.value}px;`;
});

const shouldDropUp = computed(() => {
    return window.innerHeight - elementBottom.value < 200;
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

function updateElementPosition() {
    if (element.value == null) {
        return;
    }
    elementBottom.value = element.value.getBoundingClientRect().bottom;
    elementHeight.value = element.value.getBoundingClientRect().height;
}

onMounted(() => {
    window.addEventListener("scroll", updateElementPosition);
    updateElementPosition();
});

onBeforeUnmount(() => {
    window.removeEventListener("scroll", updateElementPosition);
});
</script>
