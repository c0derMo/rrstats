<template>
    <div class="w-56 h-56 bg-slate-200 dark:bg-slate-700 rounded-3xl flex flex-col p-5 hover:dark:bg-slate-800 hover:bg-slate-300 transition hover:scale-105 cursor-pointer" @click="navigateTo(target)">

        <div class="h-3/5 text-center text-7xl">
            <slot />
        </div>

        <div class="border-t text-center pt-2 text-xl border-gray-400">
            {{ title }}
        </div>

        <div class="font-light text-center">
            {{ subtitle }}
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    "title": {
        type: String,
        required: true,
    },
    "subtitle": {
        type: String,
        required: false,
        default: ""
    },
    "target": {
        type: String,
        required: true,
    }
})
</script>