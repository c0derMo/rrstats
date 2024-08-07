<template>
    <CardComponent>
        <div class="text-center text-3xl mb-10">
            <span class="font-bold mr-10"
                >Estimated percentage of spins completed</span
            >
            <FontAwesomeIcon
                v-if="calculating"
                :icon="['fa', 'spinner']"
                class="h-full animate-spin"
            />
            <span v-else-if="percentageOfSpinsCompleted < 0" class="italic"
                >unknown</span
            >
            <template v-else>
                <span>{{ percentageOfSpinsCompleted.toFixed(4) }}%</span>
                <TooltipComponent class="ml-5 underline text-base">
                    <span class="italic">?</span>

                    <template #tooltip>
                        This is a rough estimate, since the list of allowed
                        spins changes each tournament.<br />
                        Old spins, which are no longer valid, may get counted
                        towards this percentage.<br />
                        Also, check the calculations for the estimated total
                        spins possible to see why this is so low.
                    </template>
                </TooltipComponent>
            </template>
        </div>
        <div class="grid grid-cols-4 gap-5 w-fit mx-auto">
            <span class="font-bold">Spins completed:</span>
            <span>{{ amountOfSpins }}</span>

            <span class="font-bold">Unique spins completed:</span>
            <FontAwesomeIcon
                v-if="calculating"
                :icon="['fa', 'spinner']"
                class="h-full animate-spin"
            />
            <span v-else>{{ uniqueSpinMap.size }}</span>

            <span class="font-bold">Estimated total spins possible:</span>
            <FontAwesomeIcon
                v-if="calculating"
                :icon="['fa', 'spinner']"
                class="h-full animate-spin"
            />
            <span
                v-else-if="amountOfPossibleSpinsFactors == null"
                class="italic"
                >unknown</span
            >
            <div v-else>
                <span>{{ amountOfPossibleSpins }}</span>
                <TooltipComponent class="ml-5 underline">
                    <span class="italic">?</span>

                    <template #tooltip>
                        Amount of disguise combinations:
                        {{ amountOfPossibleSpinsFactors.disguises }}<br />

                        Amount of NTKO combinations:
                        {{ amountOfPossibleSpinsFactors.ntkos }}<br />

                        Amount of method combinations:
                        {{ amountOfPossibleSpinsFactors.methods }}<br />

                        This currently allows for spins with multiple large
                        weapons and banned conditions.
                    </template>
                </TooltipComponent>
            </div>

            <span class="font-bold">Most repeated spin</span>
            <FontAwesomeIcon
                v-if="calculating"
                :icon="['fa', 'spinner']"
                class="h-full animate-spin"
            />
            <div v-else>
                <span>{{ mostRepeatedSpin.mostAmount }}x</span>
                <span v-if="mostRepeatedSpin.spins.length > 1">
                    ({{ mostRepeatedSpin.spins.length }} spins)</span
                >
                <template v-if="mostRepeatedSpin.spins.length <= 3">
                    <TextualSpin
                        v-for="(spin, idx) in mostRepeatedSpin.spins"
                        :key="idx"
                        :spin="spin"
                        class="mb-2"
                        show-map
                    />
                </template>
                <template v-if="mostRepeatedSpin.spins.length === 1">
                    Played by
                    <div
                        v-for="(match, idx) in mostRepeatedSpin.playedBy"
                        :key="idx"
                    >
                        {{ players[match.playerOne] }} and
                        {{ players[match.playerTwo] }} in
                        {{ match.competition }} {{ match.round }}
                    </div>
                </template>
            </div>

            <span class="font-bold">Quickest spin</span>
            <span>
                <template v-if="quickestSpin != null">
                    <TextualSpin :spin="quickestSpin.spin!" show-map />
                    in
                    {{
                        Duration.fromObject({
                            seconds: quickestSpin.timeTaken,
                        }).toFormat("mm:ss")
                    }}
                    by {{ getSpinWinner(quickestSpin) }} ({{
                        quickestSpin.match.competition
                    }}
                    {{ quickestSpin.match.round }} vs
                    {{ getSpinLoser(quickestSpin) }})
                </template>
            </span>

            <span class="font-bold">Slowest spin</span>
            <span>
                <template v-if="slowestSpin != null">
                    <TextualSpin :spin="slowestSpin.spin!" show-map />
                    in
                    {{
                        Duration.fromObject({
                            seconds: slowestSpin.timeTaken,
                        }).toFormat("mm:ss")
                    }}
                    by {{ getSpinWinner(slowestSpin) }} ({{
                        slowestSpin.match.competition
                    }}
                    {{ slowestSpin.match.round }} vs
                    {{ getSpinLoser(slowestSpin) }})
                </template>
            </span>
        </div>
    </CardComponent>
