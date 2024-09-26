<template>
    <Tag :color="color" :narrow="narrow">
        <slot name="default">
            {{ text }}
        </slot>
    </Tag>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        map: HitmanMapInfo;
        fullName?: boolean;
        narrow?: boolean;
        won?: boolean;
        draw?: boolean;
    }>(),
    {
        fullName: false,
        narrow: false,
        won: undefined,
        draw: false,
    },
);

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
