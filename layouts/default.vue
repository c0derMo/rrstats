<template>
    <div>
        <div class="flex flex-row justify-between mt-1 mx-3">
            <div class="flex-row gap-2 flex items-center">
                <slot name="BackButton" />
                <slot name="HomeButton" />
            </div>
            <div>
                <slot name="DarkModeToggle" />
            </div>
        </div>
        <slot />
    </div>
</template>
