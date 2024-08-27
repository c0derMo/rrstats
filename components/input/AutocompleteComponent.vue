<template>
    <div class="relative">
        <TextInputComponent
            v-model="value"
            :placeholder="placeholder"
            class="w-full"
            @keydown="onKeyDown"
            @focus-change="(value) => (isFocussed = value)"
        />
        <div
            v-if="
                (isDropdownFocussed || isFocussed) &&
                currentSuggestions.length > 0
            "
            class="z-20 absolute bg-neutral-100 dark:bg-neutral-700 rounded-sm"
            @mouseenter="isDropdownFocussed = true"
            @mouseleave="isDropdownFocussed = false"
        >
            <div
                v-for="(suggestion, idx) of currentSuggestions"
                :key="idx"
                class="px-5 py-2 transition"
                :class="{
                    'bg-neutral-300 dark:bg-neutral-600':
                        selectedSuggestion === idx,
                }"
                @click="confirmEntry(idx)"
            >
                {{ suggestion }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const emits = defineEmits<{
    confirm: [value: string];
    input: [value: string];
    defocus: [];
    focus: [];
}>();
const props = withDefaults(
    defineProps<{
        suggestions?: string[];
        placeholder?: string;
        defaultText?: string;
    }>(),
    {
        suggestions: () => [],
        placeholder: "",
        defaultText: "",
    },
);

const value = ref(props.defaultText);
const selectedSuggestion = ref(0);
const isFocussed = ref(false);
const isDropdownFocussed = ref(false);

const currentSuggestions = computed(() => {
    if (value.value === "") {
        return [];
    }
    return props.suggestions
        .filter(
            (v) =>
                v.toLowerCase().includes(value.value.toLowerCase()) &&
                v != value.value,
        )
        .slice(0, 8);
});

function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
        selectedSuggestion.value = clampToRegion(
            selectedSuggestion.value + 1,
            0,
            currentSuggestions.value.length - 1,
        );
        event.preventDefault();
    }
    if (event.key === "ArrowUp") {
        selectedSuggestion.value = clampToRegion(
            selectedSuggestion.value - 1,
            0,
            currentSuggestions.value.length - 1,
        );
        event.preventDefault();
    }
    if (event.key === "Enter") {
        confirmEntry(selectedSuggestion.value);
    }
    if (event.key === "Tab") {
        if (currentSuggestions.value.length != 0) {
            confirmEntry(selectedSuggestion.value, true);
            event.preventDefault();
        }
    }
}

function confirmEntry(suggestionIndex?: number, disableEmit = false) {
    if (suggestionIndex !== undefined && currentSuggestions.value.length != 0) {
        value.value = currentSuggestions.value[suggestionIndex];
    }
    if (!disableEmit) {
        emits("confirm", value.value);
        if (document.activeElement instanceof HTMLElement)
            document.activeElement.blur();
    }
}

function clampToRegion(value: number, lowerBound: number, upperBound: number) {
    if (value > upperBound) {
        return upperBound;
    }
    if (value < lowerBound) {
        return lowerBound;
    }
    return value;
}

watch(currentSuggestions, (newValue) => {
    selectedSuggestion.value = clampToRegion(
        selectedSuggestion.value,
        0,
        newValue.length - 1,
    );
});

watch(value, () => {
    emits("input", value.value);
});

watch(isFocussed, (value) => {
    if (value) {
        emits("focus");
    } else {
        emits("defocus");
    }
});
</script>
