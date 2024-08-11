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

            <span>Logged in as: {{ user?.username ?? "unknown" }}</span>
            <div class="mb-2">
                <slot name="DarkModeToggle" />
            </div>
        </div>

        <div class="mx-5">
            <slot />
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
const { data: user } = await useFetch("/api/auth/user");
const { data: numbers } = await useFetch("/api/onlyNumbers");

const route = useRoute();

const nextAlertId = ref(0);
const alerts: Ref<{ text: string; type?: string; alertId: number }[]> = ref([]);

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
