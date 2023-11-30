<template>
    <MatchDetailsDialog
        v-if="matchToShow != null"
        @clickOutside="matchToShow = null"
        :match="matchToShow"
        :opponents="players"
    />

    <div class="w-4/5 mx-auto">
        <TextInputComponent
            class="w-full mb-4"
            placeholder="Search"
            v-model="searchFilter"
        />
    </div>
    <DataTableComponent
        :headers="headers"
        :rows="filteredSortedMatches"
        :enableSorting="false"
    >
        <template v-slot:round="{ value, row }">
            <TooltipComponent>
                {{ value }}

                <template #tooltip>
                    {{
                        DateTime.fromMillis(row.timestamp).setLocale(useLocale().value).toLocaleString(
                            DateTime.DATETIME_FULL,
                        )
                    }}
                </template>
            </TooltipComponent>
        </template>

        <template v-slot:playerOne="{ value }">
            {{ players[value as string] || `Unknown player (${value})` }}
        </template>

        <template v-slot:playerTwo="{ value }">
            {{ players[value as string] || `Unknown player (${value})` }}
        </template>

        <template v-slot:score="{ row }">
            <Tag :color="getMatchColor(row)">
                {{ row.playerOneScore }} - {{ row.playerTwoScore }}
            </Tag>
        </template>

        <template v-slot:playedMaps="{ value, row }">
            <TooltipComponent v-for="map of value">
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

        <template v-slot:more="{ row }">
            <ButtonComponent @click="matchToShow = row">
                <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
            </ButtonComponent>
        </template>
    </DataTableComponent>
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

const matchToShow: Ref<IMatch | null> = ref(null);
const searchFilter = ref("");

const props = defineProps({
    matches: {
        type: Object as PropType<IMatch[]>,
        required: false,
        default: [],
    },
    players: {
        type: Object as PropType<Record<string, string>>,
        required: false,
        default: {},
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

            return searchableValues.some((s) => s.includes(searchFilter.value));
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
