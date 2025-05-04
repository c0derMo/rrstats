<template>
    <div class="flex flex-row items-center gap-2 ml-8">
        <FontAwesomeIcon :icon="['far', 'circle']" size="2xs" class="mt-1" />
        <span>
            <slot />
        </span>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>
