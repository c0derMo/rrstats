<template>
    <CardComponent>
        <div class="border-b border-gray-500" @click="showContent = !showContent">
            <slot name="title" />

            <FontAwesomeIcon
                :icon="['fas', 'chevron-down']"
                :class="{
                    'rotate-180': showContent,
                }"
                class="transition float-right"
            />
        </div>

        <div class="overflow-hidden transition-[max-height] duration-200" :class="{ 'max-h-0': !showContent, 'max-h-[2000px]': showContent }">
            <slot />
        </div>
    </CardComponent>
</template>

<script setup lang="ts">
const props = defineProps({
    expanded: {
        type: Boolean,
        default: false
    }
});

const showContent = ref(props.expanded);
</script>
