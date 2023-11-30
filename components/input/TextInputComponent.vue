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
            @input="
                $emit(
                    'update:model-value',
                    ($event.target as HTMLInputElement).value,
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
                class="h-full w-3 inline-block border rounded-l border-r-0 dark:border-neutral-500"
                :class="{
                    '!border-blue-700': isFocused,
                    '!border-red-600': error,
                }"
            ></div>
            <div
                class="h-full w-fit inline-block border border-l-0 border-r-0 text-transparent text-xs dark:border-neutral-500"
                :class="{
                    '!border-blue-700': isFocused,
                    'border-t-0': nonEmptyOrFocussed,
                    '!border-red-600': error,
                }"
            >
                {{ placeholder }}
            </div>
            <div
                class="h-full grow inline-block border border-l-0 rounded-r dark:border-neutral-500"
                :class="{
                    '!border-blue-700': isFocused,
                    '!border-red-600': error,
                }"
            ></div>
        </div>
    </div>
</template>

<script setup lang="ts">
const emits = defineEmits(["update:model-value", "focus-change", "keydown"]);

const props = defineProps({
    placeholder: {
        type: String,
        required: false,
        default: "",
    },
    modelValue: {
        type: [String, Number],
        required: false,
        default: "",
    },
    type: {
        type: String,
        default: "text",
    },
    error: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const isFocused = ref(false);
const nonEmptyOrFocussed = computed(() => {
    return (
        isFocused.value || (props.modelValue !== "" && props.modelValue != null)
    );
});

watch(isFocused, (newValue) => {
    emits("focus-change", newValue);
});
</script>
