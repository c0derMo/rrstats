<template>
    <div class="flex flex-col gap-3 md:mx-10">
        <MapBackground />

        <h1 class="text-center text-5xl bold">Roulette Rivals Records</h1>

        <div class="italic text-center">
            Records are timed using the spin-timer, starting at the arrival of
            the spin, ending at pressing "Done" on the Roulette page.<br />
            Multi-map records are calculated by adding up all spin-timers of all
            maps.
        </div>

        <GenericRecordTable
            :records="genericRecords"
            :matches="records?.matches"
        />

        <h3 class="text-2xl">Map-Records</h3>

        <MapRecordTable :records="mapRecords" :matches="records?.matches" />

        <h3 class="text-2xl">Retired Records</h3>

        <div class="italic">
            This section contains records which are no longer actively tracked
            or achievable, due to rule changes, etc.
        </div>

        <GenericRecordTable
            :records="retiredRecords"
            :matches="records?.matches"
        />
    </div>
</template>

<script setup lang="ts">
import { isRetiredRecord } from "~/utils/interfaces/IRecord";

useHead({
    title: "Records - RRStats",
});

const { data: records } = await useFetch("/api/records");

const mapRecords = computed(() => {
    return records.value?.maps ?? [];
});

const genericRecords = computed(() => {
    return (
        records.value?.generic.filter((m) => !isRetiredRecord(m.record)) ?? []
    );
});

const retiredRecords = computed(() => {
    return (
        records.value?.generic.filter((m) => isRetiredRecord(m.record)) ?? []
    );
});
</script>
