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
    await props.handler();
    isLoading.value = false;
}
</script>
