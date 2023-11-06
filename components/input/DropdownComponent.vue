<template>
    <div class="p-2 border rounded w-fit inline-block dark:border-neutral-500">
        <select class="bg-transparent" v-model="value">
            <option v-for="(item, idx) of convertedItems" :key="idx" :value="item.value">{{ item.text }}</option>
        </select>
    </div>
</template>

<script setup lang="ts">
interface ExtendedOption {
    text: string,
    value: unknown
}

const props = defineProps({
    items: {
        type: Array as () => number[] | string[] | ExtendedOption[],
        required: true,
    },
    modelValue: {
        type: [String, Number]
    }
})

onUpdated(() => {
    value.value = props.modelValue?.toString() || "";
});
const value: Ref<string> = ref(props.modelValue?.toString() || "");
watch(value, () => {
    if (isNaN(parseInt(value.value.toString()))) {
        emits('update:modelValue', value.value);
    } else {
        emits('update:modelValue', parseInt(value.value.toString()));
    }
});

const emits = defineEmits(['update:modelValue']);

const convertedItems: ComputedRef<ExtendedOption[]> = computed(() => {
    if (props.items.length === 0) {
        return [];
    }
    if ((props.items[0] as ExtendedOption).value !== undefined) {
        return props.items as ExtendedOption[];
    }
    return (props.items as string[] | number[]).map(item => {
        return { text: item.toString(), value: item }
    });
});
</script>