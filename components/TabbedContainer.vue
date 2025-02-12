<template>
    <div class="relative">
        <div class="flex relative h-min w-full">
            <div
                class="absolute w-full h-full bg-gray-300 dark:bg-gray-500 opacity-80 dark:opacity-20 rounded"
            />
            <div
                class="absolute h-full dark:bg-gray-700 bg-gray-100 w-10 rounded scale-y-75 transition-all duration-200"
                :style="selectorStyle"
            />
            <div
                ref="parentElement"
                class="flex flex-row w-full gap-3 p-1 z-10"
            >
                <div
                    v-for="thisTab in tabs"
                    :key="thisTab"
                    :class="{
                        'hover:!bg-opacity-40': selectedTab !== thisTab,
                    }"
                    class="flex-grow text-center py-1 rounded z-10 !bg-opacity-0 dark:bg-gray-700 bg-gray-100"
                    @click="(e) => changeTab(thisTab, e)"
                >
                    {{ thisTab }}
                </div>
            </div>
        </div>
        <div class="mt-2">
            <template v-for="thisTab in tabs" :key="thisTab">
                <div v-if="selectedTab === thisTab">
                    <slot :name="thisTab" />
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    tabs: string[];
    tab?: string;
}>();

const emits = defineEmits<{
    changeTab: [value: string];
    "update:tab": [value: string];
}>();

const selectedTab = ref(props.tab ?? props.tabs[0]);
const tabElement = ref<HTMLDivElement | null>(null);
const parentElement = ref<HTMLDivElement | null>(null);

const selectorStyle = computed(() => {
    return `width: ${(tabElement.value?.clientWidth ?? 2) - 2}px; left: ${(tabElement.value?.offsetLeft ?? 0) + 1}px`;
});

function changeTab(tab: string, event: MouseEvent) {
    selectedTab.value = tab;
    tabElement.value = event.target as HTMLDivElement;
}

watch(selectedTab, () => {
    emits("changeTab", selectedTab.value);
    emits("update:tab", selectedTab.value);
});

onMounted(() => {
    tabElement.value =
        (parentElement.value?.children.item(0) as HTMLDivElement) ?? null;
});

onUpdated(() => {
    const index = Math.max(
        0,
        props.tabs.findIndex((v) => v === selectedTab.value),
    );
    tabElement.value =
        (parentElement.value?.children.item(index) as HTMLDivElement) ?? null;
});
</script>
