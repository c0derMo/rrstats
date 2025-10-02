<template>
    <MatchDetailsDialog
        v-if="detailedMatch != null"
        :match="detailedMatch"
        @click-outside="detailedMatch = null"
    />
    <RecordHistoryDialog
        v-if="historyMap != null"
        :map="historyMap"
        @closed="historyMap = null"
    />

    <TableComponent
        :headers="headers"
        :rows="sortedRecords"
        @click-row="(row) => setHash(`#${getMap(row.map)!.name}`)"
    >
        <template #map="{ value }">
            <MapTag
                :id="normalizeName(getMap(value)!.name)"
                :map="getMap(value)!"
                full-name
            />
        </template>

        <template #spin="{ row }">
            <TextualSpin
                :spin="matches[row.match]?.playedMaps[row.mapIndex]?.spin"
            />
        </template>

        <template #time="{ value }">
            {{ secondsToTime(value) }}
        </template>

        <template #player="{ value }">
            <PlayerLinkTag :player="players.get(value)" />
        </template>

        <template #match="{ row, value }">
            <a
                v-if="matches[value] != null"
                :href="
                    matches[value].vodLink != null
                        ? matches[value].vodLink![0]
                        : ''
                "
                :class="{
                    'underline text-blue-500': matches[value].vodLink != null,
                }"
            >
                {{ matches[value].competition }}
                {{ matches[value].round }}
                <span v-if="matches[value].playerOne === row.player"
                    >vs {{ players.get(matches[value].playerTwo) }}</span
                >
                <span v-if="matches[value].playerTwo === row.player"
                    >vs {{ players.get(matches[value].playerOne) }}</span
                >
            </a>
        </template>

        <template #more="{ row }">
            <div class="flex flex-nowrap">
                <ButtonComponent @click="historyMap = row.map">
                    <FontAwesomeIcon :icon="['fas', 'chart-line']" size="xs" />
                </ButtonComponent>
                <ButtonComponent @click="detailedMatch = matches[row.match]">
                    <FontAwesomeIcon :icon="['fas', 'ellipsis-h']" size="xs" />
                </ButtonComponent>
            </div>
        </template>
    </TableComponent>
</template>

<script setup lang="ts">
const headers = [
    { title: "Map", key: "map" },
    { title: "Spin", key: "spin" },
    { title: "Time", key: "time" },
    { title: "Player", key: "player" },
    { title: "Match", key: "match" },
    { title: "", key: "more" },
];

const detailedMatch: Ref<IMatch | null> = ref(null);
const historyMap: Ref<number | null> = ref(null);

const props = withDefaults(
    defineProps<{
        records: IMapRecord[];
        matches?: Record<string, IMatch>;
    }>(),
    {
        players: () => ({}),
        matches: () => ({}),
    },
);

const players = usePlayers();
await players.queryFromMatches(Object.values(props.matches));

const setHash = useHash((hash: string[]) => {
    const record = props.records.find((rec) => {
        return `#${getMap(rec.map)!.name}` === hash[0];
    });
    if (record != null) {
        const element = document.querySelector(
            `#${normalizeName(getMap(record.map)!.name)}`,
        );
        if (element != null) {
            window.scrollTo({
                top: Math.max(
                    0,
                    window.scrollY + element.getBoundingClientRect().y - 15,
                ),
                left: window.scrollX + element.getBoundingClientRect().x,
                behavior: "smooth",
            });
        }
    }
});

const sortedRecords = computed(() => {
    return [...props.records].sort(
        (a, b) =>
            getAllMaps().findIndex((m) => a.map === m) -
            getAllMaps().findIndex((m) => b.map === m),
    );
});
</script>
