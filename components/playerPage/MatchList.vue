<template>
    <MatchDetailsDialog
        v-if="matchToShow != null"
        :match="matchToShow"
        :opponents="players"
        @click-outside="matchToShow = null"
    />

    <div class="w-4/5 mx-auto">
        <TextInputComponent
            v-model="searchFilter"
            class="w-full mb-4"
            placeholder="Search"
        />
    </div>

    <!-- Mobile table -->
    <div class="lg:hidden">
        <DataTableComponent
            :headers="mobileHeaders"
            :rows="filteredSortedMatches"
            :enable-sorting="false"
        >
            <template #competition="{ row }">
                <TooltipComponent>
                    {{ row.competition }}<br />
                    {{ row.round }}

                    <template #tooltip>
                        {{
                            DateTime.fromMillis(row.timestamp)
                                .setLocale(useLocale().value)
                                .toLocaleString(DateTime.DATETIME_FULL)
                        }}
                    </template>
                </TooltipComponent>
            </template>

            <template #players="{ row }">
                <a :href="`/${players[row.playerOne]}`">
                    {{ row.playerOneScore }} -
                    {{
                        players[row.playerOne] ||
                        `Unknown player (${row.playerOne})`
                    }}</a
                ><br />
                vs<br />
                <a :href="`/${players[row.playerOne]}`">
                    {{ row.playerTwoScore }} -
                    {{
                        players[row.playerTwo] ||
                        `Unknown player (${row.playerTwo})`
                    }}
                </a>
            </template>

            <template #after-row="{ row }">
                <MapTag
                    v-for="(map, idx) of row.playedMaps"
                    :key="idx"
                    :map="getMap(map.map)!"
                    :draw="map.winner === WinningPlayer.DRAW"
                    :won="getLocalWinningPlayer(row) === map.winner"
                />
            </template>

            <template #more="{ row }">
                <ButtonComponent @click="matchToShow = row">
                    <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
                </ButtonComponent>
                <ButtonComponent
                    v-if="row.vodLink != null && row.vodLink.length > 0"
                    @click="redirectTo(row.vodLink[0])"
                >
                    <FontAwesomeIcon :icon="['fas', 'video']" size="xs" />
                </ButtonComponent>
            </template>
        </DataTableComponent>
    </div>

    <!-- Full screen table -->
    <div class="hidden lg:block">
        <DataTableComponent
            :headers="headers"
            :rows="filteredSortedMatches"
            :enable-sorting="false"
        >
            <template #round="{ value, row }">
                <TooltipComponent>
                    {{ value }}

                    <template #tooltip>
                        {{
                            DateTime.fromMillis(row.timestamp)
                                .setLocale(useLocale().value)
                                .toLocaleString(DateTime.DATETIME_FULL)
                        }}
                    </template>
                </TooltipComponent>
            </template>

            <template #playerOne="{ value }">
                <PlayerLinkTag
                    :player="
                        players[value as string] ?? `Unknown player: ${value}`
                    "
                />
            </template>

            <template #playerTwo="{ value }">
                <PlayerLinkTag
                    :player="
                        players[value as string] ?? `Unknown player: ${value}`
                    "
                />
            </template>

            <template #score="{ row }">
                <MatchScoreTag
                    :left="row.playerOneScore"
                    :right="row.playerTwoScore"
                    :player-index="getLocalWinningPlayer(row)"
                />
            </template>

            <template #playedMaps="{ value, row }">
                <TooltipComponent v-for="(map, idx) of value" :key="idx">
                    <MapTag
                        :map="getMap((map as RRMap).map)!"
                        :draw="(map as RRMap).winner === WinningPlayer.DRAW"
                        :won="
                            getLocalWinningPlayer(row) === (map as RRMap).winner
                        "
                        class="ml-2"
                    />

                    <template #tooltip>
                        Map: {{ getMap((map as RRMap).map)?.name }}<br />
                        Picked by: {{ getMapPicker(map, row) }}<br />
                        Won by: {{ getMapWinner(map, row) }}
                    </template>
                </TooltipComponent>
            </template>

            <template #more="{ row }">
                <ButtonComponent @click="matchToShow = row">
                    <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
                </ButtonComponent>
                <ButtonComponent
                    v-if="row.vodLink != null && row.vodLink.length > 0"
                    @click="redirectTo(row.vodLink[0])"
                >
                    <FontAwesomeIcon :icon="['fas', 'video']" size="xs" />
                </ButtonComponent>
            </template>
        </DataTableComponent>
    </div>
</template>

<script setup lang="ts">
import {
    ChoosingPlayer,
    IMatch,
    RRMap,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";
import { DateTime } from "luxon";

const headers = [
    { title: "Competition", key: "competition" },
    { title: "", key: "round" },
    { title: "Player 1", key: "playerOne" },
    { title: "Score", key: "score" },
    { title: "Player 2", key: "playerTwo" },
    { title: "Maps", key: "playedMaps" },
    { title: "", key: "more" },
];

const mobileHeaders = [
    { title: "Competition", key: "competition" },
    { title: "Players", key: "players" },
    { title: "", key: "more" },
];

const matchToShow: Ref<IMatch | null> = ref(null);
const searchFilter = ref("");

const props = defineProps({
    matches: {
        type: Array<IMatch>,
        required: false,
        default: [],
    },
    players: {
        type: Object as PropType<Record<string, string>>,
        required: false,
        default: () => {},
    },
    localPlayer: {
        type: String,
        required: true,
    },
});

const filteredSortedMatches = computed(() => {
    return props.matches
        .filter((m) => {
            if (searchFilter.value === "") return true;

            const searchableValues = [
                m.competition,
                props.players[m.playerOne],
                props.players[m.playerTwo],
                m.round,
                ...m.playedMaps.map((map) => getMap(map.map)!.abbreviation),
            ];

            return searchableValues.some((s) =>
                s.toLowerCase().includes(searchFilter.value.toLowerCase()),
            );
        })
        .sort((a, b) => b.timestamp - a.timestamp);
});

function getLocalWinningPlayer(match: IMatch): WinningPlayer {
    if (match.playerOne === props.localPlayer) return WinningPlayer.PLAYER_ONE;
    if (match.playerTwo === props.localPlayer) return WinningPlayer.PLAYER_TWO;
    return WinningPlayer.DRAW;
}

function getMapPicker(map: RRMap, match: IMatch): string {
    if (map.picked === ChoosingPlayer.RANDOM) return "Random";
    if (map.picked === ChoosingPlayer.PLAYER_ONE)
        return props.players[match.playerOne];
    if (map.picked === ChoosingPlayer.PLAYER_TWO)
        return props.players[match.playerTwo];
    return "Unknown";
}

function getMapWinner(map: RRMap, match: IMatch): string {
    if (map.winner === WinningPlayer.DRAW) return "Draw";
    if (map.winner === WinningPlayer.PLAYER_ONE)
        return props.players[match.playerOne];
    if (map.winner === WinningPlayer.PLAYER_TWO)
        return props.players[match.playerTwo];
    return "Unknown";
}

async function redirectTo(link: string) {
    await navigateTo(link, { open: { target: '_blank' } });
}
</script>
