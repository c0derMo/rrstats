<template>
    <div class="fixed w-full h-full pointer-events-none -z-10 bg-cover bg-repeat dark:brightness-50" ref="bg" :style="bgStyle" ></div>
</template>

<script setup lang="ts">
const possibleBackgrounds = [
    "https://media.hitmaps.com/img/hitman3/locations/location_coastaltown/background.jpg",
    "https://media.hitmaps.com/img/hitman3/locations/location_bangkok/background.jpg",
    "https://media.hitmaps.com/img/hitman3/locations/location_ancestral/ancestral_background.jpg",
];

const bg: Ref<HTMLDivElement | null> = ref(null);

const chosenBackgroundIndex = Math.floor((possibleBackgrounds.length) * Math.random());
const chosenBackground = possibleBackgrounds[chosenBackgroundIndex];
const bgStyle = computed(() => {
    return `background-image: url(${chosenBackground})`;
});
</script>