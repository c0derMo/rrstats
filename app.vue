
<template>
    <div :class="{ 'dark': isDarkMode }" class="w-full h-full">
        <div class="dark:text-white min-w-screen min-h-screen w-full h-full flex flex-col">
            <div class="dark:bg-slate-900 fixed w-full h-full -z-50"></div>
            <NuxtLayout>
                <template #DarkModeToggle>
                    <div class="flex flex-row mt-2">
                        <FontAwesomeIcon
                            :icon="['fas', 'sun']"
                        />
                        <SwitchComponent v-model="isDarkMode" id="light-dark" />
                        <FontAwesomeIcon
                            :icon="['fas', 'moon']"
                            class="ml-3"
                        />
                    </div>
                </template>
                <NuxtLoadingIndicator />
                <NuxtPage />
            </NuxtLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

library.add(faSun);
library.add(faMoon);

const isDarkMode = ref(true);
</script>