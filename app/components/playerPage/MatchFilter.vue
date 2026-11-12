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
            @input="selectFilterType"
        />
        <template v-else>
            <div class="italic">{{ selectedTagType.description }}</div>
            <div class="flex flex-row">
                <div
                    class="border-t border-l border-b rounded-l-sm border-neutral-400 bg-gray-200 dark:bg-gray-700 px-3 whitespace-nowrap"
                >
                    {{ selectedTagType.prefix }}
                </div>
                <AutocompleteComponent
                    class="w-full"
                    placeholer="Filter..."
                    mount-focussed
                    :suggest-when-empty="
                        !selectedTagType.disableSuggestWhenEmpty
                    "
                    :suggestions="selectedTagType.options"
                    @defocus="stageTwoConfirm(stageTwoValue)"
                    @confirm="stageTwoConfirm"
                    @input="(v) => (stageTwoValue = v)"
                    @keydown="stageTwoKeyDown"
                />
            </div>
        </template>

        <div class="flex flex-row gap-2 flex-wrap">
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
    options: string[];
    disableSuggestWhenEmpty?: boolean;
    noSecondStage?: boolean;
}

interface SelectedFilter extends Pick<FilterTag, "prefix" | "filterFunc"> {
    value: string;
}

const players = usePlayers();
await players.queryAll();
const navigatorInfo = useNavigatorInfo();
const competitions = await navigatorInfo.getCompetitions();
const allPlayers = (await navigatorInfo.getPlayers()).map(
    (player) => player.primaryName,
);
const maps = [
    ...getAllMaps().map((map) => getMap(map)!.name),
    ...getAllMaps().map((map) => getMap(map)!.abbreviation),
];

