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
            class="w-full"
            @click="showDropdown = !showDropdown"
        >
            <div class="text-nowrap flex flex-nowrap min-h-6">
                <span class="flex-grow">
                    {{
                        buttonText ??
                        (convertedItems.find((i) => i.value === modelValue)
                            ?.text ||
                            modelValue)
                    }}
                </span>
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
        <ClientOnly>
            <div class="relative">
                <div
                    ref="dropdown"
                    class="z-50 absolute bg-neutral-100 dark:bg-neutral-700 rounded-sm overflow-y-auto flex-col w-fit min-w-full scale-y-0 opacity-0 transition-all"
                    :class="{
                        'scale-y-100 opacity-100': showDropdown,
                        'origin-top': !shouldDropUp,
                        'origin-bottom': shouldDropUp,
                    }"
                    :style="shouldDropUp ? dropupHeight : dropdownHeight"
                >
                    <div
                        v-for="(item, idx) of convertedItems"
                        :key="idx"
                        class="px-5 py-2 transition hover:bg-neutral-300 dark:hover:bg-neutral-600 min-h-4"
                        @click="
                            $emit('update:modelValue', item.value);
                            showDropdown = false;
                        "
                    >
                        {{ item.text }}
                    </div>
                </div>
            </div>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
interface ExtendedOption {
    text: string;
    value: unknown;
}

const props = withDefaults(
    defineProps<{
        items: number[] | string[] | ExtendedOption[];
        modelValue?: number | string;
        buttonText?: string | null;
        buttonClass?: string;
    }>(),
    {
        modelValue: undefined,
        buttonText: null,
        buttonClass: "",
    },
);
defineEmits<{
    "update:modelValue": [value: string | number | unknown];
}>();

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
