<template>
    <Tag :class="color">
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
    const placement = props.placement ?? 4;
    if (placement > 3) {
        return "bg-gray-500";
    } else if (placement > 2) {
        return "bg-bronze";
    } else if (placement > 1) {
        return "bg-silver";
    }
    return "bg-golden";
});
</script>