</template>

<script setup lang="ts">
import { DateTime, Duration } from "luxon";
import {
    type IPlayedMap,
    type Spin,
    WinningPlayer,
} from "~/utils/interfaces/IMatch";
import objectHash from "object-hash";

const props = defineProps({
    spins: {
        type: Array<IPlayedMap>,
        required: true,
    },
    players: {
        type: Object as PropType<Record<string, string>>,
        required: true,
    },
    disguises: {
        type: Array<string>,
        required: false,
        default: [],
    },
    killMethods: {
        type: Object as PropType<Record<string, string[]>>,
        required: false,
        default: () => ({}),
    },
});

const uniqueSpinMap = ref(
    new Map<
        string,
        { count: number; originalSpin: Spin; playedBy: SmallerMatch[] }
    >(),
);
const amountOfPossibleSpinsFactors: Ref<{
    disguises: number;
    methods: number;
    ntkos: number;
} | null> = ref(null);
const calculating = ref(true);

const nonNullSpins = computed(() => {
    return props.spins.filter((spin) => spin.spin != null);
});

const amountOfSpins = computed(() => {
    return nonNullSpins.value.length;
});

const mostRepeatedSpin = computed(() => {
    let mostAmount = 0;
    let spin: Spin[] = [];
    let playedBy: SmallerMatch[] = [];

    for (const uniqueSpin of uniqueSpinMap.value.values()) {
        if (uniqueSpin.count > mostAmount) {
            mostAmount = uniqueSpin.count;
            spin = [uniqueSpin.originalSpin];
            playedBy = uniqueSpin.playedBy;
        } else if (uniqueSpin.count === mostAmount) {
            spin.push(uniqueSpin.originalSpin);
        }
    }

    return {
        mostAmount,
        spins: spin,
        playedBy,
    };
});

const quickestSpin = computed(() => {
    let currentlyQuickestSpin: IPlayedMap | null = null;

    for (const spin of nonNullSpins.value) {
        if (
            spin.timeTaken > 0 &&
            (currentlyQuickestSpin == null ||
                currentlyQuickestSpin.timeTaken > spin.timeTaken)
        ) {
            currentlyQuickestSpin = spin;
        }
    }

    return currentlyQuickestSpin;
});

const slowestSpin = computed(() => {
    let currentlySlowestSpin: IPlayedMap | null = null;

    for (const spin of nonNullSpins.value) {
        if (
            spin.timeTaken > 0 &&
            (currentlySlowestSpin == null ||
                currentlySlowestSpin.timeTaken < spin.timeTaken)
        ) {
            currentlySlowestSpin = spin;
        }
    }

    return currentlySlowestSpin;
});

const amountOfPossibleSpins = computed(() => {
    if (amountOfPossibleSpinsFactors.value == null) {
        return -1;
    }
    return (
        amountOfPossibleSpinsFactors.value.disguises *
        amountOfPossibleSpinsFactors.value.methods *
        amountOfPossibleSpinsFactors.value.ntkos
    );
});

