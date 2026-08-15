<template>
    <div ref="parent" class="relative h-5">
        <input
            type="range"
            class="w-full absolute slider z-10"
            :min="min"
            :max="max"
            :value="minValue"
            @input="(value) => updateBar(0, value)"
        />
        <input
            type="range"
            class="w-full absolute slider z-10"
            :min="min"
            :max="max"
            :value="maxValue"
            @input="(value) => updateBar(1, value)"
        />
        <div class="absolute h-1 bg-blue-500 top-2" :style="barStyle" />
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        min?: number;
        max?: number;
        minValue: number;
        maxValue: number;
    }>(),
    {
        min: 0,
        max: 100,
    },
);

const emits = defineEmits<{
    "update:minValue": [value: number];
    "update:maxValue": [value: number];
}>();

function updateBar(barNumber: 0 | 1, event: Event) {
    let value = parseInt((event.target as HTMLInputElement).value);
    if (barNumber === 0) {
        if (value > props.maxValue) {
            value = props.maxValue;
            (event.target as HTMLInputElement).value =
                props.maxValue.toString();
        }
        emits("update:minValue", value);
    }
    if (barNumber === 1) {
        if (value < props.minValue) {
            value = props.minValue;
            (event.target as HTMLInputElement).value =
                props.minValue.toString();
        }
        emits("update:maxValue", value);
    }
}

const parent: Ref<HTMLDivElement | undefined> = ref();

const barStyle = computed(() => {
    const pixelPerInput =
        (parent.value?.clientWidth || 0) / (props.max - props.min);
    const start = pixelPerInput * props.minValue;
    const width = pixelPerInput * props.maxValue - start;
    return `margin-left: ${start}px; width: ${width}px;`;
});
</script>

<style scoped>
@reference "@/assets/main.css";

.slider {
    @apply pointer-events-none bg-none;
    background: none;
    appearance: none;
    -webkit-appearance: none;
}

.slider::-webkit-slider-runnable-track {
    @apply bg-none;
}

.slider::-moz-range-track {
    @apply bg-none;
}

.slider::-webkit-slider-thumb {
    @apply pointer-events-auto bg-blue-500 w-5 h-5 rounded-full;
    -webkit-appearance: none;
}

.slider::-moz-range-thumb {
    @apply pointer-events-auto bg-blue-500 w-5 h-5 rounded-full;
}
</style>
