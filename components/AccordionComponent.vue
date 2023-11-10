<template>
    <CardComponent>
        <div class="border-b" @click="showContent = !showContent">
            <slot name="title" />

            <FontAwesomeIcon 
                :icon="['fas', 'chevron-down']"
                :class="{
                    'rotate-180': showContent
                }"
                class="transition float-right"
            />
        </div>

        <div class="overflow-hidden" :class="{ 'h-0': !showContent }">
            <slot />
        </div>
    </CardComponent>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

library.add(faChevronDown);

const showContent = ref(false);
</script>