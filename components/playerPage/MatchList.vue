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
            
            <template #score="{ row }">
                {{ row.playerOneScore }}<br />
                -<br />
                {{ row.playerTwoScore }}<br />
            </template>

            <template #players="{ row }">
                {{ row.playerOneScore }} - {{ players[row.playerOne] || `Unknown player (${row.playerOne})` }}<br />
                vs<br />
                {{ row.playerTwoScore }} - {{ players[row.playerTwo] || `Unknown player (${row.playerTwo})` }}<br />
                <Tag v-for="(map, idx) of row.playedMaps" :key="idx" :color="getMapColor(map, row)">
                    {{ getMap((map as RRMap).map)?.abbreviation }}
                </Tag>
            </template>

            <template #more="{ row }">
                <ButtonComponent @click="matchToShow = row">
                    <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
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
                {{ players[value as string] || `Unknown player (${value})` }}
            </template>
    
            <template #playerTwo="{ value }">
                {{ players[value as string] || `Unknown player (${value})` }}
            </template>
    
            <template #score="{ row }">
                <Tag :color="getMatchColor(row)">
                    {{ row.playerOneScore }} - {{ row.playerTwoScore }}
                </Tag>
            </template>
    
            <template #playedMaps="{ value, row }">
                <TooltipComponent v-for="(map, idx) of value" :key="idx">
                    <Tag :color="getMapColor(map, row)" class="ml-2">
                        {{ getMap((map as RRMap).map)?.abbreviation }}
                    </Tag>
    
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
            </template>
        </DataTableComponent>
    </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
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

            return searchableValues.some((s) => s.toLowerCase().includes(searchFilter.value.toLowerCase()));
        })
        .sort((a, b) => b.timestamp - a.timestamp);
});

function getMapColor(map: RRMap, match: IMatch): string {
    if (map.winner === WinningPlayer.DRAW) {
        return "#d0c033";
    } else if (
        (match.playerOne === props.localPlayer &&
            map.winner === WinningPlayer.PLAYER_ONE) ||
        (match.playerTwo === props.localPlayer &&
            map.winner === WinningPlayer.PLAYER_TWO)
    ) {
        return "#4caf50";
    } else {
        return "#f44336";
    }
}

function getMatchColor(match: IMatch): string {
    if (match.playerOneScore === match.playerTwoScore) {
        return "#d0c033";
    } else if (
        (match.playerOneScore > match.playerTwoScore &&
            match.playerOne === props.localPlayer) ||
        (match.playerTwoScore > match.playerOneScore &&
            match.playerTwo === props.localPlayer)
    ) {
        return "#4caf50";
    } else {
        return "#f44336";
    }
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
</script>
