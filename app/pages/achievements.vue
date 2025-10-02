<template>
    <div class="flex flex-col gap-5">
        <MapBackground />

        <h1 class="text-center text-5xl bold">Achievements</h1>

        <CardComponent class="w-4/5 mx-auto overflow-y-visible">
            <div class="grid grid-cols-[max-content_auto] gap-y-3 gap-x-14">
                <template
                    v-for="achievement in sortedMappedData"
                    :key="achievement"
                >
                    <div
                        :id="normalizeName(achievement.name)"
                        class="w-fit leading-10"
                    >
                        <TooltipComponent
                            @click="setHash('#' + achievement.name)"
                        >
                            <template #tooltip>
                                {{
                                    achievement.achievement?.description[0] ??
                                    ""
                                }}
                            </template>
                            {{ achievement.name }}
                        </TooltipComponent>
                    </div>
                    <div
                        class="w-full dark:bg-slate-600 bg-white h-10 relative rounded-md"
                    >
                        <div
                            v-for="(level, idx) in achievement.completion"
                            :key="idx"
                            class="absolute left-0 h-full rounded-md leading-10 text-right text-transparent hover:text-black hover:bg-opacity-100 hover:z-50 text-clip transition text-nowrap border-r border-gray-500"
                            :style="
                                getBarStyle(idx, level, achievement.achievement)
                            "
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

type StrippedAchievementInfo = Omit<AchievementInfo, "achievedAt" | "progress">;

const { data } = await useFetch<Record<string, number[]>>(
    "/api/achievements/statistics",
    { default: () => ({}) },
);

const { data: achievementInfo } = await useFetch<StrippedAchievementInfo[]>(
    "/api/achievements/list",
    { default: () => [] },
);

const setHash = useHash((hash: string[]) => {
    const achievement = achievementInfo.value.find((ach) => {
        return `#${ach.name}` === hash[0];
    });
    if (achievement != null) {
        const element = document.querySelector(
            `#${normalizeName(achievement.name)}`,
        );
        if (element != null) {
            window.scrollTo({
                top: Math.max(
                    0,
                    window.scrollY + element.getBoundingClientRect().y - 15,
                ),
                left: window.scrollX + element.getBoundingClientRect().x,
                behavior: "smooth",
            });
        }
    }
});

const sortedMappedData = computed(() => {
    const result = [];
    for (const achievement in data.value) {
        const thisAchievementInfo = achievementInfo.value.find(
            (a) => a.name === achievement,
        );
        result.push({
            name: achievement,
            completion: data.value[achievement],
            achievement: thisAchievementInfo,
        });
    }
    result.sort((a, b) => {
        return (
            b.completion[b.completion.length - 1] -
            a.completion[a.completion.length - 1]
        );
    });
    return result;
});

function getBarStyle(
    level: number,
    width: number,
    achievement?: StrippedAchievementInfo,
) {
    const invertedLevel = achievement ? achievement.levels - level - 1 : level;

    const tier = achievement?.tier[invertedLevel] ?? AchievementTier.BRONZE;
    const rgb = hexToRgb(getColorOfTier(tier).color) ?? { r: 0, g: 0, b: 0 };

    rgb.r = clamp(0, rgb.r - invertedLevel * 12, 255);
    rgb.g = clamp(0, rgb.g - invertedLevel * 12, 255);
    rgb.b = clamp(0, rgb.b - invertedLevel * 12, 255);

    return {
        width: `${width * 100}%`,
        "z-index": 20 - level,
        "background-color": `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    };
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

function clamp(min: number, val: number, max: number) {
    return Math.min(max, Math.max(min, val));
}
</script>
