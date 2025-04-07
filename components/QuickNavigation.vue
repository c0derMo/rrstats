<template>
    <div>
        <FontAwesomeIcon
            :icon="['fas', 'bolt']"
            class="cursor-pointer dark:text-white"
            @click="open"
        />
        <DialogComponent
            v-if="qsOpen"
            :open="dialogVisible"
            @click-outside="dialogVisible = false"
            @opened="focus"
            @closed="dialogClosed"
        >
            <CardComponent>
                <div class="flex flex-col">
                    <div class="flex flex-row gap-2 items-center">
                        <div class="font-bold">Quick Navigation</div>
                        <div class="text-xs">(Ctrl + K)</div>
                    </div>
                    <div class="flex flex-row my-2">
                        <div
                            class="text-xl border-t border-l border-b flex items-center pr-4 pl-1 rounded-l border-neutral-400 bg-gray-200 dark:bg-gray-700 w-56 justify-end"
                        >
                            <span>{{
                                suggestions[selectedSuggestion]?.type ??
                                "Player"
                            }}</span>
                        </div>
                        <div
                            class="flex flex-row rounded-r border-neutral-500 text-lg bg-neutral-100 dark:bg-neutral-800 border items-center px-5 py-2 whitespace-pre"
                        >
                            <div class="opacity-40" @click="focus">
                                {{ suggestionPrefixText }}
                            </div>
                            <div class="relative">
                                <input
                                    ref="input"
                                    v-model="text"
                                    class="w-full outline-none bg-neutral-100 dark:bg-neutral-800"
                                    @keydown="onKeyDown"
                                />
                                <div
                                    class="absolute w-full h-full text-lg top-0 left-[1px] pointer-events-none opacity-40 flex flex-row"
                                >
                                    <div class="opacity-0">{{ text }}</div>
                                    <div>{{ suggestionSuffixText }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="text.length === 0">Start typing!</div>
                    <div v-else-if="suggestions.length === 0">
                        Nothing found :(
                    </div>
                    <div
                        v-for="(suggestion, idx) of suggestions"
                        v-else
                        :key="idx"
                        class="flex flex-row gap-3 rounded py-1 transition-all duration-150 bg-gray-600 bg-opacity-0 cursor-pointer"
                        :class="{
                            'bg-opacity-100': selectedSuggestion === idx,
                        }"
                        @click="confirmSelection(suggestion)"
                    >
                        <div class="w-56 text-right pr-4">
                            {{ suggestion.type }}
                        </div>
                        <div>
                            {{ suggestion.text }}
                        </div>
                    </div>
                </div>
            </CardComponent>
        </DialogComponent>
    </div>
</template>

<script setup lang="ts">
interface Suggestion {
    type:
        | "Player"
        | "Records"
        | "Spins"
        | "Player Leaderboard"
        | "Country Leaderboard"
        | "Map Leaderboard"
        | "Competition"
        | "Compare to";
    text: string;
    targetURL: string;
}

const router = useRouter();
const route = useRoute();

const qsOpen = ref(false);
const dialogVisible = ref(false);
const text = ref("");
const input = ref<HTMLInputElement | null>(null);
const allSuggestions = ref<Suggestion[]>([]);
const selectedSuggestion = ref(0);

const suggestions = computed<Suggestion[]>(() => {
    if (text.value.length === 0) {
        return [];
    }
    return allSuggestions.value
        .filter((suggestion) => {
            return suggestion.text
                .toLowerCase()
                .includes(text.value.toLowerCase());
        })
        .sort((a, b) => {
            return (
                a.text.toLowerCase().indexOf(text.value.toLowerCase()) -
                b.text.toLowerCase().indexOf(text.value.toLowerCase())
            );
        })
        .sort((a, b) => {
            if (a.text.toLowerCase() === text.value.toLowerCase()) {
                return -1;
            }
            if (b.text.toLowerCase() === text.value.toLowerCase()) {
                return 1;
            }
            return 0;
        })
        .slice(0, 6);
});

const suggestionPrefixText = computed(() => {
    const currentSuggestionText =
        suggestions.value[selectedSuggestion.value]?.text;
    if (currentSuggestionText == null) {
        return "";
    }

    const startingIndex = currentSuggestionText
        .toLowerCase()
        .indexOf(text.value.toLowerCase());
    return currentSuggestionText.substring(0, startingIndex);
});
const suggestionSuffixText = computed(() => {
    const currentSuggestionText =
        suggestions.value[selectedSuggestion.value]?.text;
    if (currentSuggestionText == null) {
        return "";
    }

    const startingIndex = currentSuggestionText
        .toLowerCase()
        .indexOf(text.value.toLowerCase());
    return currentSuggestionText.substring(startingIndex + text.value.length);
});

function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
        selectedSuggestion.value += 1;
        selectedSuggestion.value %= suggestions.value.length;
        event.preventDefault();
    }
    if (event.key === "ArrowUp") {
        if (selectedSuggestion.value <= 0) {
            selectedSuggestion.value = suggestions.value.length;
        }
        selectedSuggestion.value -= 1;
        selectedSuggestion.value %= suggestions.value.length;
        event.preventDefault();
    }
    if (event.key === "Enter" && suggestions.value.length > 0) {
        const currentSuggestion = suggestions.value[selectedSuggestion.value];
        confirmSelection(currentSuggestion);
        event.preventDefault();
    }
    if (event.key === "Escape") {
        dialogVisible.value = false;
        event.preventDefault();
    }
}

