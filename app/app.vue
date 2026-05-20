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
                        class="cursor-pointer dark:text-white"
                        @click="$router.back()"
                    />
                </template>

                <template #HomeButton>
                    <NuxtLink to="/">
                        <FontAwesomeIcon
                            :icon="['fas', 'home']"
                            class="cursor-pointer dark:text-white"
                        />
                    </NuxtLink>
                </template>

                <template #Login>
                    <div v-if="user != null" class="font-thin italic">
                        Welcome, {{ user?.username }}
                        <FontAwesomeIcon
                            :icon="['fas', 'arrow-right-from-bracket']"
                            class="cursor-pointer"
                            @click="
                                navigateTo('/api/auth/logout', {
                                    external: true,
                                })
                            "
                        />
                    </div>
                    <FontAwesomeIcon
                        v-else
                        :icon="['fas', 'arrow-right-to-bracket']"
                        class="cursor-pointer"
                        @click="
                            navigateTo(
                                `/api/auth/discord_login?to=${route.path}`,
                                { external: true },
                            )
                        "
                    />
                </template>

                <template #DarkModeToggle>
                    <div class="flex flex-row">
                        <FontAwesomeIcon
                            :icon="['fas', 'sun']"
                            class="dark:text-white"
                        />
                        <SwitchComponent
                            id="light-dark"
                            v-model="lightDarkSwitch"
                        />
                        <FontAwesomeIcon
                            :icon="['fas', 'moon']"
                            class="ml-3 dark:text-white"
                        />
                    </div>
                </template>

                <NuxtPage :user="user" />
            </NuxtLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { settings } from "./composables/localSettings";

const isDarkMode = ref(true);
const lightDarkSwitch = ref(true);
const showForm = ref(false);
const initialized = ref(false);
const route = useRoute();

const { data: user } = useFetch("/api/auth/user", {
    headers: useRequestHeaders(),
});

const actualIsDarkMode = computed(() => {
    return isDarkMode.value && route.fullPath != "/MrMike";
});

settings.registerWriteCallback(() => {
    showForm.value = true;
});

onMounted(() => {
    settings.read();
    isDarkMode.value = settings.darkMode;
    lightDarkSwitch.value = isDarkMode.value;
    nextTick(() => {
        initialized.value = true;
    });
});

watch(lightDarkSwitch, (newValue, oldValue) => {
    if (showForm.value || !initialized.value) {
        return;
    }
    if (settings.hasConsented()) {
        settings.darkMode = newValue;
        isDarkMode.value = newValue;
    } else {
        settings.requestConsent();
        nextTick(() => {
            lightDarkSwitch.value = oldValue;
        });
    }
});

function consentToLocalStorage() {
    settings.setConsent(true);
    showForm.value = false;
}

provide("lightDarkSwitch", lightDarkSwitch);
</script>
