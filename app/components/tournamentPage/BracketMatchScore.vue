<template>
    <MatchMapsTooltip
        v-if="maps != null && playerOne != null && playerTwo != null"
        :maps="maps"
        :players="[playerOne, playerTwo]"
    >
        <slot />
    </MatchMapsTooltip>
    <div v-else>
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    maps?: RRMap[];
    playerOne?: string;
    playerTwo?: string;
}>();
</script>
