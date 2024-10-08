<template>
    <div :class="{ dark: actualIsDarkMode }" class="w-full h-full">
        <div
            class="dark:text-white min-w-screen min-h-screen w-full h-full flex flex-col"
        >
            <div class="dark:bg-slate-900 fixed w-full h-full -z-50" />
            <LocalStorageConsentDialog
                v-if="showForm"
                @decline="showForm = false"
                @consent="consentToLocalStorage"
            />

            <NuxtLoadingIndicator />

            <NuxtLayout>
                <template #BackButton>
                    <FontAwesomeIcon
                        :icon="['fas', 'chevron-circle-left']"
                        class="cursor-pointer text-white"
                        @click="$router.back()"
                    />
                </template>

                <template #HomeButton>
                    <FontAwesomeIcon
                        :icon="['fas', 'home']"
                        class="cursor-pointer text-white"
                        @click="$router.push('/')"
                    />
                </template>

                <template #DarkModeToggle>
                    <div class="flex flex-row mt-2">
                        <FontAwesomeIcon
                            :icon="['fas', 'sun']"
                            class="text-white"
                        />
                        <SwitchComponent
                            id="light-dark"
                            v-model="lightDarkSwitch"
                        />
                        <FontAwesomeIcon
                            :icon="['fas', 'moon']"
                            class="ml-3 text-white"
                        />
                    </div>
                </template>

                <NuxtPage />
            </NuxtLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
const isDarkMode = ref(true);
const lightDarkSwitch = ref(true);
const showForm = ref(false);
const initialized = ref(false);
const route = useRoute();

const actualIsDarkMode = computed(() => {
    return isDarkMode.value && route.fullPath != "/MrMike";
});

onMounted(() => {
    lightDarkSwitch.value =
        window.localStorage.getItem("theme") === "dark" ||
        (window.localStorage.getItem("theme") === null &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
    isDarkMode.value =
        window.localStorage.getItem("theme") === "dark" ||
        (window.localStorage.getItem("theme") === null &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
    nextTick(() => {
        initialized.value = true;
    });
});

watch(isDarkMode, () => {
    if (!initialized.value) {
        return;
    }
    window.localStorage.setItem("theme", isDarkMode.value ? "dark" : "light");
});

watch(lightDarkSwitch, (newValue, oldValue) => {
    if (showForm.value || !initialized.value) {
        return;
    }
    if (window.localStorage.getItem("consent") === null) {
        showForm.value = true;
        nextTick(() => {
            lightDarkSwitch.value = oldValue;
        });
    } else {
        isDarkMode.value = newValue;
    }
});

function consentToLocalStorage() {
    window.localStorage.setItem("consent", "consented");
    showForm.value = false;
}
</script>
