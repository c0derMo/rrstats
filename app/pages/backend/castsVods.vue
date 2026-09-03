<template>
    <div class="flex flex-col gap-2 my-2">
        <div class="flex flex-row justify-end gap-2">
            <ButtonComponent class="text-yellow-500" @click="updateList()">
                Reload
            </ButtonComponent>
            <ButtonComponent class="text-green-500" @click="save()">
                Save
            </ButtonComponent>
        </div>

        <SpreadsheetTable :columns="columns" :rows="tableRows">
            <template #timestamp="{ content }">
                {{ formatTimestamp(content) }}
            </template>

            <template #casters="{ index }">
                <TextInputComponent
                    :model-value="getCasters(index)"
                    @update:model-value="(v) => setCasters(index, v)"
                />
            </template>

            <template #vods="{ index }">
                <TextInputComponent
                    :model-value="getVODs(index)"
                    @update:model-value="(v) => setVODs(index, v)"
                />
            </template>
        </SpreadsheetTable>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";

definePageMeta({
    pageTitle: "Casts & VODs",
});

const columns = [
    { name: "competition", title: "Competition", width: "auto" },
    { name: "timestamp", title: "Timestamp", width: "auto" },
    { name: "players", title: "Players", width: "auto" },
    { name: "casters", title: "Shoutcasters", width: "auto" },
    { name: "vods", title: "VOD", width: "auto" },
];

const players = usePlayers();
await players.queryAll();
const addAlert =
    inject<(text: string, type?: string) => void>("alertHandler") ?? (() => {});

const matches: Ref<IMatch[]> = ref([]);
const matchesToUpdate: Ref<Set<number>> = ref(new Set());

const tableRows = computed(() => {
    return matches.value.map((match) => {
        let castColor = "";
        if (match.shoutcasters == null || match.shoutcasters.length <= 0) {
            castColor = "bg-red-500";
        }
        let vodColor = "";
        if (match.vodLink == null || match.vodLink.length <= 0) {
            vodColor = "bg-yellow-500";
        }

        return {
            cells: [
                { content: match.competition },
                { content: match.timestamp },
                {
                    content: `${players.get(match.playerOne)} vs ${players.get(match.playerTwo)}`,
                },
                { content: "", backgroundColor: castColor },
                { content: "", backgroundColor: vodColor },
            ],
        };
    });
});

function getCasters(index: number) {
    return matches.value[index].shoutcasters?.join(", ") ?? "";
}

function getVODs(index: number) {
    return matches.value[index].vodLink?.join(", ") ?? "";
}

function setCasters(index: number, value: string | number) {
    matchesToUpdate.value.add(index);
    matches.value[index].shoutcasters = (value as string)
        .split(",")
        .map((name) => name.trim());
}

function setVODs(index: number, value: string | number) {
    matchesToUpdate.value.add(index);
    matches.value[index].vodLink = (value as string)
        .split(",")
        .map((name) => name.trim());
}

function formatTimestamp(ts: unknown) {
    const dt = DateTime.fromMillis(ts as number);
    return dt.toLocaleString(DateTime.DATETIME_MED);
}

async function save() {
    let successes = 0;
    let fails = 0;
    for (const matchIndex of matchesToUpdate.value) {
        try {
            await $fetch("/api/matches", {
                method: "post",
                body: matches.value[matchIndex],
            });
            successes += 1;
        } catch {
            fails += 1;
        }
    }
    if (fails > 0) {
        addAlert(
            `${fails} matches failed saving, ${successes} succeeded.`,
            "error",
        );
    } else {
        addAlert(`Successfully saved ${successes} matches.`);
    }
    matchesToUpdate.value = new Set();
}

async function updateList() {
    matches.value = [];
    const matchQuery = await $fetch("/api/matches/raw", {
        headers: useRequestHeaders(),
    });
    matches.value = matchQuery
        .filter((match) => {
            return (
                match.vodLink == null ||
                match.vodLink.length <= 0 ||
                match.shoutcasters == null ||
                match.shoutcasters.length <= 0
            );
        })
        .sort((a, b) => {
            return b.timestamp - a.timestamp;
        });
}

onMounted(async () => {
    await updateList();
});
</script>
