<template>
    <div>
        <PlayerEditor
            v-if="playerToShow != null"
            :player="playerToShow"
            @close="
                playerToShow = null;
                updateList();
            "
        />

        <div class="text-3xl bold mt-5">Players</div>

        <div class="flex flex-row gap-3 my-5">
            <MultiSelectComponent
                v-model="filter"
                empty-text="Filters:"
                :items="['No nationality']"
            />
            <TextInputComponent
                v-model="search"
                placeholder="Search"
                class="flex-grow"
            />
        </div>

        <DataTableComponent
            :headers="headers"
            :rows="filteredPlayers"
            :enable-sorting="false"
            :rows-per-page="[25, 50, 100]"
            :items-per-page="25"
        >
            <template #header-more>
                <ButtonComponent @click="newPlayer()">
                    <FontAwesomeIcon
                        :icon="['fa', 'plus']"
                        class="text-green-500"
                    />
                </ButtonComponent>
            </template>

            <template #more="{ row }">
                <ButtonComponent
                    :loading="playerLoading === row.uuid"
                    @click="loadUpdatePlayer(row.uuid)"
                >
                    <FontAwesomeIcon :icon="['fa', 'pen']" />
                </ButtonComponent>
                <ButtonComponent
                    :confirm-button="true"
                    @click="deletePlayer(row.uuid)"
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
import { IPlayer } from "~/utils/interfaces/IPlayer";

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
    pageTitle: "Players",
});

const players: Ref<IPlayer[]> = ref([]);
const playerLoading = ref("");
const search = ref("");
const playerToShow: Ref<IPlayer | null> = ref(null);
const filter: Ref<string[]> = ref([]);

const headers = [
    { key: "primaryName", title: "Name" },
    { key: "accolade", title: "Accolade" },
    { key: "more", title: "" },
];

const filteredPlayers = computed(() => {
    let result = players.value;

    if (search.value !== "") {
        result = result.filter((p) => {
            return p.primaryName.toLowerCase().includes(search.value.toLowerCase()) ||
                p.accolade.toLowerCase().includes(search.value.toLowerCase());
        });
    }

    if (filter.value.includes("No nationality")) {
        result = result.filter((p) => {
            return (
                p.nationality == null ||
                p.nationality == undefined ||
                p.nationality == ""
            );
        });
    }

    return result;
});

function newPlayer() {
    playerToShow.value = {
        uuid: "",
        primaryName: "",
        alternativeNames: [],
        accolade: "",
    };
}

async function deletePlayer(uuid: string) {
    await useFetch("/api/player", {
        method: "DELETE",
        body: { uuid },
    });

    await updateList();
}

async function updateList() {
    const playersQuery = await useFetch("/api/player/list", {
        query: { full: true },
    });
    if (
        playersQuery.status.value !== "success" ||
        playersQuery.data.value == null
    ) {
        return;
    }

    players.value = playersQuery.data.value as IPlayer[];
}

async function loadUpdatePlayer(uuid: string) {
    playerLoading.value = uuid;
    const playerQuery = await useFetch("/api/player/raw", {
        query: { player: uuid },
    });
    if (
        playerQuery.status.value === "success" &&
        playerQuery.data.value != null
    ) {
        playerToShow.value = playerQuery.data.value;
    }

    playerLoading.value = "";
}

await updateList();
</script>
