<template>
    <div class="text-center">
        Redirecting to the <a :href="newLink">new tournament page</a>...
    </div>
</template>

<script setup lang="ts">
const route = useRoute();

const newLink = computed(() => {
    return `/tournament/${route.query.tournament}`;
});

onBeforeMount(() => {
    navigateTo(newLink.value);
});
</script>
