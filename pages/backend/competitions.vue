<template>
    <CompetitionEditor
        v-if="competitionToShow !== null"
        :competition="competitionToShow"
        :placements="placementsToShow!"
        @close="
            competitionToShow = null;
            updateList();
        "
    />

    <div class="ml-5 text-3xl bold mt-5">Competitions</div>

    <DataTableComponent
        :headers="headers"
        :rows="competitions"
        :enableSorting="false"
    >
        <template v-slot:header-more="">
            <ButtonComponent>
                <FontAwesomeIcon
                    :icon="['fa', 'plus']"
                    class="text-green-500"
                />
            </ButtonComponent>
        </template>

        <template v-slot:more="{ row }">
            <ButtonComponent
                :loading="competitionToLoad === row.tag"
                @click="loadUpdateMatch(row.tag)"
            >
                <FontAwesomeIcon :icon="['fa', 'pen']" />
            </ButtonComponent>
            <ButtonComponent>
                <FontAwesomeIcon :icon="['fa', 'trash']" class="text-red-500" />
            </ButtonComponent>
        </template>
    </DataTableComponent>
</template>

<script setup lang="ts">
import {
    ICompetition,
    ICompetitionPlacement,
} from "~/utils/interfaces/ICompetition";

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
});

const competitions: Ref<ICompetition[]> = ref([]);
const error = ref(false);
const competitionToShow: Ref<ICompetition | null> = ref(null);
const placementsToShow: Ref<ICompetitionPlacement[] | null> = ref(null);
const competitionToLoad = ref("");

const headers = [
    { key: "tag", title: "Tag" },
    { key: "name", title: "Name" },
    { key: "more", title: "" },
];

async function updateList() {
    const competitionsQuery = await useFetch("/api/competitions/list");
    if (
        competitionsQuery.status.value !== "success" ||
        competitionsQuery.data.value == null
    ) {
        error.value = true;
    } else {
        competitions.value = competitionsQuery.data.value;
        competitions.value.sort(
            (a, b) => b.startingTimestamp - a.startingTimestamp,
        );
    }
}

async function loadUpdateMatch(tag: string) {
    competitionToLoad.value = tag;
    const compQuery = await useFetch("/api/competitions", { query: { tag } });
    const placementsQuery = await useFetch("/api/competitions/placements", {
        query: { tag },
    });
    if (
        compQuery.status.value !== "success" ||
        compQuery.data.value == null ||
        placementsQuery.status.value !== "success" ||
        placementsQuery.data.value == null
    ) {
        error.value = true;
    } else {
        competitionToShow.value = compQuery.data.value;
        placementsToShow.value = placementsQuery.data.value;
    }
    competitionToLoad.value = "";
}

await updateList();
</script>
