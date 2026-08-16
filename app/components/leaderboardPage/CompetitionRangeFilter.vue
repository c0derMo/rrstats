<template>
    <div>
        <DoubleEndedSlider
            v-model:min-value="selectedMinComp"
            v-model:max-value="selectedMaxComp"

            class="w-full mb-2"
            :max="competitions.length - 1"
        />

        <div class="flex flex-row w-full gap-6">
            <div>
                <DropdownComponent
                    v-model="selectedMinComp"
                    :items="dropdownCompetitions"
                />
            </div>

            <div class="grow text-right">
                <ButtonComponent
                    @click="emits('update:modelValue', [5, competitions.length - 1])"
                >
                    Include all 3 seasons (RR5+)
                </ButtonComponent>
            </div>
            <div class="grow text-left">
                <ButtonComponent
                    @click="emits('update:modelValue', [10, competitions.length - 1])"
                >
                    Include Ambrose Island (RR9+)
                </ButtonComponent>
            </div>

            <div>
                <DropdownComponent
                    v-model="selectedMaxComp"
                    :items="dropdownCompetitions"
                    class="float-right"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const model = defineModel<number[]>({ required: true });
const emits = defineEmits<{
    "update:modelValue": [value: number[]];
}>();

const competitions = ref<string[]>([]);

onBeforeMount(async () => {
    const competitionsQuery = await useNavigatorInfo().getCompetitions();
    competitions.value = competitionsQuery
        .filter((comp) => comp.officialCompetition)
        .map((comp) => comp.tag)
        .toReversed();
    console.log(competitions.value.length);
});

const dropdownCompetitions = computed(() => {
    return competitions.value.map((comp, idx) => {
        return { text: comp, value: idx };
    });
});

const selectedMinComp = computed<number>({
    get: () => {
        if (model.value[0] < 0) {
            return competitions.value.length + model.value[0];
        }
        return model.value[0];
    },
    set: (val: number) => {
        model.value[0] = val;
        emits('update:modelValue', model.value);
    }
});

const selectedMaxComp = computed<number>({
    get: () => {
        if (model.value[1] < 0) {
            return competitions.value.length + model.value[1];
        }
        return model.value[1];
    },
    set: (val: number) => {
        model.value[1] = val;
        emits('update:modelValue', model.value);
    }
});
</script>