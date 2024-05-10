<template>
    <div class="grid h-screen place-items-center">
        <div class="absolute top-1 right-3">
            <slot name="DarkModeToggle" />
        </div>
        <slot />
    </div>
</template>
