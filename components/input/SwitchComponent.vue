<template>
    <div class="inline-flex items-center gap-3">
        <span>{{ label }}</span>
        <div class="relative inline-block h-4 w-8 cursor-pointer rounded-full">
            <input
                :id="id"
                type="checkbox"
                class="peer absolute h-4 w-8 cursor-pointer appearance-none rounded-full bg-gray-700 transition-colors duration-300 checked:bg-blue-500"
                :checked="modelValue"
                @input="
                    $emit(
                        'update:modelValue',
                        (<HTMLInputElement>$event.target).checked,
                    )
                "
            />
            <label
                :for="id"
                class="before:content[''] absolute top-2/4 -left-1 h-5 w-5 -translate-y-2/4 cursor-pointer rounded-full border border-blue-gray-100 bg-white shadow-md transition-all duration-300 peer-checked:translate-x-full peer-checked:border-blue-500"
            >
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    label: {
        type: String,
        required: false,
        default: "",
    },
    modelValue: {
        type: Boolean,
    },
    id: {
        type: String,
        required: true,
    },
});
</script>
