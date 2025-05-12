<template>
    <a
        class="rounded-full px-2 whitespace-nowrap dark:hover:bg-gray-500 hover:bg-gray-300 transition-all"
        :href="`/${player}`"
    >
        {{ player }}
    </a>
</template>

<script setup lang="ts">
defineProps<{
    player: string;
}>();
</script>