const props = defineProps<{
    matches: IMatch[];
    localPlayer: string;
}>();
const emits = defineEmits<{
    filteredMatches: [matches: IMatch[]];
}>();

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
        options: allPlayers,
        disableSuggestWhenEmpty: true,
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
        options: [
            ...competitions.map((comp) => comp.name),
            ...competitions.map((comp) => comp.tag),
        ],
    },
    {
        prefix: "Played map:",
        description: "Filters for a specific played map",
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            return match.playedMaps.some((map) => map.map === hitmanMap.map);
        },
        options: maps,
    },
    {
        prefix: "Picked map:",
        description: "Filters for a specific map picked by either player",
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            return match.playedMaps.some(
                (map) =>
                    map.map === hitmanMap.map &&
                    map.picked !== ChoosingPlayer.RANDOM,
            );
        },
        options: maps,
    },
    {
        prefix: "Picked map (player):",
        description:
            "Filters for a specific map picked by " +
            players.get(props.localPlayer),
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            const localPlayer =
                match.playerOne == props.localPlayer
                    ? ChoosingPlayer.PLAYER_ONE
                    : ChoosingPlayer.PLAYER_TWO;
            return match.playedMaps.some(
                (map) =>
                    map.map === hitmanMap.map && map.picked === localPlayer,
            );
        },
        options: maps,
    },
    {
        prefix: "Picked map (opponent):",
        description: "Filters for a specific map picked by the opponent",
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            const otherPlayer =
                match.playerOne == props.localPlayer
                    ? ChoosingPlayer.PLAYER_TWO
                    : ChoosingPlayer.PLAYER_ONE;
            return match.playedMaps.some(
                (map) =>
                    map.map === hitmanMap.map && map.picked === otherPlayer,
            );
        },
        options: maps,
    },
    {
        prefix: "Random map:",
        description: "Filters for a specific map which was randomly spun",
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            return match.playedMaps.some(
                (map) =>
                    map.map === hitmanMap.map &&
                    map.picked === ChoosingPlayer.RANDOM,
            );
        },
        options: maps,
    },
    {
        prefix: "Banned map:",
        description: "Filters for a specific map banned by either player",
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            return match.bannedMaps.some((map) => map.map === hitmanMap.map);
        },
        options: maps,
    },
    {
        prefix: "Banned map (player):",
        description:
            "Filters for a specific map picked by " +
            players.get(props.localPlayer),
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            const localPlayer =
                match.playerOne == props.localPlayer
                    ? ChoosingPlayer.PLAYER_ONE
                    : ChoosingPlayer.PLAYER_TWO;
            return match.bannedMaps.some(
                (map) =>
                    map.map === hitmanMap.map && map.picked === localPlayer,
            );
        },
        options: maps,
    },
    {
        prefix: "Banned map (opponent):",
        description: "Filters for a specific map picked by the opponent",
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            const otherPlayer =
                match.playerOne == props.localPlayer
                    ? ChoosingPlayer.PLAYER_TWO
                    : ChoosingPlayer.PLAYER_ONE;
            return match.bannedMaps.some(
                (map) =>
                    map.map === hitmanMap.map && map.picked === otherPlayer,
            );
        },
        options: maps,
    },
    {
        prefix: "Map won:",
        description:
            "Filters for a specific map won by " +
            players.get(props.localPlayer),
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            const localPlayer =
                match.playerOne == props.localPlayer
                    ? WinningPlayer.PLAYER_ONE
                    : WinningPlayer.PLAYER_TWO;
            return match.playedMaps.some(
                (map) =>
                    map.map === hitmanMap.map && map.winner === localPlayer,
            );
        },
        options: maps,
    },
    {
        prefix: "Map lost:",
        description: "Filters for a specific map won by the opponent",
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            const otherPlayer =
                match.playerOne == props.localPlayer
                    ? WinningPlayer.PLAYER_TWO
                    : WinningPlayer.PLAYER_ONE;
            return match.playedMaps.some(
                (map) =>
                    map.map === hitmanMap.map && map.winner === otherPlayer,
            );
        },
        options: maps,
    },
    {
        prefix: "Map tied:",
        description: "Filters for a specific map that ended in a tie",
        filterFunc: (map, match) => {
            const hitmanMap = getMapByName(map) || getMapByAbbreviation(map);
            if (hitmanMap == null) {
                return true;
            }
            return match.playedMaps.some(
                (map) =>
                    map.map === hitmanMap.map &&
                    map.winner === WinningPlayer.DRAW,
            );
        },
        options: maps,
    },
    {
        prefix: "Round:",
        description: "Filters for a specific round",
        filterFunc: (round, match) => {
            return match.round === round || match.round.endsWith(round);
        },
        options: [],
    },
    {
        prefix: "Score (player):",
        description:
            "Filters for a specific score of " + players.get(props.localPlayer),
        filterFunc: (score, match) => {
            if (match.playerOne === props.localPlayer) {
                return match.playerOneScore.toString() === score;
            } else {
                return match.playerTwoScore.toString() === score;
            }
        },
        options: [],
    },
    {
        prefix: "Score (opponent):",
        description: "Filters for a specific score of the opponent",
        filterFunc: (score, match) => {
            if (match.playerOne === props.localPlayer) {
                return match.playerTwoScore.toString() === score;
            } else {
                return match.playerOneScore.toString() === score;
            }
        },
        options: [],
    },
    {
        prefix: "Match won",
        description: "Filters for won matches",
        filterFunc: (_, match) => {
            if (match.playerOne === props.localPlayer) {
                return match.playerOneScore > match.playerTwoScore;
            } else {
                return match.playerTwoScore > match.playerOneScore;
            }
        },
        options: [],
        noSecondStage: true,
    },
    {
        prefix: "Match lost",
        description: "Filters for lost matches",
        filterFunc: (_, match) => {
            if (match.playerOne === props.localPlayer) {
                return match.playerTwoScore > match.playerOneScore;
            } else {
                return match.playerOneScore > match.playerTwoScore;
            }
        },
        options: [],
        noSecondStage: true,
    },
    {
        prefix: "Match tied",
        description: "Filters for tied matches",
        filterFunc: (_, match) => {
            return match.playerOneScore === match.playerTwoScore;
        },
        options: [],
        noSecondStage: true,
    },
    {
        prefix: "Forfeit",
        description: "Filters for forfeit matches",
        filterFunc: (_, match) => {
            return match.playerOneScore + match.playerTwoScore === 1;
        },
        options: [],
        noSecondStage: true,
    },
    {
        prefix: "Map forfeit",
        description: "Filters for matches with at least one forfeit map",
        filterFunc: (_, match) => {
            return match.playedMaps.some((map) => map.forfeit);
        },
        options: [],
        noSecondStage: true,
    },
];

const selectedTagType = ref<FilterTag | null>(null);
const stageTwoValue = ref("");
const resetAfterSuccess = ref(false);
const selectedFilters = ref<SelectedFilter[]>([]);

function selectFilterType(input: string) {
    const filterType = filterTags.find((tag) => input.trim() == tag.prefix);
    if (filterType != null) {
        selectedTagType.value = filterType;

        if (filterType.noSecondStage) {
            selectedFilters.value.push({
                prefix: filterType.prefix,
                filterFunc: filterType.filterFunc,
                value: "",
            });
            nextTick(() => {
                resetAfterSuccess.value = true;
                selectedTagType.value = null;
                filterMatches();
            });
        }
    }
}

function stageTwoConfirm(value: string) {
    if (stageTwoValue.value == "" && !selectedTagType.value?.noSecondStage) {
        return;
    }

    selectedFilters.value.push({
        prefix: selectedTagType.value!.prefix,
        filterFunc: selectedTagType.value!.filterFunc,
        value: value,
    });

    resetAfterSuccess.value = true;
    selectedTagType.value = null;
    stageTwoValue.value = "";
    filterMatches();
}

function stageTwoKeyDown(key: KeyboardEvent) {
    if (key.key == "Backspace" && stageTwoValue.value == "") {
        resetAfterSuccess.value = true;
        selectedTagType.value = null;
    }
}

function removeFilter(index: number) {
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
