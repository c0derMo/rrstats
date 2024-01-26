<template>
    <div
        class="relative border inline-block w-fit rounded dark:border-neutral-500 transition ease-in-out duration-150 cursor-pointer select-none font-titilliumWeb"
        :class="{
            'dark:hover:bg-neutral-600 hover:bg-neutral-100 active:bg-neutral-300 active:dark:bg-neutral-500':
                !disableHover,
        }"
    >
        <div
            v-if="loading"
            class="absolute w-full h-full bg-opacity-70 bg-gray-500 text-center"
        >
            <FontAwesomeIcon
                :icon="['fa', 'spinner']"
                class="h-full animate-spin"
            />
        </div>
        <div class="p-2" @click="$emit('click')">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
defineEmits(["click"]);
defineProps({
    loading: {
        type: Boolean,
        default: false,
    },
    disableHover: {
        type: Boolean,
        default: false,
    },
});
</script>
