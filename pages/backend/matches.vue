<template>
    <div>
        <MatchEditor
            v-if="matchToShow != null"
            :match="matchToShow"
            @close="
                matchToShow = null;
                updateList();
            "
        />

        <div class="ml-5 text-3xl bold mt-5">Matches</div>

        <DataTableComponent
            :headers="headers"
            :rows="matches"
            :enable-sorting="false"
            :rows-per-page="[10, 25, 50]"
            :items-per-page="10"
        >
            <template #playerOne="{ value }">
                {{ playerLookupTable[value as string] }}
            </template>

            <template #score="{ row }">
                {{ row.playerOneScore }} - {{ row.playerTwoScore }}
            </template>

            <template #playerTwo="{ value }">
                {{ playerLookupTable[value as string] }}
            </template>

            <template #more="{ row }">
                <ButtonComponent @click="matchToShow = row">
                    <FontAwesomeIcon :icon="['fa', 'pen']" />
                </ButtonComponent>
            </template>
        </DataTableComponent>
    </div>
</template>

<script setup lang="ts">
import { IMatch } from "~/utils/interfaces/IMatch";

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
});

const matches: Ref<IMatch[]> = ref([]);
const playerLookupTable: Ref<Record<string, string>> = ref({});
const matchToShow: Ref<IMatch | null> = ref(null);

const headers = [
    { key: "competition", title: "Competition" },
    { key: "round", title: "Round" },
    { key: "playerOne", title: "Player one" },
    { key: "score", title: "Score" },
    { key: "playerTwo", title: "Player two" },
    { key: "more", title: "" },
];

async function updatePlayers() {
    const playerQuery = await useFetch("/api/player/lookup");

    if (
        playerQuery.status.value !== "success" ||
        playerQuery.data.value == null
    ) {
        return;
    }

    playerLookupTable.value = playerQuery.data.value as Record<string, string>;
}

async function updateList() {
    const matchQuery = await useFetch("/api/matches/list");
    if (
        matchQuery.status.value !== "success" ||
        matchQuery.data.value == null
    ) {
        return;
    }

    matches.value = matchQuery.data.value;
}

await updateList();
await updatePlayers();
</script>
