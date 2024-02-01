<template>
    <div>
        <div class="ml-5 text-3xl bold my-5">Database checks</div>

        <div v-if="isLoading" class="mx-5">
            <span class="text-xl">Checking database...</span>
            <FontAwesomeIcon :icon="['fas', 'gear']" class="animate-spin" />
        </div>
        <CheckResults
            v-else-if="resultData.length !== 0"
            :results="resultData"
            class="mx-5"
            @recheck="resultData = []"
        />
        <CheckSelectors
            v-else
            :checks="checks"
            class="mx-5"
            @confirm="runChecks"
        />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: "backend",
    middleware: ["auth"],
});

const checks: Ref<{ id: string; name: string; description: string }[]> = ref(
    [],
);
const resultData: Ref<{ name: string; issues: string[]; errors: string[] }[]> =
    ref([]);
const isLoading = ref(false);

async function loadChecks() {
    const checkQuery = await useFetch("/api/procedures/databaseChecks");

    if (
        checkQuery.status.value !== "success" ||
        checkQuery.data.value == null
    ) {
        return;
    }

    checks.value = checkQuery.data.value;
}

async function runChecks(checks: string[]) {
    if (checks.length === 0) {
        return;
    }
    isLoading.value = true;
    const checkQuery = await useFetch("/api/procedures/databaseChecks", {
        method: "POST",
        body: checks,
    });

    if (
        checkQuery.status.value !== "success" ||
        checkQuery.data.value == null
    ) {
        return;
    }

    resultData.value = checkQuery.data.value;
    isLoading.value = false;
}

await loadChecks();
</script>
