<template>
    <div
        class="flex flex-row pt-1 px-3 border-b h-16 gap-3 items-center dark:bg-slate-800 bg-gray-100"
    >
        <div class="text-2xl bold">RRStats</div>

        <div class="flex-grow"></div>

        <span> Logged in as: unknown </span>
        <div class="mb-2">
            <slot name="DarkModeToggle" />
        </div>
    </div>
    <slot />
</template>
