<template>
    <div
        class="fixed w-full h-full pointer-events-none -z-20 bg-cover bg-repeat dark:brightness-50 blur top-0 left-0"
        :style="bgStyle"
    >
        <div
            class="fixed w-full h-full pointer-events-none -z-10 bg-white opacity-40 dark:hidden top-0 left-0"
        />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    competitions: string[];
}>();

const chosenBackground = useState("compBackground", () => "");

callOnce(selectBackground);

function selectBackground() {
    const chosenBackgroundIndex = Math.floor(
        props.competitions.length * Math.random(),
    );
    chosenBackground.value = props.competitions[chosenBackgroundIndex];
}

const bgStyle = computed(() => {
    if (chosenBackground.value == null || chosenBackground.value === "")
        return "";

    return `background-image: url(${chosenBackground.value})`;
});

watch(
    () => props.competitions,
    () => {
        selectBackground();
    },
);
</script>
