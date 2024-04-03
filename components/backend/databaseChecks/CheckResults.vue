<template>
    <CardComponent>
        <div class="flex flex-row justify-between">
            <div class="text-xl">Results</div>
            <ButtonComponent @click="$emit('recheck')">Rerun</ButtonComponent>
        </div>

        <div class="grid grid-cols-3 p-5 gap-y-3 gap-x-10">
            <div
                v-for="(result, idx) in results"
                :key="idx"
                class="flex flex-col gap-1 max-h-96 overflow-y-auto"
            >
                <span class="text-lg">{{ result.name }} ({{ result.issues.length }} warnings, {{ result.errors.length }} errors)</span>

                <div
                    v-for="(error, errorId) in result.errors"
                    :key="errorId"
                    class="border rounded p-1 border-red-500 px-2"
                >
                    <FontAwesomeIcon
                        :icon="['fas', 'triangle-exclamation']"
                        class="text-red-500"
                    />
                    {{ error }}
                </div>

                <div
                    v-for="(issue, issueId) in result.issues"
                    :key="issueId"
                    class="border rounded p-1 border-yellow-500 px-2"
                >
                    <FontAwesomeIcon
                        :icon="['fas', 'question']"
                        class="text-yellow-500"
                    />
                    {{ issue }}
                </div>

                <div
                    v-if="
                        result.issues.length === 0 && result.errors.length === 0
                    "
                    class="border rounded p-1 border-green-500 px-2"
                >
                    <FontAwesomeIcon
                        :icon="['fas', 'check-double']"
                        class="text-green-500"
                    />
                    No issues found!
                </div>
            </div>
        </div>
    </CardComponent>
</template>

<script setup lang="ts">
defineProps({
    results: {
        type: Array<{ name: string; issues: string[]; errors: string[] }>,
        required: true,
    },
});
defineEmits(["recheck"]);
</script>
