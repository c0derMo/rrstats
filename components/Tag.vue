<template>
    <span
        class="rounded-full px-3 py-1 whitespace-nowrap"
        :class="{ border: borderColor != '' }"
        :style="colorStyle"
    >
        <slot />
    </span>
</template>

<script setup lang="ts">
const props = defineProps({
    color: {
        type: String,
        required: false,
        default: "gray",
    },
    borderColor: {
        type: String,
        required: false,
        default: "",
    },
});

const colorStyle = computed(() => {
    const styles: string[] = [];
    if (props.color !== "") {
        styles.push(`background-color: ${props.color}`);
    }
    if (props.borderColor !== "") {
        styles.push(`border-color: ${props.borderColor}`);
    }
    return styles.join("; ");
});
</script>
