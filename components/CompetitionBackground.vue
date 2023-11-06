<template>
    <div class="fixed w-full h-full pointer-events-none -z-10 bg-cover bg-repeat dark:brightness-50" ref="bg" :style="bgStyle" ></div>
</template>

<script setup lang="ts">
const props = defineProps({
    'competitions': {
        type: Array<string>,
        required: true
    }
})

const bg: Ref<HTMLDivElement | null> = ref(null);

const chosenBackgroundIndex = Math.floor((props.competitions.length) * Math.random());
const chosenBackground = props.competitions[chosenBackgroundIndex];
const bgStyle = computed(() => {
    if (chosenBackground.startsWith("http")) {
        return `background-image: url(${chosenBackground})`;
    }
    // TODO: Load local file!
    return `background-image: url(${chosenBackground})`;
});
</script>