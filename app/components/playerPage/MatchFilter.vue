<template>
    <div class="flex flex-col gap-2">
        <AutocompleteComponent
            v-if="selectedTagType == null"
            class="w-full"
            placeholder="Filter..."
            suggest-when-empty
            :mount-focussed="resetAfterSuccess"
            :suggestions="filterTags.map((f) => f.prefix)"
            @confirm="selectFilterType"
        />
        <template v-else>
            <div class="flex flex-row">
                <div
                    class="border-t border-l border-b rounded-l-sm border-neutral-400 bg-gray-200 dark:bg-gray-700 px-3 whitespace-nowrap"
                >
                    {{ selectedTagType.prefix }}
                </div>
                <TextInputComponent
                    v-model="stageTwoValue"
                    class="w-full"
                    placeholder="Filter..."
                    mount-focussed
                    @focus-change="stageTwoFocusChange"
                    @keydown="stageTwoKeyDown"
                />
            </div>
            <div class="italic">{{ selectedTagType.description }}</div>
        </template>

        <div class="flex flex-row gap-2 flex-wrap">
            <!-- <FilterTag>Opponent: CurryMaker</FilterTag>
            <FilterTag>Played map: Berlin</FilterTag>
            <FilterTag>Won map: Mendoza</FilterTag>
            <FilterTag>Banned: Mendoza</FilterTag>
            <FilterTag>Match win</FilterTag>
            <FilterTag>Player score: 6</FilterTag>
            <FilterTag>Opponent score: 2</FilterTag> -->
            <FilterTag
                v-for="(tag, idx) of selectedFilters"
                :key="idx"
                @click.stop="removeFilter(idx)"
            >
                {{ tag.prefix }} {{ tag.value }}
            </FilterTag>
        </div>
    </div>
</template>

<script setup lang="ts">
interface FilterTag {
    prefix: string;
    description: string;
    filterFunc: (val: string, match: IMatch) => boolean;
}

interface SelectedFilter extends Pick<FilterTag, "prefix" | "filterFunc"> {
    value: string;
}

const players = usePlayers();
await players.queryAll();
const navigatorInfo = useNavigatorInfo();
const competitions = await navigatorInfo.getCompetitions();

const filterTags: FilterTag[] = [
    {
        prefix: "Opponent:",
        description: "Filters for a specific opponent",
        filterFunc: (oppo, match) => {
            return (
                match.playerOne === players.getUUID(oppo) ||
                match.playerTwo === players.getUUID(oppo)
            );
        },
    },
    {
        prefix: "Competition:",
        description: "Filters for a specific competition",
        filterFunc: (comp, match) => {
            return (
                match.competition === comp ||
                match.competition ===
                    competitions.find((c) => c.name === comp)?.tag
            );
        },
    },
    { prefix: "Played map:", description: "PM desc", filterFunc: () => true },
    { prefix: "Picked map:", description: "Pick desc", filterFunc: () => true },
    { prefix: "Banned map:", description: "BM desc", filterFunc: () => true },
];

const props = defineProps<{
    matches: IMatch[];
}>();
const emits = defineEmits<{
    filteredMatches: [matches: IMatch[]];
}>();

const selectedTagType = ref<FilterTag | null>(null);
const stageTwoValue = ref("");
const resetAfterSuccess = ref(false);
const selectedFilters = ref<SelectedFilter[]>([]);

function selectFilterType(input: string) {
    const filterType = filterTags.find((tag) => input.trim() == tag.prefix);
    if (filterType != null) {
        selectedTagType.value = filterType;
    }
}

function stageTwoFocusChange(focussed: boolean) {
    if (focussed) {
        return;
    }
    if (stageTwoValue.value == "") {
        return;
    }

    selectedFilters.value.push({
        prefix: selectedTagType.value!.prefix,
        filterFunc: selectedTagType.value!.filterFunc,
        value: stageTwoValue.value,
    });

    resetAfterSuccess.value = true;
    selectedTagType.value = null;
    stageTwoValue.value = "";
    filterMatches();
}

function stageTwoKeyDown(key: KeyboardEvent) {
    if (key.key == "Enter") {
        stageTwoFocusChange(false);
    }
    if (key.key == "Backspace" && stageTwoValue.value == "") {
        selectedTagType.value = null;
    }
}

function removeFilter(index: number) {
    console.log("Clicked pog");
    selectedFilters.value.splice(index, 1);
    filterMatches();
}

function filterMatches() {
    emits(
        "filteredMatches",
        props.matches.filter((match) => {
            return selectedFilters.value.every((filter) =>
                filter.filterFunc(filter.value, match),
            );
        }),
    );
}
</script>
