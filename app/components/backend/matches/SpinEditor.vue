<template>
    <div>
        <div v-if="finishedLoading" class="grid grid-cols-5 gap-2">
            <template v-for="(target, idx) of targets" :key="idx">
                <span class="font-bold">{{ target.name }}</span>
                <SwitchComponent
                    :id="`ntko-${idx}`"
                    label="NTKO"
                    :model-value="hasNTKO[idx]"
                    @update:model-value="(v) => setNTKO(idx, v)"
                />
                <DropdownComponent
                    :model-value="selectedVariant[idx] ?? ''"
                    :items="selectableVariants[idx]"
                    @update:model-value="(v) => selectVariant(idx, v as string)"
                />
                <AutocompleteComponent
                    :default-text="selectedConditions[idx]"
                    :suggestions="suggestableConditions[idx]"
                    @confirm="(v) => selectCondition(idx, v)"
                />
                <AutocompleteComponent
                    :default-text="selectedDisguises[idx]"
                    :suggestions="suggestableDisguises"
                    @confirm="(v) => selectDisguise(idx, v)"
                />
            </template>
        </div>
        <div v-else class="grid place-items-center">
            <FontAwesomeIcon :icon="['fas', 'spinner']" class="animate-spin" />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        map: number;
        spin?: Spin | null;
    }>(),
    {
        spin: null,
    },
);
const emits = defineEmits<{
    updateSpin: [value: Spin];
}>();

const finishedLoading = ref(false);
const targets: Ref<{ name: string; tileUrl: string }[]> = ref([]);
const killConditions: Ref<
    {
        name: string;
        image: string;
        variants: { name: string; image?: string }[];
    }[][]
> = ref([]);
const disguises: Ref<{ name: string; image: string }[]> = ref([]);
const spin: Ref<Spin> = ref(props.spin ?? buildEmptySpin());
const hasNTKO: Ref<boolean[]> = ref([]);

const selectedConditions = computed(() => {
    return spin.value.targetConditions.map((condition) => {
        return condition.killMethod.name;
    });
});
const selectedDisguises = computed(() => {
    return spin.value.targetConditions.map((disguise) => {
        return disguise.disguise.name;
    });
});
const selectedVariant = computed(() => {
    return spin.value.targetConditions.map((condition) => {
        return condition.killMethod.selectedVariant;
    });
});

const suggestableConditions = computed(() => {
    return killConditions.value.map((target) => {
        return target.map((condition) => {
            return condition.name;
        });
    });
});
const suggestableDisguises = computed(() => {
    return disguises.value.map((disguise) => {
        return disguise.name;
    });
});
const selectableVariants = computed(() => {
    return killConditions.value.map((target, idx) => {
        const selectedCondition = target.find(
            (condition) => condition.name === selectedConditions.value[idx],
        );
        if (selectedCondition == null) return [];
        return selectedCondition.variants
            .map((variant) => variant.name)
            .concat("");
    });
});

function selectDisguise(targetIdx: number, disguiseName: string) {
    const actualDisguise = disguises.value.find((disguise) => {
        return disguise.name === disguiseName;
    });
    if (actualDisguise == null) return;

    spin.value.targetConditions[targetIdx].disguise = {
        name: actualDisguise.name,
        tileUrl: actualDisguise.image,
    };
    checkAndEmit();
}

function selectCondition(targetIdx: number, conditionName: string) {
    const actualCondition = killConditions.value[targetIdx].find(
        (condition) => {
            return condition.name === conditionName;
        },
    );
    if (actualCondition == null) return;

    spin.value.targetConditions[targetIdx].killMethod = {
        name: actualCondition.name,
        tileUrl: actualCondition.image,
        selectedVariant: "",
    };
    checkAndEmit();
}

function selectVariant(targetIdx: number, variantName: string) {
    const condition = killConditions.value[targetIdx].find((condition) => {
        return condition.name === selectedConditions.value[targetIdx];
    });
    if (condition == null) return;

    if (variantName === "") {
        spin.value.targetConditions[targetIdx].killMethod.selectedVariant =
            null;
        spin.value.targetConditions[targetIdx].killMethod.tileUrl =
            condition.image;
    }

    const actualVariant = condition.variants.find((variant) => {
        return variant.name === variantName;
    });
    if (actualVariant == null) return;

    spin.value.targetConditions[targetIdx].killMethod.selectedVariant =
        actualVariant.name;
    if (actualVariant.image != null) {
        spin.value.targetConditions[targetIdx].killMethod.tileUrl =
            actualVariant.image;
    }
    checkAndEmit();
}

