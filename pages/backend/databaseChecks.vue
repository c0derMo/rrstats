<template>
    <div>
        <div class="text-3xl bold my-5">Database checks</div>

        <div v-if="isLoading">
            <span class="text-xl">Checking database...</span>
            <FontAwesomeIcon :icon="['fas', 'gear']" class="animate-spin" />
        </div>
        <CheckResults
            v-else-if="resultData.length !== 0"
            :results="resultData"
            @recheck="resultData = []"
        />
        <CheckSelectors v-else :checks="checks" @confirm="runChecks" />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    pageTitle: "Database checks",
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

async function runChecks(
    checks: string[],
    ignoredCompetitions: string[],
    knownIssues: string,
) {
    if (checks.length === 0) {
        return;
    }
    isLoading.value = true;
    const checkQuery = await $fetch("/api/procedures/databaseChecks", {
        method: "POST",
        body: { checks, ignoredCompetitions, knownIssues },
    });
    resultData.value = checkQuery;

    isLoading.value = false;
}

await loadChecks();
</script>
