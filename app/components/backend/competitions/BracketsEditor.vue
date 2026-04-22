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
                @update:model-value="deserializeJSON()"
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
                    <TextareaComponent v-model="currentBracketRoundsText" :error="roundError" @blur="serializeJSON()" />
                </div>
                <div class="h-80">
                    <TextareaComponent v-model="currentBracketForfeitsText" :error="forfeitError" @blur="serializeJSON()" />
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

const currentBracketRoundsText = ref("");
const roundError = ref(false);
const currentBracketForfeitsText = ref("");
const forfeitError = ref(false);

function deserializeJSON() {
    if (currentBracket.value == null) {
        return;
    }
    currentBracketRoundsText.value = JSON.stringify(currentBracket.value.rounds);
    currentBracketForfeitsText.value = JSON.stringify(currentBracket.value.forfeits);
}

function serializeJSON() {
    if (currentBracket.value == null) {
        return;
    }
    try {
        currentBracket.value.rounds = JSON.parse(currentBracketRoundsText.value);
        roundError.value = false;
    } catch {
        roundError.value = true;
    }
    try {
        currentBracket.value.forfeits = JSON.parse(currentBracketForfeitsText.value);
        forfeitError.value = false;
    } catch {
        forfeitError.value = true;
    }
    if (!forfeitError.value && !roundError.value) {
        deserializeJSON();
    }
}

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