function setNTKO(targetIdx: number, hasNTKO: boolean) {
    if (hasNTKO) {
        spin.value.targetConditions[targetIdx].complications = [
            {
                name: "No Target Pacification",
                description:
                    "If you pacify or subdue the target in any way, you immediately fail the spin.",
                tileUrl:
                    "https://media.hitmaps.com/img/hitman3/contracts/gamechangers/gamechanger_global_nopacifications.jpg",
            },
        ];
    } else {
        spin.value.targetConditions[targetIdx].complications = [];
    }

    checkAndEmit();
}

function buildEmptySpin(): Spin {
    return {
        mission: {
            publicIdPrefix: -1,
            slug: getMap(props.map)!.slug,
            targets: targets.value,
        },
        targetConditions: targets.value.map((target) => {
            return {
                target,
                complications: [] as {
                    name: string;
                    description: string;
                    tileUrl: string;
                }[],
                disguise: {
                    name: "",
                    tileUrl: "",
                },
                killMethod: {
                    name: "",
                    tileUrl: "",
                    selectedVariant: null,
                },
            };
        }),
        additionalObjectives: [],
    };
}

function checkAndEmit() {
    for (const target of spin.value.targetConditions) {
        if (target.disguise.name === "" || target.killMethod.name === "") {
            return;
        }
    }

    emits("updateSpin", spin.value);
}

interface HitmapsKillCondition {
    name: string;
    largeWeapon: boolean;
    tileUrl: string;
    variants: {
        name: string;
        largeWeapon: boolean;
        imageOverride: string | null;
    }[];
    remote: boolean;
}

interface HitmapsDisguise {
    id: number;
    name: string;
    image: string;
    order: number;
    suit: boolean;
}

async function getDisguises(): Promise<{ name: string; image: string }[]> {
    const map = getMap(props.map)!;
    try {
        const request = await $fetch<{ disguises: HitmapsDisguise[] }>(
            `https://api.hitmaps.com/api/games/hitman${
                map.season > 1 ? map.season : ""
            }/locations/${map.name
                .toLowerCase()
                .replace(/\s/g, "-")
                .replace(/à/g, "a")}/missions/${map.slug}/disguises`,
        );
        return request.disguises.map((disguise) => {
            return {
                name: disguise.suit ? "Suit" : disguise.name,
                image: disguise.image,
            };
        });
    } catch {
        return [];
    }
}

async function getTargetEliminations(targets: string[]): Promise<
    {
        name: string;
        image: string;
        variants: { name: string; image?: string }[];
    }[][]
> {
    const result = [];
    const map = getMap(props.map)!;
    for (const target of targets) {
        const encodedTarget = encodeURIComponent(target);
        try {
            const request = await $fetch<HitmapsKillCondition[]>(
                `https://rouletteapi.hitmaps.com/api/spins/kill-conditions?missionGame=hitman${
                    map.season > 1 ? map.season : ""
                }&missionLocation=${map.name
                    .toLowerCase()
                    .replace(/\s/g, "-")
                    .replace(/à/g, "a")}&missionSlug=${
                    map.slug
                }&specificDisguises=true&specificMelee=true&specificFirearms=true&specificAccidents=true&impossibleOrDifficultKills=true&targetName=${encodedTarget}`,
            );
            result.push(
                request.map((condition) => {
                    return {
                        name: condition.name,
                        image: condition.tileUrl,
                        variants:
                            condition.variants.length > 0
                                ? condition.variants.map((variant) => {
                                      return {
                                          name: variant.name,
                                          image:
                                              variant.imageOverride ??
                                              undefined,
                                      };
                                  })
                                : [{ name: "Thrown" }, { name: "Melee" }],
                    };
                }),
            );
        } catch {
            continue;
        }
    }
    return result;
}

onMounted(async () => {
    targets.value = getMap(props.map)!.targets;
    spin.value = props.spin ?? buildEmptySpin();
    killConditions.value = await getTargetEliminations(
        targets.value.map((target) => target.name),
    );
    disguises.value = await getDisguises();
    hasNTKO.value = spin.value.targetConditions.map((target) => {
        return target.complications.length > 0;
    });
    finishedLoading.value = true;
});
</script>
