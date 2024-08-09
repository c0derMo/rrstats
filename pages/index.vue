<template>
    <div>
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

        <div class="flex flex-col mb-10">
            <div class="w-full text-7xl text-center font-bold font-josefinSans">
                RRStats
            </div>
            <div
                class="w-full text-base text-center font-light font-josefinSans"
            >
                Roulette Rivals Player Statistics
            </div>
            <div
                v-if="numbers != null"
                class="w-full text-sm text-center font-light font-josefinSans"
            >
                Currently storing {{ numbers.matches }} matches of
                {{ numbers.officialCompetitions }} RR tournaments with
                {{ numbers.players }}
                players!
            </div>

            <CardComponent
                class="overflow-x-visible mt-8 mb-2"
                :bg-opacity="80"
            >
                <div
                    class="flex md:flex-row flex-col-reverse gap-5 justify-between"
                >
                    <ButtonComponent
                        class="border-0 text-blue-500"
                        :disable-hover="true"
                        >Search</ButtonComponent
                    >
                    <NuxtLink to="/compare">
                        <ButtonComponent class="border-0">
                            Compare
                        </ButtonComponent>
                    </NuxtLink>
                    <NuxtLink to="/records">
                        <ButtonComponent class="border-0">
                            Records
                        </ButtonComponent>
                    </NuxtLink>
                    <NuxtLink to="/leaderboards">
                        <ButtonComponent class="border-0">
                            Leaderboards
                        </ButtonComponent>
                    </NuxtLink>
                    <NuxtLink to="/spins">
                        <ButtonComponent class="border-0">
                            Spins
                        </ButtonComponent>
                    </NuxtLink>
                    <DropdownComponent
                        button-class="border-0"
                        button-text="Tournaments"
                        :items="competitionsDropdown"
                        @update:model-value="selectTournament"
                    />
                </div>

                <AutocompleteComponent
                    placeholder="Player"
                    class="w-full xl:w-[600px] text-lg mt-3"
                    :suggestions="players || []"
                    @confirm="(p) => navigateTo(`/${p}`)"
                />
            </CardComponent>

            <div class="flex flex-row w-full gap-3 justify-between text-sm">
                <a
                    class="text-blue-600 underline"
                    href="https://twitter.com/rrstats"
                    >RRStats twitter</a
                >
                <a
                    class="text-blue-600 underline"
                    href="https://discord.gg/f7sc"
                    >F7SC Discord</a
                >
                <a
                    class="text-blue-600 underline"
                    href="https://providence.community/discord"
                    >Providence Discord</a
                >
                <a class="text-blue-600 underline" href="https://hitmaps.com"
                    >HITMAPS</a
                >
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "center-no-back",
});
useHead({
    title: "RRStats",
});

const { data: players } = await useFetch<string[]>("/api/player/list");
const { data: competitions } = await useFetch("/api/competitions/list");
const { data: numbers } = await useFetch("/api/onlyNumbers");

const competitionsDropdown = computed(() => {
    if (competitions.value === null) {
        return [];
    }
    return competitions.value
        .filter((c) => c.officialCompetition && c.tag.includes("RR"))
        .map((c) => c.tag);
});

function selectTournament(tournament: string) {
    navigateTo(`/matches?tournament=${tournament}`);
}
</script>
