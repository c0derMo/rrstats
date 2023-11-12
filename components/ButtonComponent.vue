<template>
    <div class="relative border inline-block w-fit rounded dark:border-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition ease-in-out duration-150 active:bg-neutral-300 active:dark:bg-neutral-500 cursor-pointer select-none">
        <div class="absolute w-full h-full bg-opacity-70 bg-gray-500 text-center" v-if="loading">
            <FontAwesomeIcon :icon="['fa', 'spinner']" class="h-full animate-spin" />
        </div>
        <div class="p-2" @click="$emit('click')">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner);

defineEmits([
    'click'
]);
defineProps({
    'loading': {
        type: Boolean,
        default: false,
    }
})
</script>