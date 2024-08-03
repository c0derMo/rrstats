<template>
    <div
        class="fixed w-full h-full pointer-events-none -z-10 bg-cover bg-repeat dark:brightness-50 top-0 left-0"
        :style="bgStyle"
    />
</template>

<script setup lang="ts">
import { type HitmanMap, getAllMaps } from "~/utils/mapUtils";

const props = defineProps({
    maps: {
        type: Array<HitmanMap>,
        default: getAllMaps(),
    },
});

const mapSelection = computed(() => {
    if (props.maps.length <= 0) {
        return getAllMaps();
    } else {
        return props.maps;
    }
});

const chosenMapIndex = Math.floor(mapSelection.value.length * Math.random());
const chosenMap = mapSelection.value[chosenMapIndex];
const chosenBackground = getMap(chosenMap)!.backgroundImage;
const bgStyle = computed(() => {
    return `background-image: url(${chosenBackground})`;
});
</script>
