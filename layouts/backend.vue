<template>
    <div>
        <div
            class="flex flex-row px-3 border-b h-16 gap-3 items-center dark:bg-slate-800 bg-gray-100"
        >
            <a class="text-2xl bold" href="/backend">RRStats</a>

            <div class="flex flex-row mt-2 ml-10 text-sm gap-5">
                <div>Matches: {{ numbers?.matches ?? "?" }}</div>
                <div class="border-x"></div>
                <div>
                    Competitions: {{ numbers?.competitions ?? "?" }} ({{
                        numbers?.officialCompetitions ?? "?"
                    }}
                    official)
                </div>
                <div class="border-x"></div>
                <div>Players: {{ numbers?.players ?? "?" }}</div>
                <div class="border-x"></div>
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

            <div class="flex-grow"></div>

            <span>Logged in as: {{ user?.username ?? "unknown" }}</span>
            <div class="mb-2">
                <slot name="DarkModeToggle" />
            </div>
        </div>
        <slot />
    </div>
</template>

<script setup lang="ts">
const user = (await useFetch("/api/auth/user")).data;
const numbers = (await useFetch("/api/onlyNumbers")).data;
</script>
