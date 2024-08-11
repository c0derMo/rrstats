<template>
    <div>
        <CompetitionEditor
            v-if="competitionToShow !== null"
            :competition="competitionToShow"
            :placements="placementsToShow!"
            @close="
                competitionToShow = null;
                updateList();
            "
        />

        <div class="text-3xl bold mt-5">Competitions</div>

        <DataTableComponent
            :headers="headers"
            :rows="competitions"
            :enable-sorting="false"
            :rows-per-page="[10, 25, 50]"
            :selected-rows-per-page="10"
        >
            <template #header-more>
                <ButtonComponent @click="newCompetition()">
                    <FontAwesomeIcon
                        :icon="['fa', 'plus']"
                        class="text-green-500"
                    />
                </ButtonComponent>
            </template>

            <template #more="{ row }">
                <ButtonComponent
                    :loading="competitionToLoad === row.tag"
                    @click="loadUpdateMatch(row.tag)"
                >
                    <FontAwesomeIcon :icon="['fa', 'pen']" />
                </ButtonComponent>
                <ButtonComponent
                    :confirm-button="true"
                    @click="deleteCompetition(row.tag)"
                >
                    <FontAwesomeIcon
                        :icon="['fa', 'trash']"
                        class="text-red-500"
                    />
                </ButtonComponent>
            </template>
        </DataTableComponent>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";
import type {
    ICompetition,
    ICompetitionPlacement,
} from "~/utils/interfaces/ICompetition";

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
    pageTitle: "Competitions",
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

function newCompetition() {
    placementsToShow.value = [];
    competitionToShow.value = {
        name: "",
        tag: "",
        officialCompetition: false,
        startingTimestamp: DateTime.now().toMillis(),
        matchTimeoutTime: -1,
    };
}

async function deleteCompetition(tag: string) {
    await $fetch("/api/competitions", {
        method: "DELETE",
        body: { tag },
    });

    await updateList();
}

async function updateList() {
    try {
        const competitionsQuery = await $fetch("/api/competitions/list");
        competitions.value = competitionsQuery;
    } catch {
        error.value = true;
    }
}

async function loadUpdateMatch(tag: string) {
    competitionToLoad.value = tag;
    try {
        const compQuery = await $fetch("/api/competitions", { query: { tag } });
        const placementsQuery = await $fetch("/api/competitions/placements", {
            query: { tag },
        });
        competitionToShow.value = compQuery;
        placementsToShow.value = placementsQuery;
    } catch {
        error.value = true;
    }
    competitionToLoad.value = "";
}

await updateList();
</script>
