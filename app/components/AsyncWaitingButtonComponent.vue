<template>
    <ButtonComponent
        :disable-hover="disableHover"
        :confirm-button="confirmButton"
        :loading="isLoading"
        @click="handleLocalClick"
    >
        <slot />
    </ButtonComponent>
</template>

<script setup lang="ts">
const props = defineProps<{
    disableHover?: boolean;
    confirmButton?: boolean;
    handler: () => Promise<unknown>;
}>();

const isLoading = ref(false);

async function handleLocalClick() {
    isLoading.value = true;
    try {
        await props.handler();
    } finally {
        isLoading.value = false;
    }
}
</script>
