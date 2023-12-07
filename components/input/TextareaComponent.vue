<template>
    <textarea
        class="w-full h-full bg-neutral-100 dark:bg-neutral-800 border dark:border-neutral-500 rounded"
        :value="modelValue"
        @input="
            $emit(
                'update:modelValue',
                ($event.target as HTMLInputElement).value,
            )
        "
    />
</template>

<script setup lang="ts">
defineProps({
    modelValue: {
        type: String,
        default: "",
    },
});

defineEmits(["update:modelValue"]);
</script>
