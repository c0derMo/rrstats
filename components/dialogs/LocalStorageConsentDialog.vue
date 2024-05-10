<template>
    <DialogComponent @click-outside="$emit('decline')">
        <CardComponent class="fixed right-3 top-10 text-sm">
            <h1 class="font-bold text-base">Just one second</h1>

            We use your browser's local storage to save your theme and other
            preferences.<br />
            This data stays on your system and is never shared with anyone.<br />

            <ButtonComponent @click="$emit('consent')">Consent</ButtonComponent>
            <ButtonComponent class="ml-3" @click="$emit('decline')"
                >Decline</ButtonComponent
            >
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
defineEmits(["consent", "decline"]);
</script>
