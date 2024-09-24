<template>
    <CardComponent>
        <div class="text-xl">Select checks to run</div>

        <div class="grid grid-cols-3 p-5 gap-y-3">
            <div v-for="check in checks" :key="check.id" class="flex flex-col">
                <SwitchComponent
                    :id="check.id"
                    :label="check.name"
                    @update:model-value="
                        (value) => toggleCheck(check.id, value)
                    "
                />
                <span class="text-sm">{{ check.description }}</span>
            </div>
        </div>

        <TextInputComponent
            v-model="ignoredCompetitions"
            class="w-full mb-2"
            placeholder="Ignored competitions (comma seperated)"
        />

        <TextInputComponent
            v-model="knownIssues"
            class="w-full mb-2"
            placeholder="Known issues - there should be no need to change this unless your name is or you're instructed by CurryMaker"
        />

        <ButtonComponent
            @click="
                $emit(
                    'confirm',
                    selectedChecks,
                    ignoredCompetitions.split(',').map((c) => c.trim()),
                    knownIssues,
                )
            "
            >Run checks</ButtonComponent
        >
    </CardComponent>
</template>

<script setup lang="ts">
defineEmits<{
    confirm: [
        selectedChecks: string[],
        ignoredCompetitions: string[],
        knownIssues: string,
    ];
}>();
defineProps<{
    checks: { id: string; name: string; description: string }[];
}>();

const selectedChecks: Ref<string[]> = ref([]);
const knownIssues = ref(
    "placements:d5007ed2-4c1c-47b5-819d-24c9f7cecddb:RR4;placements:d5007ed2-4c1c-47b5-819d-24c9f7cecddb:RR5",
);
const ignoredCompetitions = ref("RR1");

function toggleCheck(checkId: string, value: boolean) {
    if (value) {
        selectedChecks.value.push(checkId);
    } else {
        selectedChecks.value.splice(
            selectedChecks.value.findIndex((check) => check === checkId),
            1,
        );
    }
}
</script>
