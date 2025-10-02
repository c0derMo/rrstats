<template>
    <div class="relative h-fit">
        <input
            ref="input"
            class="rounded py-1 px-3 peer w-full outline-none bg-neutral-100 dark:bg-neutral-800"
            :class="{
                'bg-neutral-400 dark:bg-neutral-900': disabled,
            }"
            :disabled="disabled"
            :value="modelValue"
            :type="type"
            :step="step"
            @input="
                $emit(
                    'update:model-value',
                    formatReturnValue(
                        ($event.target as HTMLInputElement).value,
                    ),
                )
            "
            @focusin="isFocused = true"
            @focusout="isFocused = false"
            @keydown="(key) => $emit('keydown', key)"
        />

        <label
            class="absolute left-3 top-1 origin-left pointer-events-none transition-all dark:text-neutral-300 text-neutral-800"
            :class="{
                'dark:text-neutral-500 text-neutral-900': disabled,
                '-translate-y-4 scale-75': nonEmptyOrFocussed,
            }"
        >
            {{ placeholder }}
        </label>

        <div
            class="absolute flex w-full h-full top-0 left-0 pointer-events-none"
        >
            <div
                class="h-full w-3 inline-block border rounded-l border-r-0 border-neutral-500"
                :class="{
                    '!border-blue-700': isFocused,
                    '!border-red-600': error,
                }"
            />
            <div
                class="h-full w-fit inline-block border border-l-0 border-r-0 text-transparent text-xs border-neutral-500"
                :class="{
                    '!border-blue-700': isFocused,
                    'border-t-0': nonEmptyOrFocussed,
                    '!border-red-600': error,
                }"
            >
                {{ placeholder }}
            </div>
            <div
                class="h-full grow inline-block border border-l-0 rounded-r border-neutral-500"
                :class="{
                    '!border-blue-700': isFocused,
                    '!border-red-600': error,
                }"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        placeholder?: string;
        modelValue?: string | number;
        type?: string;
        error?: boolean;
        disabled?: boolean;
        step?: string | number;
    }>(),
    {
        placeholder: "",
        modelValue: "",
        type: "text",
        error: false,
        disabled: false,
        step: undefined,
    },
);

const emits = defineEmits<{
    "update:model-value": [value: string | number];
    "focus-change": [value: boolean];
    keydown: [key: KeyboardEvent];
}>();

const isFocused = ref(false);
const nonEmptyOrFocussed = computed(() => {
    return (
        isFocused.value || (props.modelValue !== "" && props.modelValue != null)
    );
});

function formatReturnValue(originalValue: string) {
    if (props.type === "number") {
        const parsedNumber = parseInt(originalValue);
        if (isNaN(parsedNumber)) {
            return 0;
        } else {
            return parsedNumber;
        }
    }

    return originalValue;
}

watch(isFocused, (newValue) => {
    emits("focus-change", newValue);
});
</script>
