<template>
    <div class="inline-flex items-center gap-3">
        <span v-if="!reverse">{{ label }}</span>
        <div class="relative inline-block h-4 w-8 cursor-pointer rounded-full">
            <input
                :id="id"
                type="checkbox"
                class="peer absolute h-4 w-8 cursor-pointer appearance-none rounded-full bg-gray-700 transition-colors duration-300 checked:bg-blue-500"
                :checked="modelValue"
                @input="
                    $emit(
                        'update:modelValue',
                        ($event.target as HTMLInputElement).checked,
                    )
                "
            />
            <label
                :for="id"
                class="before:content[''] absolute top-2/4 -left-1 h-5 w-5 -translate-y-2/4 cursor-pointer rounded-full border border-blue-gray-100 bg-white shadow-md transition-all duration-300 peer-checked:translate-x-full peer-checked:border-blue-500"
            />
        </div>
        <span v-if="reverse">{{ label }}</span>
    </div>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        label?: string;
        modelValue?: boolean;
        id: string;
        reverse?: boolean;
    }>(),
    {
        label: "",
        reverse: false,
    },
);

defineEmits<{
    "update:modelValue": [value: boolean];
}>();
</script>
