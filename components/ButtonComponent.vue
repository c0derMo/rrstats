<template>
    <div class="p-2 border inline-block w-fit rounded dark:border-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition ease-in-out duration-150 active:bg-neutral-300 active:dark:bg-neutral-500 cursor-pointer select-none" @click="$emit('click')">
        <slot />
    </div>
</template>

<script setup lang="ts">
defineEmits([
    'click'
]);
</script>