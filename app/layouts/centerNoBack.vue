<template>
    <div class="grid h-screen place-items-center">
        <div class="absolute top-3 right-3 flex-row gap-2 flex items-center">
            <slot name="Login" />
            <slot name="DarkModeToggle" />
        </div>
        <slot />
    </div>
</template>
