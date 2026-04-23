<template>
    <div
        class="relative inline"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
    >
        <slot />

        <Transition name="fade">
            <div
                v-if="showTooltip"
                class="absolute left-1/2 -translate-x-1/2 rounded p-2 z-50 bg-opacity-70 dark:bg-neutral-500 bg-neutral-200 whitespace-nowrap top-full"
            >
                <slot name="tooltip" />
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
    pointer-events: none;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<script setup lang="ts">
const showTooltip = ref(false);
</script>
