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

        <div class="text-3xl bold my-5">Matches</div>
        <div class="flex flex-row gap-3 my-5">
            <MultiSelectComponent
                v-model="filter"
                empty-text="Filters:"
                :items="['No VOD', 'No Shoutcasters', 'No Spin']"
            />

            <TextInputComponent
                v-model="search"
                placeholder="Search for player, competition, round..."
                class="flex-grow"
            />
        </div>

        <DataTableComponent
            :headers="headers"
            :rows="matchesToShow"
            :enable-sorting="false"
            :rows-per-page="[10, 25, 50]"
            :items-per-page="10"
        >
            <template #header-more>
                <ButtonComponent @click="newMatch()">
                    <FontAwesomeIcon
                        :icon="['fas', 'plus']"
                        class="text-green-500"
                    ></FontAwesomeIcon>
                </ButtonComponent>
            </template>

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
                <ButtonComponent
                    :confirm-button="true"
                    @click="deleteMatch(row.uuid)"
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
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { DateTime } from "luxon";
import { IMatch } from "~/utils/interfaces/IMatch";

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
    pageTitle: "Matches",
});

const matches: Ref<IMatch[]> = ref([]);
const playerLookupTable: Ref<Record<string, string>> = ref({});
const matchToShow: Ref<IMatch | null> = ref(null);
const search = ref("");
const filter: Ref<string[]> = ref([]);

const headers = [
    { key: "competition", title: "Competition" },
    { key: "round", title: "Round" },
    { key: "playerOne", title: "Player one" },
    { key: "score", title: "Score" },
    { key: "playerTwo", title: "Player two" },
    { key: "more", title: "" },
];

const matchesToShow = computed(() => {
    let result = matches.value;

    if (search.value !== "") {
        result = result.filter((match) => {
            if (match.competition.includes(search.value)) return true;
            if (playerLookupTable.value[match.playerOne].includes(search.value))
                return true;
            if (playerLookupTable.value[match.playerTwo].includes(search.value))
                return true;
            if (match.round.includes(search.value)) return true;
            if (match.uuid.includes(search.value)) return true;
    
            return false;
        });
    }

    if (filter.value.includes('No VOD')) {
        result = result.filter((match) => {
            return match.vodLink == null;
        });
    }
    if (filter.value.includes('No Shoutcasters')) {
        result = result.filter((match) => {
            return match.shoutcasters == null || match.shoutcasters.length > 0;
        });
    }
    if (filter.value.includes('No Spin')) {
        result = result.filter((match) => {
            return match.playedMaps.some((map) => map.spin == null);
        });
    }


    return result;
});

function newMatch() {
    matchToShow.value = {
        uuid: "",
        bannedMaps: [],
        competition: "",
        hitmapsMatchId: "",
        playedMaps: [],
        playerOne: "",
        playerOneScore: 0,
        playerTwo: "",
        playerTwoScore: 0,
        round: "",
        timestamp: DateTime.now().toMillis(),
    };
}

async function deleteMatch(uuid: string) {
    await useFetch("/api/matches", {
        method: "DELETE",
        body: { uuid },
    });

    await updateList();
}

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
