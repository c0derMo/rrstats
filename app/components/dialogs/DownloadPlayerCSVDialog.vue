<template>
    <DialogComponent
        :open="dialogOpen"
        @click-outside="dialogOpen = false"
        @closed="$emit('closed')"
    >
        <CardComponent>
            <h1 class="text-2xl bold mb-5">
                Download all matches of this player as a csv file
            </h1>
            <div>The file will include headers on line 1.</div>
            <div>
                If any further data is required, feel free to message CurryMaker
                on discord.
            </div>

            <div class="mt-5 text-xl">You are allowed to use this data to:</div>
            <ul>
                <li>▪ Calculate your own statistics</li>
                <li>▪ Do your own investigations</li>
                <li>▪ Publish your findings</li>
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
    player: string;
}>();
const emits = defineEmits<{
    closed: [];
}>();

const dialogOpen = ref(true);

function download() {
    navigateTo(`/api/procedures/csv?player=${props.player}`, {
        open: { target: "_blank" },
    });
    emits("closed");
}
</script>
