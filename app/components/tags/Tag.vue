<template>
    <div
        class="rounded-full px-3 whitespace-nowrap inline-block"
        :class="{ border: borderColor != '', 'py-1': !narrow }"
        :style="colorStyle"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        color?: string;
        borderColor?: string;
        narrow?: boolean;
    }>(),
    {
        color: "gray",
        borderColor: "",
        narrow: false,
    },
);

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
