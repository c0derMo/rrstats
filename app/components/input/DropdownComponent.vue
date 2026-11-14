<template>
    <div ref="element" class="w-fit">
        <ButtonComponent
            :class="buttonClass"
            class="w-full"
            @click="showDropdown = !showDropdown"
        >
            <slot name="button-content">
                <div class="text-nowrap flex flex-nowrap min-h-6">
                    <span class="grow">
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
                        :class="{ 'rotate-180': showDropdown }"
                        class="transition float-right ml-2 mt-1"
                    />
                </div>
            </slot>
        </ButtonComponent>

        <Transition
            name="collapse"
            @enter="updateElementPosition"
            @leave="updateElementPosition"
        >
            <Teleport v-if="showDropdown" to="#teleports">
                <div
                    ref="dropdown"
                    class="z-50 fixed bg-neutral-100 dark:bg-neutral-700 rounded-xs overflow-y-auto flex-col w-fit dropdown"
                    :class="{
                        'origin-top': !shouldDropUp,
                        'origin-bottom': shouldDropUp,
                    }"
                >
                    <div
                        v-for="(item, idx) of convertedItems"
                        :key="idx"
                        class="px-5 py-2 transition hover:bg-neutral-300 dark:hover:bg-neutral-600 min-h-4"
                        @click="selectItem(item)"
                    >
                        {{ item.text }}
                    </div>
                </div>
            </Teleport>
        </Transition>
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
        alignRight?: boolean;
    }>(),
    {
        modelValue: undefined,
        buttonText: null,
        buttonClass: "",
        alignRight: false,
    },
);

const emit = defineEmits<{
    "update:modelValue": [value: string | number | unknown];
}>();

const showDropdown = ref(false);

const element: Ref<HTMLElement | null> = ref(null);
const dropdown = useTemplateRef("dropdown");

const shouldDropUp = ref(false);
const fullHeight = ref("100vh");
const left = ref("auto");
const top = ref("auto");
const bottom = ref("auto");
const width = ref("auto");

const convertedItems: ComputedRef<ExtendedOption[]> = computed(() => {
    if (props.items.length === 0) {
        return [];
    }

    if ((props.items[0] as ExtendedOption).value !== undefined) {
        return props.items as ExtendedOption[];
    }

    return (props.items as string[] | number[]).map((item) => ({
        text: item.toString(),
        value: item,
    }));
});

function updateElementPosition() {
    if (!element.value || !dropdown.value) return;

    const rect = element.value.getBoundingClientRect();
    const menuWidth = dropdown.value?.offsetWidth ?? rect.width;

    shouldDropUp.value = window.innerHeight - rect.bottom < 200;

    let localLeft = props.alignRight ? rect.right - menuWidth : rect.left;
    // Keep the dropdown inside the horizontal viewport.
    localLeft = Math.max(
        8,
        Math.min(localLeft, window.innerWidth - menuWidth - 8),
    );

    top.value = shouldDropUp.value ? "auto" : `${rect.bottom}px`;
    bottom.value = shouldDropUp.value
        ? `${window.innerHeight - rect.top}px`
        : "auto";
    width.value = `${rect.width}px`;
    left.value = `${localLeft}px`;

    if (shouldDropUp.value) {
        const height = Math.min(rect.top - 10, dropdown.value.scrollHeight);
        fullHeight.value = `${height}px`;
    } else {
        const height = Math.min(
            window.innerHeight - rect.bottom - 10,
            dropdown.value.scrollHeight,
        );
        fullHeight.value = `${height}px`;
    }
}

function selectItem(item: ExtendedOption) {
    emit("update:modelValue", item.value);
    showDropdown.value = false;
}

function handleOutsideClick(event: PointerEvent) {
    const target = event.target as Node;

    if (element.value?.contains(target) || dropdown.value?.contains(target)) {
        return;
    }

    showDropdown.value = false;
}

onMounted(() => {
    document.addEventListener("pointerdown", handleOutsideClick);
    window.addEventListener("scroll", updateElementPosition, true);
    window.addEventListener("resize", updateElementPosition);

    updateElementPosition();
});

onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", handleOutsideClick);
    window.removeEventListener("scroll", updateElementPosition, true);
    window.removeEventListener("resize", updateElementPosition);
});
</script>

<style scoped>
.collapse-enter-from,
.collapse-leave-to {
    max-height: 0px !important;
    opacity: 0;
}

.collapse-enter-active,
.collapse-leave-active {
    transition-property: max-height, opacity;
    transition-duration: 250ms;
    transition-timing-function: ease;
    overflow-y: hidden;
}

.collapse-enter-to,
.collapse-leave-from {
    max-height: v-bind(fullHeight);
    opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
    .collapse-enter-active,
    .collapse-leave-active {
        transition-property: none;
    }
}

.dropdown {
    left: v-bind(left);
    top: v-bind(top);
    bottom: v-bind(bottom);
    max-height: v-bind(fullHeight);
    min-width: v-bind(width);
}
</style>
