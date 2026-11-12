<template>
    <MatchDetailsDialog
        v-if="matchToShow != null"
        :match="matchToShow"
        @click-outside="matchToShow = null"
    />
    <DownloadPlayerCSVDialog
        v-if="showDownload"
        :player="localPlayer"
        @closed="showDownload = false"
    />

    <div class="w-4/5 mx-auto flex flex-col gap-1 mb-4">
        <MatchFilter
            :matches="props.matches"
            :local-player="localPlayer"
            @filtered-matches="(f) => (filteredMatches = f)"
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
                <a :href="`/${players.get(row.playerOne)}`">
                    {{ row.playerOneScore }} -
                    {{ players.get(row.playerOne) }}
                </a>
                <br />
                vs
                <br />
                <a :href="`/${players.get(row.playerOne)}`">
                    {{ row.playerTwoScore }} -
                    {{ players.get(row.playerTwo) }}
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
            <template #header-more>
                <ButtonComponent @click="showDownload = true">
                    <FontAwesomeIcon :icon="['fas', 'download']" size="xs" />
                </ButtonComponent>
            </template>

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
                <PlayerLinkTag :player="players.get(value)" />
            </template>

            <template #playerTwo="{ value }">
                <PlayerLinkTag :player="players.get(value)" />
            </template>

            <template #score="{ row }">
                <MatchScoreTag
                    :left="row.playerOneScore"
                    :right="row.playerTwoScore"
                    :player-index="getLocalWinningPlayer(row)"
                />
            </template>

            <template
                #playedMaps="{ value, row }: { value: RRMap[]; row: IMatch }"
            >
                <MatchMapsTooltip
                    :maps="value"
                    :players="[row.playerOne, row.playerTwo]"
                    :score="[row.playerOneScore, row.playerTwoScore]"
                >
                    <MapTag
                        v-for="(map, idx) in value"
                        :key="idx"
                        :map="getMap(map.map)!"
                        :won="map.winner === getLocalWinningPlayer(row)"
                        :draw="map.winner === WinningPlayer.DRAW"
                    />
                </MatchMapsTooltip>
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
const showDownload = ref(false);

const props = withDefaults(
    defineProps<{
        matches?: IMatch[];
        localPlayer: string;
    }>(),
    {
        matches: () => [],
    },
);

const players = usePlayers();
await players.queryFromMatches(props.matches);

const filteredMatches = ref(props.matches);

const filteredSortedMatches = computed(() => {
    return filteredMatches.value.toSorted((a, b) => b.timestamp - a.timestamp);
});

function getLocalWinningPlayer(match: IMatch): WinningPlayer {
    if (match.playerOne === props.localPlayer) return WinningPlayer.PLAYER_ONE;
    if (match.playerTwo === props.localPlayer) return WinningPlayer.PLAYER_TWO;
    return WinningPlayer.DRAW;
}

async function redirectTo(link: string) {
    await navigateTo(link, { open: { target: "_blank" } });
}
</script>
