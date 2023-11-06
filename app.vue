
<template>
    <div :class="{ 'dark': isDarkMode }" class="w-full h-full">
        <div class="dark:text-white min-w-screen min-h-screen w-full h-full flex flex-col">
            <div class="dark:bg-slate-900 fixed w-full h-full -z-50"></div>
            <NuxtLayout>
                <template #DarkModeToggle>
                    <SwitchComponent v-model="isDarkMode" id="light-dark" />
                </template>

                <NuxtPage />
            </NuxtLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
const isDarkMode = ref(true);
</script>