<template>
    <div class="flex flex-col gap-3">
        <div class="flex flex-row gap-5">
            <DropdownComponent
                v-model="selectedBracketIdx"
                :items="
                    brackets.map((bracket, idx) => ({
                        text: bracket.name,
                        value: idx,
                    }))
                "
                class="flex-grow"
            />
            <ButtonComponent @click="addBracket()">
                <FontAwesomeIcon
                    :icon="['fa', 'plus']"
                    class="text-green-500"
                />
            </ButtonComponent>
            <ButtonComponent @click="removeBracket()">
                <FontAwesomeIcon :icon="['fa', 'trash']" class="text-red-500" />
            </ButtonComponent>
        </div>

        <template v-if="currentBracket != null">
            <TextInputComponent
                v-model="currentBracket.name"
                placeholder="Bracket name"
            />
            <TextInputComponent
                v-model="currentBracket.index"
                placeholder="Index"
                type="number"
            />
            <SwitchComponent
                id="advancementBracketSwitch"
                v-model="currentBracket.advancementBracket"
                label="Advancement bracket"
            />

            <div class="grid grid-cols-2 gap-2">
                <div>Bracket definition:</div>
                <div>Forfeits:</div>
                <div class="h-80">
                    <TextareaComponent v-model="currentBracketRoundsText" />
                </div>
                <div class="h-80">
                    <TextareaComponent v-model="currentBracketForfeitsText" />
                </div>
            </div>

            <div class="flex flex-row gap-3">
                <ButtonComponent @click="namesToUUIDs">
                    Names -> UUIDs
                </ButtonComponent>
                <ButtonComponent @click="uuidsToNames">
                    UUIDs -> Names
                </ButtonComponent>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
const brackets = defineModel<IBracket[]>({ required: true });
const selectedBracketIdx = ref(-1);

const playerNames = usePlayers();
await playerNames.queryAll();

const currentBracket = computed<IBracket | null>(() => {
    return brackets.value[selectedBracketIdx.value] ?? null;
});

const currentBracketRoundsText = computed({
    get() {
        if (currentBracket.value == null) {
            return "";
        }
        return JSON.stringify(currentBracket.value.rounds, null, 2);
    },
    set(value: string) {
        if (currentBracket.value == null) {
            return;
        }
        currentBracket.value.rounds = JSON.parse(value);
    },
});

const currentBracketForfeitsText = computed({
    get() {
        if (currentBracket.value == null) {
            return "";
        }
        return JSON.stringify(currentBracket.value.forfeits, null, 2);
    },
    set(value: string) {
        if (currentBracket.value == null) {
            return;
        }
        currentBracket.value.forfeits = JSON.parse(value);
    },
});

function addBracket() {
    brackets.value.push({
        name: "New bracket",
        advancementBracket: true,
        index: brackets.value.length,
        rounds: [],
        forfeits: {},
    });
}

function removeBracket() {
    if (selectedBracketIdx.value >= 0) {
        brackets.value.splice(selectedBracketIdx.value, 1);
        selectedBracketIdx.value -= 1;
    }
}

function mapPlayers(cb: (player: string) => string) {
    if (currentBracket.value == null) {
        return;
    }
    currentBracket.value.rounds.forEach((stage) => {
        stage.forEach((round) => {
            round.matches.forEach((match) => {
                if (match.playerOne != null) {
                    match.playerOne = cb(match.playerOne);
                }
                if (match.playerTwo != null) {
                    match.playerTwo = cb(match.playerTwo);
                }
            });
        });
    });
    for (const match in currentBracket.value.forfeits) {
        currentBracket.value.forfeits[match] = cb(
            currentBracket.value.forfeits[match],
        );
    }
}

function namesToUUIDs() {
    mapPlayers((player) => playerNames.getUUID(player, player));
}

function uuidsToNames() {
    mapPlayers((player) => playerNames.get(player, player));
}
</script>
