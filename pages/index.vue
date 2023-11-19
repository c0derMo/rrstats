<template>
    <CompetitionBackground
        :competitions="
            competitions
                ?.filter(
                    (m) =>
                        m.backgroundImage !== undefined &&
                        m.backgroundImage !== null,
                )
                .map((m) => m.backgroundImage) as string[]
        "
    />

    <CardComponent class="overflow-x-visible">
        <h1 class="text-lg">RRStats v3</h1>
        <div class="flex flex-row gap-5 my-2">
            <DropdownComponent
                :items="competitionsDropdown"
                v-model="selectedTournament"
            />
            <NuxtLink to="/records">
                <ButtonComponent>Records</ButtonComponent>
            </NuxtLink>
            <NuxtLink to="/compare">
                <ButtonComponent>Compare</ButtonComponent>
            </NuxtLink>
        </div>
        <br />
        <AutocompleteComponent
            placeholder="Player"
            class="w-[600px]"
            :suggestions="players || []"
            @confirm="(p) => navigateTo(`/${p}`)"
        />
    </CardComponent>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "center-no-back",
});
useHead({
    title: "RRStats v3",
});

const players = (await useFetch("/api/player/list")).data;
const competitions = (await useFetch("/api/competitions/list")).data;

const competitionsDropdown = computed(() => {
    if (competitions.value === null) {
        return ["Tournaments"];
    }
    return ["Tournaments"].concat(competitions.value.map((c) => c.tag));
});

const selectedTournament = ref("Tournaments");
watch(selectedTournament, () => {
    if (selectedTournament.value !== "Tournaments") {
        navigateTo(`/matches?tournament=${selectedTournament.value}`);
    }
});
</script>
