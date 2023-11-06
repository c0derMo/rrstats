<template>
    <div class="fixed z-50 bg-black bg-opacity-50 w-full h-full top-0 left-0 grid place-items-center">
        <div class="absolute w-full h-full" @click="$emit('clickOutside')"></div>
        <div class="relative" :class="dialogClass">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
defineEmits(['clickOutside']);

defineProps({
    dialogClass: {
        type: String,
        required: false,
    }
});
</script>