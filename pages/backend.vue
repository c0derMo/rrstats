<template>
    <div>
        <div
            class="flex flex-row px-3 border-b h-16 gap-3 items-center dark:bg-slate-800 bg-gray-100"
        >
            <a
                class="text-2xl bold cursor-pointer"
                @click="navigateTo('/backend')"
            >
                RRStats
            </a>

            <div class="flex flex-row mt-2 ml-10 text-sm gap-5">
                <div>Matches: {{ numbers?.matches ?? "?" }}</div>
                <div class="border-x" />
                <div>
                    Competitions: {{ numbers?.competitions ?? "?" }} ({{
                        numbers?.officialCompetitions ?? "?"
                    }}
                    official)
                </div>
                <div class="border-x" />
                <div>Players: {{ numbers?.players ?? "?" }}</div>
                <div class="border-x" />
                <div>
                    Records:
                    {{
                        numbers != null
                            ? numbers.mapRecords + numbers.genericRecords
                            : "?"
                    }}
                    ({{ numbers?.genericRecords }} generic,
                    {{ numbers?.mapRecords }} map)
                </div>
            </div>

            <div class="flex-grow" />

            <NuxtLink to="/" class="italic px-2">Return to main page</NuxtLink>

            <span>Logged in as: {{ user?.username ?? "unknown" }}</span>
            <div class="mb-2">
                <div class="flex flex-row mt-2">
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
            </div>
        </div>

        <div class="mx-5">
            <NuxtPage v-if="user != null" :user="user" />
        </div>

        <div class="z-10 sticky bottom-3 left-3 w-72 flex flex-col gap-3">
            <AlertBoxComponent
                v-for="(alert, idx) of alerts"
                :key="alert.alertId"
                :type="alert.type"
                @close="() => removeAlert(idx)"
            >
                {{ alert.text }}
            </AlertBoxComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
});

const route = useRoute();
const { data: numbers } = await useFetch("/api/onlyNumbers");
const { data: user, error: userError } = await useFetch("/api/auth/user");

const nextAlertId = ref(0);
const alerts: Ref<{ text: string; type?: string; alertId: number }[]> = ref([]);
const lightDarkSwitch = inject<Ref<boolean>>("lightDarkSwitch")!;

if (userError.value != null) {
    navigateTo("/api/auth/discord_login", { external: true });
}

useRouter().afterEach((to) => {
    updateTitle(to.meta.pageTitle as string);
});
updateTitle(route.meta.pageTitle as string);

function updateTitle(pageTitle?: string) {
    useHead({
        title: (pageTitle != null ? `${pageTitle} - ` : "") + "RRStats Backend",
    });
}

function addAlert(text: string, type?: string) {
    alerts.value.push({ text, type, alertId: nextAlertId.value });
    nextAlertId.value++;
}

function removeAlert(index: number) {
    alerts.value.splice(index, 1);
}

provide("alertHandler", addAlert);
</script>