const percentageOfSpinsCompleted = computed(() => {
    if (calculating.value) {
        return -1;
    }
    if (amountOfPossibleSpins.value <= 0) {
        return -1;
    }
    const percentage = uniqueSpinMap.value.size / amountOfPossibleSpins.value;

    return percentage;
});

function getSpinWinner(spin: IPlayedMap): string {
    if (spin.winner === WinningPlayer.PLAYER_ONE) {
        return props.players[spin.match.playerOne];
    } else if (spin.winner === WinningPlayer.PLAYER_TWO) {
        return props.players[spin.match.playerTwo];
    }
    return `Draw`;
}

function getSpinLoser(spin: IPlayedMap): string {
    if (spin.winner === WinningPlayer.PLAYER_ONE) {
        return props.players[spin.match.playerTwo];
    } else if (spin.winner === WinningPlayer.PLAYER_TWO) {
        return props.players[spin.match.playerOne];
    }
    return `(${props.players[spin.match.playerOne]}, ${
        props.players[spin.match.playerTwo]
    })`;
}

interface SmallerMatch {
    playerOne: string;
    playerTwo: string;
    competition: string;
    timestamp: number;
    round: string;
    platform?: string;
}

function calculateUniqueSpins() {
    const uniqueSpins = new Map<
        string,
        { count: number; originalSpin: Spin; playedBy: SmallerMatch[] }
    >();
    const flattenedSpins = nonNullSpins.value.map((spin) =>
        flattenSpin(spin.spin!),
    );

    for (let i = 0; i < nonNullSpins.value.length; i++) {
        const spin = flattenedSpins[i];
        const hash = objectHash(spin);

        let count = 0;
        let originalSpin = nonNullSpins.value[i].spin!;
        let playedIn = [nonNullSpins.value[i].match];
        if (uniqueSpins.has(hash)) {
            const mapObject = uniqueSpins.get(hash)!;
            count = mapObject.count;
            originalSpin = mapObject.originalSpin;
            playedIn = [...mapObject.playedBy, ...playedIn];
        }
        count += 1;
        uniqueSpins.set(hash, { count, originalSpin, playedBy: playedIn });
    }

    uniqueSpinMap.value = uniqueSpins;
}

function nonblockingUniqueCalculation() {
    calculating.value = true;
    setTimeout(() => {
        console.log("Starting onMounted");
        const startTime = DateTime.now();
        calculateUniqueSpins();
        const endTime = DateTime.now();
        console.log(
            `Unique spin calculation took ${endTime.diff(startTime).toHuman()}`,
        );

        amountOfPossibleSpinsFactors.value = calculatePossibleSpinAmount(
            props.disguises as string[],
            props.killMethods,
        );

        calculating.value = false;
    }, 0); // Make this code non-blocking
}

onMounted(nonblockingUniqueCalculation);
onUpdated(nonblockingUniqueCalculation);

interface FlattenedSpin {
    map: string;
    targets: Record<
        string,
        { disguise: string; method: string; complications: string[] }
    >;
    additionalObjectives: Record<string, { disguise: string; method: string }>;
}

function flattenSpin(spin: Spin): FlattenedSpin {
    const result = {
        map: spin.mission.slug,
        targets: {},
        additionalObjectives: {},
    } as FlattenedSpin;

    for (const target of spin.targetConditions) {
        result.targets[target.target.name] = {
            disguise: target.disguise.name,
            method:
                target.killMethod.selectedVariant != null &&
                target.killMethod.selectedVariant !== ""
                    ? `${target.killMethod.selectedVariant} ${target.killMethod.name}`
                    : target.killMethod.name,
            complications: target.complications.map(
                (complication) => complication.name,
            ),
        };
    }

    for (const additional of spin.additionalObjectives) {
        result.additionalObjectives[additional.objective.name] = {
            disguise: additional.disguise.name,
            method: additional.completionMethod.name,
        };
    }

    return result;
}
</script>
