<template>
    <div class="relative">
        <div class="flex relative h-min w-full">
            <div
                class="absolute w-full h-full bg-gray-300 dark:bg-gray-500 opacity-80 dark:opacity-20 rounded"
            />
            <div class="absolute h-full dark:bg-gray-700 bg-gray-100 w-10 rounded scale-y-75 transition-all duration-200" :style="selectorStyle" />
            <div class="flex flex-row w-full gap-3 p-1 z-10" ref="parentElement">
                <div
                    v-for="tab in tabs"
                    :key="tab"
                    :class="{
                        'hover:!bg-opacity-40': selectedTab !== tab,
                    }"
                    class="flex-grow text-center py-1 rounded z-10 !bg-opacity-0 dark:bg-gray-700 bg-gray-100"
                    @click="(e) => changeTab(tab, e)"
                >
                    {{ tab }}
                </div>
            </div>
        </div>
        <div class="mt-2">
            <template v-for="tab in tabs" :key="tab">
                <div v-if="selectedTab === tab">
                    <slot :name="tab" />
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    tabs: string[];
}>();

const emits = defineEmits<{
    changeTab: [value: string];
}>();

const selectedTab = ref(props.tabs[0]);
const tabElement = ref<HTMLDivElement | null>(null);
const parentElement = ref<HTMLDivElement | null>(null);

const selectorStyle = computed(() => {
    return `width: ${(tabElement.value?.clientWidth ?? 2) - 2}px; left: ${(tabElement.value?.offsetLeft ?? 0) + 1}px`;
})

function changeTab(tab: string, event: MouseEvent) {
    selectedTab.value = tab;
    tabElement.value = event.target as HTMLDivElement;
}

watch(selectedTab, () => {
    emits("changeTab", selectedTab.value);
});

onMounted(() => {
    tabElement.value = parentElement.value?.children.item(0) as HTMLDivElement ?? null;
})
</script>
