<template>
    <a
        class="rounded-full px-2 whitespace-nowrap hover:bg-gray-500 transition-all"
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
