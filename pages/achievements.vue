<template>
    <div class="flex flex-col gap-5">
        <h1 class="text-center text-5xl bold">Achievements</h1>

        <CardComponent class="w-4/5 mx-auto">
            <div class="grid grid-cols-[max-content_auto] gap-y-3 gap-x-14">
                <template v-for="key in Object.keys(data)" :key="key">
                    <div class="w-fit leading-10">{{ key }}</div>
                    <div class="w-full bg-black h-10 relative rounded-md">
                        <div
                            v-for="(level, idx) in data[key]"
                            :key="idx"
                            class="absolute left-0 h-full bg-opacity-35 rounded-md leading-10 text-right text-transparent hover:text-current hover:bg-opacity-100 hover:z-50 text-clip transition text-nowrap"
                            :style="`width: ${level * 100}%; z-index: ${20 - idx};`"
                            :class="getBarClass(idx)"
                        >
                            Level {{ data[key].length - idx }}:
                            {{ (level * 100).toFixed(2) }}%
                        </div>
                    </div>
                </template>
            </div>
        </CardComponent>
    </div>
</template>

<script setup lang="ts">
useHead({
    title: `Achievements - RRStats`,
});

const { data } = await useFetch<Record<string, number[]>>(
    "/api/achievements/statistics",
    { default: () => ({}) },
);

function getBarClass(index: number) {
    switch (index) {
        case 0:
            return "bg-blue-500";
        case 1:
            return "bg-red-500";
        case 2:
            return "bg-green-500";
        case 3:
            return "bg-yellow-500";
        case 4:
            return "bg-slate-500";
        case 5:
            return "bg-pink-500";
        case 6:
            return "bg-indigo-500";
        case 7:
            return "bg-orange-500";
    }
    return "bg-black";
}
</script>
