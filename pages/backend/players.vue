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

        <div class="ml-5 text-3xl bold mt-5">Players</div>

        <TextInputComponent v-model="search" placeholder="Search" class="m-5" />

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
                <ButtonComponent>
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
});

const players: Ref<IPlayer[]> = ref([]);
const playerLoading = ref("");
const search = ref("");
const playerToShow: Ref<IPlayer | null> = ref(null);

const headers = [
    { key: "primaryName", title: "Name" },
    { key: "accolade", title: "Accolate" },
    { key: "more", title: "" },
];

const filteredPlayers = computed(() => {
    if (search.value === "") return players.value;
    return players.value.filter(
        (p) =>
            p.primaryName.includes(search.value) ||
            p.accolade.includes(search.value),
    );
});

function newPlayer() {
    playerToShow.value = {
        uuid: "",
        primaryName: "",
        alternativeNames: [],
        accolade: "",
    };
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
