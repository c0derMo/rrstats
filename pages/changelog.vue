<template>
    <div class="flex flex-col gap-6 items-center">
        <MapBackground />
        <h1 class="text-center text-5xl bold">Changelog</h1>

        <CardComponent
            v-for="entry in data"
            :key="entry.id"
            class="w-2/3"
            :class="{
                'mb-16': entry.major,
            }"
        >
            <div class="flex flex-row gap-5 items-end mb-2">
                <div class="text-2xl">Version {{ entry.version }}</div>
                <div class="flex-grow text-3xl bold">
                    {{ entry.versionTitle }}
                </div>
                <div class="text-lg italic">{{ isoToString(entry.date) }}</div>
            </div>
            <ContentRenderer :value="entry" prose />
        </CardComponent>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from "luxon";

const { data } = await useAsyncData(() => queryCollection("changelog").all());

useHead({
    title: `Changelog - RRStats`,
});

const allDates = computed(() => {
    return (
        data.value?.map((data) => DateTime.fromMillis(data.date).toISODate()) ??
        []
    );
});

function isoToString(isoDate: number): string {
    const dt = DateTime.fromMillis(isoDate);
    const otherReleasesThisDate = allDates.value.filter((date) => {
        return date === dt.toISODate();
    });

    return dt
        .setLocale(useLocale().value)
        .toLocaleString(
            otherReleasesThisDate.length > 1
                ? DateTime.DATETIME_MED
                : DateTime.DATE_MED,
        );
}
</script>