async function confirmSelection(suggestion: Suggestion) {
    if (suggestion?.targetURL != null) {
        await router.push(suggestion.targetURL);
        dialogVisible.value = false;
    }
}

function focus() {
    input.value?.focus();
    input.value?.setSelectionRange(0, null);
}

function dialogClosed() {
    text.value = "";
    qsOpen.value = false;
}

function open() {
    qsOpen.value = true;
    dialogVisible.value = true;
}

function onKeyboardKeyDown(ev: KeyboardEvent) {
    const openDialogs = useState<number>("openDialogs", () => 0);

    if (ev.key === "k" && ev.ctrlKey && openDialogs.value <= 0) {
        open();
        ev.preventDefault();
    }
}

watch(suggestions, () => {
    if (suggestions.value.length <= 0) {
        selectedSuggestion.value = 0;
    } else if (selectedSuggestion.value >= suggestions.value.length) {
        selectedSuggestion.value = suggestions.value.length - 1;
    }
});

async function buildSuggestions(routeName: string, playerName?: string) {
    const navigatorInfo = useNavigatorInfo();
    allSuggestions.value = [];

    allSuggestions.value.push(
        ...(await navigatorInfo.getPlayers()).map((player) => {
            return {
                type: "Player" as const,
                text: player.primaryName,
                targetURL: `/${player.primaryName}`,
            };
        }),
    );
    if (routeName === "player") {
        allSuggestions.value.push(
            ...(await navigatorInfo.getPlayers()).map((player) => {
                return {
                    type: "Compare to" as const,
                    text: player.primaryName,
                    targetURL: `/compare?leftPlayer=${playerName}&rightPlayer=${player.primaryName}`,
                };
            }),
        );
    }

    const filteredCompetitions = (await navigatorInfo.getCompetitions()).filter(
        (comp) => comp.officialCompetition,
    );

    allSuggestions.value.push(
        ...filteredCompetitions.map((comp) => {
            return {
                type: "Competition" as const,
                text: comp.name,
                targetURL: `/matches?tournament=${comp.tag}`,
            };
        }),
        ...filteredCompetitions.map((comp) => {
            return {
                type: "Competition" as const,
                text: comp.tag,
                targetURL: `/matches?tournament=${comp.tag}`,
            };
        }),
    );

    allSuggestions.value.push(
        ...(await navigatorInfo.getPlayerLeaderboards()).map((lb) => {
            return {
                type: "Player Leaderboard" as const,
                text: lb.name,
                targetURL: `/leaderboards#player.${lb.name}`,
            };
        }),
        ...(await navigatorInfo.getMapLeaderboards()).map((lb) => {
            return {
                type: "Map Leaderboard" as const,
                text: lb.name,
                targetURL: `/leaderboards#map.${lb.name}`,
            };
        }),
        ...(await navigatorInfo.getCountryLeaderboards()).map((lb) => {
            return {
                type: "Country Leaderboard" as const,
                text: lb.name,
                targetURL: `/leaderboards#country.${lb.name}`,
            };
        }),
    );

    allSuggestions.value.push(
        ...getAllMaps().map((map) => {
            return {
                type: "Spins" as const,
                text: getMap(map)!.name,
                targetURL: `/spins#${getMap(map)!.name}`,
            };
        }),
        ...getAllMaps().map((map) => {
            return {
                type: "Spins" as const,
                text: getMap(map)!.abbreviation,
                targetURL: `/spins#${getMap(map)!.name}`,
            };
        }),
        ...getAllMaps().map((map) => {
            return {
                type: "Records" as const,
                text: getMap(map)!.name,
                targetURL: "/records",
            };
        }),
        ...getAllMaps().map((map) => {
            return {
                type: "Records" as const,
                text: getMap(map)!.abbreviation,
                targetURL: "/records",
            };
        }),
    );
}

router.afterEach((to) =>
    buildSuggestions(to.name?.toString() ?? "", to.params.player as string),
);

onMounted(async () => {
    document.onkeydown = onKeyboardKeyDown;
    await buildSuggestions(
        route.name?.toString() ?? "",
        route.params.player as string,
    );
});
onBeforeUnmount(() => {
    document.onkeydown = null;
});
</script>
