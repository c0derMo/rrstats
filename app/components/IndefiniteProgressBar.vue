<template>
    <div
        class="h-1 w-full bg-neutral-200 dark:bg-neutral-600 overflow-x-hidden"
    >
        <div class="h-1 bg-red-800 dark:bg-red-700 progressbar" />
    </div>
</template>

<style scoped>
.progressbar {
    animation: endlessLoadingBar 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    transform-origin: 0% 50%;
}

@keyframes endlessLoadingBar {
    0% {
        transform: translateX(0) scaleX(0);
    }
    40% {
        transform: translateX(0) scaleX(0.5);
    }
    100% {
        transform: translateX(100%) scaleX(1);
    }
}
</style>
