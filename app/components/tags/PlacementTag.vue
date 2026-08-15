<template>
    <Tag :color="color">
        <slot>
            {{ text }}
        </slot>
    </Tag>
</template>

<script setup lang="ts">
const props = defineProps<{
    placement?: number;
}>();

const text = computed(() => {
    return formatPlacement(props.placement);
});

const color = computed(() => {
    return getPlacementTagColor(props.placement ?? 4);
})
</script>