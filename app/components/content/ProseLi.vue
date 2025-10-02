<template>
    <div class="flex flex-row gap-2 ml-6">
        <FontAwesomeIcon :icon="['fas', 'circle']" class="mt-3 text-[5px]" />
        <span>
            <slot />
        </span>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>
