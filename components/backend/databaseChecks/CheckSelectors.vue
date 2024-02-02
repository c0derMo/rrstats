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

        <ButtonComponent
            @click="
                $emit(
                    'confirm',
                    selectedChecks,
                    ignoredCompetitions.split(',').map((c) => c.trim()),
                )
            "
            >Run checks</ButtonComponent
        >
    </CardComponent>
</template>

<script setup lang="ts">
defineEmits(["confirm"]);
defineProps({
    checks: {
        type: Array<{ id: string; name: string; description: string }>,
        required: true,
    },
});

const selectedChecks: Ref<string[]> = ref([]);
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
