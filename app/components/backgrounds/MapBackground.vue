<template>
    <div
        class="fixed w-full h-full pointer-events-none -z-10 bg-cover bg-repeat dark:brightness-[.30] top-0 left-0"
        :style="bgStyle"
    >
        <div
            class="fixed w-full h-full pointer-events-none -z-10 bg-white opacity-60 dark:hidden top-0 left-0"
        />
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        maps?: HitmanMap[];
    }>(),
    {
        maps: () => getAllMaps(),
    },
);

const mapSelection = computed(() => {
    if (props.maps.length <= 0) {
        return getAllMaps();
    } else {
        return props.maps;
    }
});

const chosenBackground = useState("mapBackground", () => "");

callOnce(selectBackground);

function selectBackground() {
    const chosenMapIndex = Math.floor(
        mapSelection.value.length * Math.random(),
    );
    const chosenMap = mapSelection.value[chosenMapIndex];
    chosenBackground.value = getMap(chosenMap)!.backgroundImage;
}

const bgStyle = computed(() => {
    return `background-image: url(${chosenBackground.value})`;
});

watch(
    () => props.maps,
    () => {
        selectBackground();
    },
);
</script>
