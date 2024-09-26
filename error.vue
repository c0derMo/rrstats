<template>
    <div :class="{ dark: isDarkMode }" class="w-full h-full">
        <div
            class="dark:text-white min-w-screen min-h-screen w-full h-full flex flex-col from-blue-200 to-slate-200 dark:from-blue-950 dark:to-slate-800 bg-gradient-to-b"
        >
            <NuxtLayout name="center-no-back">
                <div class="flex flex-col gap-5 text-center place-items-center">
                    <div class="text-3xl font-titilliumWeb">
                        {{ chosenErrorTitle }}
                    </div>
                    <div class="text-xm font-titilliumWeb">
                        {{ error.statusCode }}
                    </div>

                    <div v-if="error.statusCode === 404">
                        The page you are searching for doesn't exist.<br />
                        Just like Nitroglycerin.
                    </div>

                    <div
                        v-else-if="
                            error.statusCode === 403 || error.statusCode === 401
                        "
                    >
                        There's no way you're accessing that page, 47.<br />
                        It only displays for people with an authentic security
                        clearance.
                    </div>

                    <div v-else-if="error.statusCode === 400">
                        Richard, you are such a fool! How could you forget the
                        parameters?<br />
                        All you had to do was to remember to send the correct
                        request, display some data, and let the server to the
                        working.
                    </div>

                    <div v-else-if="error.statusCode >= 500">
                        Server integrity collapsed. Summoning system
                        administrators for manual reset.<br /><br /><br /><br />
                        Server adminstrator C.Maker enroute.
                    </div>

                    <div v-else>
                        It broke.<br />
                        I don't even know what broke, so I cant write a funny
                        message here. :(
                    </div>

                    <ButtonComponent @click="clear()">
                        Go back home
                    </ButtonComponent>
                </div>
            </NuxtLayout>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
    error: NuxtError;
}>();

const errorTitles = [
    "You shouldn't be here.",
    "@CurryMaker @CurryMaker @CurryMaker rrstats broke :(",
    "#BlameCurry",
    "// TODO: Fix this",
    "Curry, stop doing maintenance mid match",
    "RRStats? What RRStats?",
    "Your one-stop-shop for all your error needs.",
];
const chosenErrorTitle = ref("");

const isDarkMode = ref(true);

onMounted(() => {
    isDarkMode.value =
        window.localStorage.getItem("theme") === "dark" ||
        (window.localStorage.getItem("theme") === null &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

    chosenErrorTitle.value =
        errorTitles[Math.floor(errorTitles.length * Math.random())];
    console.error(props.error.message);
});

function clear() {
    clearError({
        redirect: "/",
    });
}
</script>
