<template>
    <div class="group relative inline">
        <span class="peer">
            <slot />
        </span>
        <div
            class="opacity-0 peer-hover:opacity-100 transition absolute left-1/2 -translate-x-1/2 top-10 rounded p-2 z-50 bg-opacity-70 pointer-events-none dark:bg-neutral-500 bg-neutral-200 whitespace-nowrap"
        >
            <slot name="tooltip" />
        </div>
    </div>
</template>
