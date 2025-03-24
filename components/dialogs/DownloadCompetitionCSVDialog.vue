<template>
    <DialogComponent
        :open="dialogOpen"
        @click-outside="dialogOpen = false"
        @closed="$emit('closed')"
    >
        <CardComponent>
            <h1 class="text-2xl bold mb-5">
                Download all matches of selected competitions as a csv file
            </h1>
            <div>The file will include headers on line 1.</div>
            <div>
                If any further data is required, feel free to message CurryMaker
                on discord.
            </div>

            <MultiSelectComponent
                v-model="selectedCompetitions"
                :items="mappedCompetitions"
            />

            <div class="mt-5 text-xl">You are allowed to use this data to:</div>
            <ul>
                <li>▪ calculate your own statistics</li>
                <li>▪ do your own investigations</li>
                <li>▪ publish your findings</li>
            </ul>
            <div class="text-xl">You are NOT allowed to:</div>
            <ul>
                <li>▪ provide this data as-is to others</li>
                <li>▪ claim this data as your own</li>
            </ul>

            <div class="mt-8">
                By downloading the file, you agree to these conditions.
            </div>
            <ButtonComponent class="float-right mt-3" @click="download"
                >I understand, download the file</ButtonComponent
            >
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
const props = defineProps<{
    competition: string;
}>();
const emits = defineEmits<{
    closed: [];
}>();

const dialogOpen = ref(true);
const competitions = ref(await useNavigatorInfo().getCompetitions());
const selectedCompetitions = ref([props.competition]);

const mappedCompetitions = computed(() => {
    return (
        competitions.value
            ?.filter((competition) => competition.officialCompetition)
            .map((competition) => competition.tag) ?? []
    );
});

function download() {
    if (selectedCompetitions.value.length <= 0) {
        return;
    }
    const data = selectedCompetitions.value
        .map((comp) => `competitions=${comp}`)
        .join("&");
    navigateTo(`/api/procedures/csv?${data}`, { open: { target: "_blank" } });
    emits("closed");
}
</script>
