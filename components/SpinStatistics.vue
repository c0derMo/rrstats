<template>
    <CardComponent>
        <FontAwesomeIcon
            v-if="loading"
            :icon="['fa', 'spinner']"
            class="animate-spin text-5xl m-auto w-full h-full"
        />
        <template v-else>
            <div class="text-center text-3xl mb-10">
                <span class="font-bold mr-10"
                    >Estimated percentage of spins completed</span
                >
                <span v-if="percentageOfSpinsCompleted < 0" class="italic"
                    >unknown</span
                >
                <template v-else>
                    <span>{{ percentageOfSpinsCompleted.toFixed(4) }}%</span>
                    <TooltipComponent class="ml-5 underline text-base">
                        <span class="italic">?</span>

                        <template #tooltip>
                            This is a rough estimate, since the list of allowed
                            spins changes each tournament.<br />
                            Old spins, which are no longer valid, may get
                            counted towards this percentage.<br />
                            Also, check the calculations for the estimated total
                            spins possible to see why this is so low.
                        </template>
                    </TooltipComponent>
                </template>
            </div>
            <div class="grid grid-cols-4 gap-5 w-fit mx-auto">
                <span class="font-bold">Spins completed:</span>
                <span>{{ data.total }}</span>

                <span class="font-bold">Unique spins completed:</span>
                <span>{{ data.uniqueSpins }}</span>

                <span class="font-bold">Estimated total spins possible:</span>
                <span v-if="data.possibleSpinFactors == null" class="italic"
                    >unknown</span
                >
                <div v-else>
                    <span>{{ amountOfPossibleSpins }}</span>
                    <TooltipComponent class="ml-5 underline">
                        <span class="italic">?</span>

                        <template #tooltip>
                            Amount of disguise combinations:
                            {{ data.possibleSpinFactors.disguises }}<br />

                            Amount of NTKO combinations:
                            {{ data.possibleSpinFactors.ntkos }}<br />

                            Amount of method combinations:
                            {{ data.possibleSpinFactors.methods }}<br />

                            This currently allows for spins with multiple large
                            weapons and banned conditions.
                        </template>
                    </TooltipComponent>
                </div>

                <span class="font-bold">Most repeated spin</span>
                <div>
                    <span>{{ data.mostRepeated.count }}x</span>
                    <span v-if="data.mostRepeated.spins.length > 1">
                        ({{ data.mostRepeated.spins.length }} spins)</span
                    >
                    <template v-if="data.mostRepeated.spins.length <= 3">
                        <TextualSpin
                            v-for="(spin, idx) in data.mostRepeated.spins"
                            :key="idx"
                            :spin="spin[0].spin!"
                            class="mb-2"
                            show-map
                        />
                    </template>
                    <template v-if="data.mostRepeated.spins.length === 1">
                        Played by
                        <div
                            v-for="(spin, idx) in data.mostRepeated.spins[0]"
                            :key="idx"
                        >
                            {{ players.get(spin.match.playerOne) }} and
                            {{ players.get(spin.match.playerTwo) }} in
                            {{ spin.match.competition }} {{ spin.match.round }}
                        </div>
                    </template>
                </div>

                <span class="font-bold">Average spin time:</span>
                <span>{{ secondsToTime(data.average) }}</span>

                <span class="font-bold"
                    >Average spin time in the last year:</span
                >
                <span>{{ secondsToTime(data.averageLastYear) }}</span>

                <span class="font-bold">Quickest spin</span>
                <span>
                    <template v-if="data.quickest.length != 0">
                        <TextualSpin
                            v-for="(spin, idx) in data.quickest"
                            :key="idx"
                            :spin="spin.spin!"
                            show-map
                        />
                        in
                        {{
                            Duration.fromObject({
                                seconds: data.quickest[0].timeTaken,
                            }).toFormat("mm:ss")
                        }}
                        by
                        <div v-for="(spin, idx) in data.quickest" :key="idx">
                            {{ getSpinWinner(spin) }} ({{
                                spin.match.competition
                            }}
                            {{ spin.match.round }} vs {{ getSpinLoser(spin) }})
                        </div>
                    </template>
                </span>

                <span class="font-bold">Slowest spin</span>
                <span>
                    <template v-if="data.slowest.length != 0">
                        <TextualSpin
                            v-for="(spin, idx) in data.slowest"
                            :key="idx"
                            :spin="spin.spin!"
                            show-map
                        />
                        in
                        {{
                            Duration.fromObject({
                                seconds: data.slowest[0].timeTaken,
                            }).toFormat("mm:ss")
                        }}
                        by
                        <div v-for="(spin, idx) in data.slowest" :key="idx">
                            {{ getSpinWinner(spin) }} ({{
                                spin.match.competition
                            }}
                            {{ spin.match.round }} vs {{ getSpinLoser(spin) }})
                        </div>
                    </template>
                </span>
            </div>
        </template>
    </CardComponent>
</template>

<script setup lang="ts">
import { Duration } from "luxon";
import { type IPlayedMap, WinningPlayer } from "~/utils/interfaces/IMatch";

const props = defineProps<{
    map: number;
}>();

const loading = ref(true);
const players = usePlayers();

await players.queryAll();

const data = ref({
    total: 0,
    uniqueSpins: 0,
    quickest: [] as IPlayedMap[],
    slowest: [] as IPlayedMap[],
    average: 0,
    averageLastYear: 0,
    possibleSpinFactors: null as {
        disguises: number;
        ntkos: number;
        methods: number;
    } | null,
    mostRepeated: {
        count: 0,
        spins: [] as IPlayedMap[][],
    },
});

const amountOfPossibleSpins = computed(() => {
    if (data.value.possibleSpinFactors == null) {
        return -1;
    }
    return (
        data.value.possibleSpinFactors.disguises *
        data.value.possibleSpinFactors.methods *
        data.value.possibleSpinFactors.ntkos
    );
});

const percentageOfSpinsCompleted = computed(() => {
    if (amountOfPossibleSpins.value <= 0) {
        return -1;
    }
    const percentage = data.value.uniqueSpins / amountOfPossibleSpins.value;

    return percentage * 100;
});

function getSpinWinner(spin: IPlayedMap): string {
    if (spin.winner === WinningPlayer.PLAYER_ONE) {
        return players.get(spin.match.playerOne);
    } else if (spin.winner === WinningPlayer.PLAYER_TWO) {
        return players.get(spin.match.playerTwo);
    }
    return `Draw`;
}

function getSpinLoser(spin: IPlayedMap): string {
    if (spin.winner === WinningPlayer.PLAYER_ONE) {
        return players.get(spin.match.playerTwo);
    } else if (spin.winner === WinningPlayer.PLAYER_TWO) {
        return players.get(spin.match.playerOne);
    }
    return `(${players.get(spin.match.playerOne)}, ${players.get(
        spin.match.playerTwo,
    )})`;
}

async function update() {
    loading.value = true;
    data.value = await $fetch("/api/spins/stats", {
        query: { map: props.map },
    });
    loading.value = false;
}

onMounted(async () => {
    await update();
});
onUpdated(async () => {
    await update();
});
</script>
