<template>
    <div class="flex flex-col">
        <div
            v-for="(category, idx) of subcategorylessLeaderboards"
            :key="idx"
            class="py-1 px-3 w-full border-b last:border-0 dark:border-neutral-500 border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition"
            :class="{
                'bg-neutral-200 dark:bg-neutral-500': model?.name === category.name
            }"
            @click="model = category"
        >
            {{ category.name }}
        </div>

        <template
            v-for="(subcategory, idx) of subcategories"
            :key="idx"
        >
            <div
                class="mt-4 p-1 w-full border-b dark:border-neutral-500 border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition"
                @click="toggleSubcategory(subcategory.name)"
            >
            
            <FontAwesomeIcon
            :icon="['fas', 'chevron-down']"
            :class="{
                'rotate-180': expandedSubcategories.has(subcategory.name),
            }"
                    class="transition mt-1"
                    />
                    {{ subcategory.name }}
            </div>

            <div v-if="expandedSubcategories.has(subcategory.name)">
                <div
                    v-for="(category, lbIdx) of subcategory.leaderboards"
                    :key="lbIdx"
                    class="py-1 px-5 w-full border-b last:border-0 dark:border-neutral-500 border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition"
                    :class="{
                        'bg-neutral-200 dark:bg-neutral-500': model?.name === category.name
                    }"
                    @click="model = category"
                >
                    {{ category.name }}
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    leaderboards: LeaderboardTableDefinition[];
}>();

const model = defineModel<LeaderboardTableDefinition>();
const expandedSubcategories = ref<Set<string>>(new Set());

if (model.value?.subcategory != null) {
    expandedSubcategories.value.add(model.value.subcategory)
}

const subcategorylessLeaderboards = computed<LeaderboardTableDefinition[]>(() => {
    return props.leaderboards.filter((lb) => lb.subcategory == null);
});

const subcategories = computed<{ name: string, leaderboards: LeaderboardTableDefinition[] }[]>(() => {
    const subcategories = new Set<string>();
    const leaderboardsPerCategory: Record<string, LeaderboardTableDefinition[]> = {};
    props.leaderboards.forEach((lb) => {
        if (lb.subcategory != null) {
            subcategories.add(lb.subcategory);
            leaderboardsPerCategory[lb.subcategory] ??= [];
            leaderboardsPerCategory[lb.subcategory].push(lb);
        }
    });

    return [...subcategories].map((subcategory) => {
        return { name: subcategory, leaderboards: leaderboardsPerCategory[subcategory] ?? [] }
    });
});

function toggleSubcategory(subcategory: string) {
    if (model.value?.subcategory === subcategory) {
        expandedSubcategories.value.add(subcategory);
        return;
    }

    if (expandedSubcategories.value.has(subcategory)) {
        expandedSubcategories.value.delete(subcategory);
    } else {
        expandedSubcategories.value.add(subcategory);
    }
}

watch(model, (to) => {
    if (to?.subcategory == null) {
        return;
    }
    if (!expandedSubcategories.value.has(to.subcategory)) {
        expandedSubcategories.value.add(to.subcategory);
    }
});
</script>