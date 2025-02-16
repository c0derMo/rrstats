<template>
    <div class="flex flex-col gap-5">
        <h1 class="text-center text-5xl bold">Achievements</h1>

        <CardComponent class="w-4/5 mx-auto">
            <div class="grid grid-cols-[max-content_auto] gap-y-3 gap-x-14">
                <template
                    v-for="achievement in sortedMappedData"
                    :key="achievement"
                >
                    <div class="w-fit leading-10">
                        {{ achievement.name }}
                    </div>
                    <div
                        class="w-full dark:bg-black bg-white h-10 relative rounded-md"
                    >
                        <div
                            v-for="(level, idx) in achievement.completion"
                            :key="idx"
                            class="absolute left-0 h-full rounded-md leading-10 text-right text-transparent hover:text-current hover:bg-opacity-100 hover:z-50 text-clip transition text-nowrap border-r border-gray-500"
                            :style="`width: ${level * 100}%;`"
                            :class="getBarClass(idx)"
                        >
                            Level {{ achievement.completion.length - idx }}:
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

const sortedMappedData = computed(() => {
    const result = [];
    for (const achievement in data.value) {
        result.push({ name: achievement, completion: data.value[achievement] });
    }
    result.sort((a, b) => {
        return (
            b.completion[b.completion.length - 1] -
            a.completion[a.completion.length - 1]
        );
    });
    return result;
});

function getBarClass(index: number) {
    switch (index) {
        case 0:
            return "bg-blue-300 dark:bg-blue-900 z-20";
        case 1:
            return "bg-red-300 dark:bg-red-900 z-[19]";
        case 2:
            return "bg-green-300 dark:bg-green-900 z-[18]";
        case 3:
            return "bg-yellow-300 dark:bg-yellow-900 z-[17]";
        case 4:
            return "bg-slate-300 dark:bg-slate-900 z-[16]";
        case 5:
            return "bg-pink-300 dark:bg-pink-900 z-[15]";
        case 6:
            return "bg-indigo-300 dark:bg-indigo-900 z-[14]";
        case 7:
            return "bg-orange-300 dark:bg-orange-900 z-[13]";
    }
    return "bg-black z-10";
}
</script>
