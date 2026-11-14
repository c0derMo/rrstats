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
            @enter="updateFullHeight"
            @leave="updateFullHeight"
        >
            <Teleport v-if="showDropdown" to="#teleports">
                <div
                    ref="dropdown"
                    class="z-50 fixed bg-neutral-100 dark:bg-neutral-700 rounded-xs overflow-y-auto flex-col w-fit"
                    :class="{
                        'origin-top': !shouldDropUp,
                        'origin-bottom': shouldDropUp,
                    }"
                    :style="dropdownStyle"
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
const dropdown: Ref<HTMLElement | null> = ref(null);

const viewportHeight = ref(0);
const dropdownLeft = ref(0);

const fullHeight = ref("100vh");

function updateFullHeight(el: Element) {
    if (element.value == null) {
        return;
    }

    updateElementPosition();

    const rect = element.value.getBoundingClientRect();

    if (shouldDropUp.value) {
        const height = Math.min(rect.top - 10, el.scrollHeight);
        fullHeight.value = `${height}px`;
    } else {
        const height = Math.min(
            viewportHeight.value - rect.bottom - 10,
            el.scrollHeight,
        );
        fullHeight.value = `${height}px`;
    }
}

const shouldDropUp = computed(() => {
    if (!element.value) return false;

    return (
        viewportHeight.value - element.value.getBoundingClientRect().bottom <
        200
    );
});

const dropdownStyle = computed(() => {
    if (!element.value) {
        return { display: "none" };
    }

    const rect = element.value.getBoundingClientRect();

    return {
        left: `${dropdownLeft.value}px`,
        top: shouldDropUp.value ? "auto" : `${rect.bottom}px`,
        bottom: shouldDropUp.value
            ? `${viewportHeight.value - rect.top}px`
            : "auto",
        height: fullHeight.value,
        minWidth: `${rect.width}px`,
    };
});

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
    if (!element.value) return;

    viewportHeight.value = window.innerHeight;

    const rect = element.value.getBoundingClientRect();
    const menuWidth = dropdown.value?.offsetWidth ?? rect.width;

    let left = props.alignRight ? rect.right - menuWidth : rect.left;

    // Keep the dropdown inside the horizontal viewport.
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    dropdownLeft.value = left;
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
    max-height: 0px;
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
</style>
