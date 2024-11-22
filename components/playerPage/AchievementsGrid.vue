<template>
    <div class="grid grid-cols-6 gap-x-5 gap-y-2">
        <TooltipComponent
            v-for="(achievement, index) in achievements"
            :key="index"
        >
            <div
                class="rounded bg-gray-700 bg-opacity-50 text-center py-2"
            >
                <div
                    class="rounded-full bg-gray-900 w-16 h-16 mx-auto"
                >
                    <FontAwesomeIcon
                        :icon="['fas', 'trophy']"
                        :style="getColorOfValue(achievement.value)"
                        class="!h-8 mt-4"
                    />
                </div>
                <span>{{ achievement.name }}</span>
            </div>

            <template #tooltip>
                <span>Sum tooltip much wow</span>
            </template>
        </TooltipComponent>
    </div>
</template>

<script setup lang="ts">
const achievements = [
    { name: "Spin the Wheel", value: 1 },
    { name: "Globetrotter", value: 2 },
    { name: "Roulette Player", value: 1 },
    { name: "Names Are For Friends", value: 3 },
    { name: "Returning Rival", value: 1 },
    { name: "Against All Odds", value: 0 },
    { name: "Cutting Edge", value: 1 },
    { name: "Dressed for the Occasion", value: 2 },
    { name: "Kaboom", value: 3 },
    { name: "No Witnesses", value: 4 },
    { name: "One of a Kind", value: 4 },
    { name: "Remember, no pacify", value: 2 },
    { name: "Why's it Spicy?", value: 0 },
    { name: "Worth a Shot", value: 3 }
];

function getColorOfValue(value: number) {
    switch (value) {
        case 1:
            return {"color": "#ffcfc9"};
        case 2:
            return {"color": "#e7e7e7"};
        case 3:
            return {"color": "#ffe39c"};
        case 4:
            return {"color": "#bcfaf2"};
        default:
            return {"color": "#4f4f4f"};
    }
}
</script>