<template>
    <Tag :color="color" :narrow="narrow">
        <slot name="default">
            {{ text }}
        </slot>
    </Tag>
</template>

<script setup lang="ts">
const props = defineProps({
    map: {
        type: Object as PropType<HitmanMapInfo>,
        required: true,
    },
    fullName: {
        type: Boolean,
        default: false,
    },
    narrow: {
        type: Boolean,
        default: false,
    },
    won: {
        type: Boolean,
        default: undefined,
    },
    draw: {
        type: Boolean,
        default: false,
    },
});

const text = computed(() => {
    if (props.fullName) {
        return props.map.name;
    }
    return props.map.abbreviation;
});

const color = computed(() => {
    if (props.draw) {
        return "#d0c033";
    }

    if (props.won === true) {
        return "#4caf50";
    } else if (props.won === false) {
        return "#f44336";
    }

    return props.map.color;
});
</script>
