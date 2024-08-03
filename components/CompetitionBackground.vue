<template>
    <div
        class="fixed w-full h-full pointer-events-none -z-10 bg-white opacity-40 dark:hidden top-0 left-0"
    />
    <div
        class="fixed w-full h-full pointer-events-none -z-20 bg-cover bg-repeat dark:brightness-50 blur top-0 left-0"
        :style="bgStyle"
    />
</template>

<script setup lang="ts">
const props = defineProps({
    competitions: {
        type: Array<string>,
        required: true,
    },
});

const chosenBackgroundIndex = Math.floor(
    props.competitions.length * Math.random(),
);
const chosenBackground = props.competitions[chosenBackgroundIndex];
const bgStyle = computed(() => {
    if (chosenBackground === undefined || chosenBackground === null) return "";
    if (chosenBackground.startsWith("http")) {
        return `background-image: url(${chosenBackground})`;
    }
    // TODO: Load local file!
    return `background-image: url(${chosenBackground})`;
});
</script>
