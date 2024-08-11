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

const chosenBackground = useState<string>("background");

callOnce(() => {
    const chosenBackgroundIndex = Math.floor(
        props.competitions.length * Math.random(),
    );
    chosenBackground.value = props.competitions[chosenBackgroundIndex];
});

const bgStyle = computed(() => {
    if (chosenBackground.value == null || chosenBackground.value === "")
        return "";

    return `background-image: url(${chosenBackground.value})`;
});
</script>
