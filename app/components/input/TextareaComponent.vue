<template>
    <div class="w-full h-full relative">
        <textarea
            class="w-full h-full bg-neutral-100 dark:bg-neutral-800 border dark:border-neutral-500 rounded p-2"
            :class="{ '!border-red-700': error }"
            :value="modelValue"
            :maxlength="maxLength"
            @input="
                $emit(
                    'update:modelValue',
                    ($event.target as HTMLInputElement).value,
                )
            "
            @blur="$emit('blur')"
        />
        <span
            v-if="maxLength != null"
            class="absolute bottom-2 right-2 text-sm text-gray-500"
            >{{ modelValue.length }}/{{ maxLength }}</span
        >
    </div>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        modelValue?: string;
        maxLength?: number;
        error?: boolean
    }>(),
    {
        modelValue: "",
        maxLength: undefined,
        error: false,
    },
);

defineEmits<{
    "update:modelValue": [value: string];
    "blur": []
}>();
</script>
