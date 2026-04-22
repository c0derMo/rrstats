<template>
    <div class="text-center">
        Redirecting to the <a :href="newLink">new tournament page</a>...
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const info = useNavigatorInfo();
const tournament = route.query.tournament;
const tournaments = (await info.getCompetitions()).map((t) => t.tag);

const newLink = computed(() => {
    if (typeof tournament === "string" && tournaments.includes(tournament)) {
        return `/tournament/${route.query.tournament}`;
    } else {
        return "/";
    }
});

onBeforeMount(() => {
    navigateTo(newLink.value);
});
</script>
