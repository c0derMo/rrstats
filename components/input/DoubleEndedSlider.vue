<template>
    <div class="relative h-5" ref="parent">
        <input type="range" class="w-full absolute slider z-10" :min="min" :max="max" :value="minValue" @input="(value) => updateBar(0, value)" />
        <input type="range" class="w-full absolute slider z-10" :min="min" :max="max" :value="maxValue" @input="(value) => updateBar(1, value)" />
        <div class="absolute h-1 bg-blue-500 top-2" :style="barStyle"></div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    min: {
        type: Number,
        required: false,
        default: 0,
    },
    max: {
        type: Number,
        required: false,
        default: 100,
    },
    minValue: {
        type: Number,
        required: true,
    },
    maxValue: {
        type: Number,
        required: true,
    }
});
const emits = defineEmits(['update:minValue', 'update:maxValue']);

function updateBar(barNumber: 0 | 1, event: Event) {
    let value = parseInt((<HTMLInputElement>event.target).value);
    if (barNumber === 0) {
        if (value > props.maxValue) {
            value = props.maxValue;
            (<HTMLInputElement>event.target).value = props.maxValue.toString();
        }
        emits('update:minValue', value);
    }
    if (barNumber === 1) {
        if (value < props.minValue) {
            value = props.minValue;
            (<HTMLInputElement>event.target).value = props.minValue.toString();
        }
        emits('update:maxValue', value);
    }
}

const parent: Ref<HTMLDivElement | undefined> = ref();

const barStyle = computed(() => {
    let pixelPerInput = (parent.value?.clientWidth || 0) / (props.max - props.min);
    let start = pixelPerInput * props.minValue;
    let width = (pixelPerInput * props.maxValue) - start;
    return `margin-left: ${start}px; width: ${width}px;`
});
</script>

<style scoped lang="scss">
.track {
    @apply bg-none;
}

.thumb {
    @apply pointer-events-auto bg-blue-500 w-5 h-5 rounded-full;
}

.slider {
    &::-webkit-slider-runnable-track, &::-webkit-slider-thumb, & { -webkit-appearance: none; };

    @apply pointer-events-none bg-none;
    background: none;

    &::-webkit-slider-runnable-track { @apply track; }
    &::-moz-range-track { @apply track; }

    &::-webkit-slider-thumb { @apply thumb; }
    &::-moz-range-thumb { @apply thumb; }
}
</style>