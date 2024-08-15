<template>
    <div>
        <DoubleEndedSlider
            v-model:min-value="minSelected"
            v-model:max-value="maxSelected"
            class="w-full mb-2"
            :min="min"
            :max="max"
        />

        <div class="flex flex-row w-full">
            <div class="w-fit">
                <DropdownComponent
                    v-model="minSelected"
                    :items="dropdownItems"
                />
            </div>
            <div class="flex-grow mx-3 flex justify-center">
                <slot name="additionalChecks" />
            </div>
            <div class="w-fit">
                <DropdownComponent
                    v-model="maxSelected"
                    :items="dropdownItems"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    minValue: number,
    maxValue: number,
    min?: number,
    max?: number,
    itemLabels?: string[]
}>(), {
    min: 0,
    max: 100
});

const emits = defineEmits<{
    "update:minValue": [value: number],
    "update:maxValue": [value: number],
}>();

if (props.itemLabels != null && props.itemLabels.length !== props.max - props.min + 1) {
    console.warn(`[RangeSelector] itemLabels length has incorrect amount of items. Expected: ${props.max-props.min+1}, got: ${props.itemLabels.length}.`);
}

const minSelected = ref(props.minValue);
const maxSelected = ref(props.maxValue);

const dropdownItems = computed(() => {
    return Array(props.max - props.min + 1).fill(0).map((_, idx) => {
        return {
            text: props.itemLabels?.[idx] ?? String(idx),
            value: idx,
        }
    });
});

watch(minSelected, () => {
    if (minSelected.value > maxSelected.value) {
        minSelected.value = maxSelected.value
    }
    emits('update:minValue', minSelected.value);
});
watch(maxSelected, () => {
    if (maxSelected.value < minSelected.value) {
        maxSelected.value = minSelected.value;
    }
    emits('update:maxValue', maxSelected.value);
});
</script>