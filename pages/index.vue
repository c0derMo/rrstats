<template>
    <CardComponent>
        <h1 class="text-lg">RRStats v3</h1>
        <br>
        <AutocompleteComponent placeholder="Player" class="w-[600px]" :suggestions="players" />
    </CardComponent>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'center-no-back'
});
const players = [
    'Some Random Person',
    'In4Fun',
    'Blithe',
    'CurryMaker',
    'Yannini'
]
</script>