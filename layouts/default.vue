<template>
    <div>
        <div class="flex flex-row justify-between mt-1 mx-3">
            <div>
                <slot name="BackButton" />
            </div>
            <div>
                <slot name="DarkModeToggle" />
            </div>
        </div>
        <slot />
    </div>
</template>
