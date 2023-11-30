<template>
    <div
        class="fixed w-full h-full pointer-events-none -z-10 bg-cover bg-repeat dark:brightness-50 top-0 left-0"
        :style="bgStyle"
    ></div>
</template>

<script setup lang="ts">
import { HitmanMap, getAllMaps } from "~/utils/mapUtils";

const props = defineProps({
    maps: {
        type: Array<HitmanMap>,
        default: getAllMaps(),
    },
});

const chosenMapIndex = Math.floor(props.maps.length * Math.random());
const chosenMap = props.maps[chosenMapIndex];
const chosenBackground = getMap(chosenMap)!.backgroundImage;
const bgStyle = computed(() => {
    return `background-image: url(${chosenBackground})`;
});
</script>
