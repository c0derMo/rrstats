<template>
    <div class="relative">
        <div class="absolute w-full h-10 bg-gray-500 opacity-20 rounded"></div>
        <div class="flex flex-row w-full gap-3 p-1 z-10">
            <div v-for="tab in tabs" :key="tab" class="flex-grow text-center py-1 rounded z-10" :class="{'dark:bg-gray-700 bg-gray-100': selectedTab === tab, 'dark:hover:bg-gray-800 hover:bg-gray-200': selectedTab !== tab}" @click="selectedTab = tab">{{ tab }}</div>
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
const props = defineProps({
    tabs: {
        type: Array<string>,
        required: true
    }
})

const selectedTab = ref(props.tabs[0]);
</script>