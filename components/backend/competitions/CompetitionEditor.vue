<template>
    <DialogComponent dialogClass="w-3/5">
        <CardComponent class="overflow-y-auto">
            <TabbedContainer :tabs="['Basic', 'Groups', 'Placements']">
                <template #Basic>
                    <div class="flex flex-col gap-5 w-full">
                        <TextInputComponent v-model="compData.name" placeholder="Competition Name" class="w-full" />
                        <TextInputComponent v-model="compData.tag" placeholder="Competition Tag" class="w-full" />
                        
                        <SwitchComponent label="Official competition:" v-model="compData.officialCompetition" id="officialCompetition" />

                        <DateTimeInputComponent v-model="compData.startingTimestamp" />

                        <TextInputComponent v-model="compData.hitmapsStatsUrl" placeholder="Hitmaps Stats URL" class="w-full" />
                        <TextInputComponent v-model="compData.hitmapsSlug" placeholder="Hitmaps Slug" class="w-full" />

                        <SwitchComponent label="Update with hitmaps:" v-model="compData.updateWithHitmaps" id="updateWithHitmaps" />

                        <TextInputComponent v-model="compData.backgroundImage" placeholder="Background image" class="w-full" />
                    </div>
                </template>

                <template #Groups>
                    <SwitchComponent label="Enable groups:" v-model="groupsEnabled" id="enableGroups" class="mb-5" />
                </template>

                <template #Placements>
                    <span class="italic">Leave "Bracket" empty if there are no seperate brackets. Leave "Placement" empty to add Group Stage Participation.</span>

                    <TableComponent :headers="placementsHeaders" :rows="placementsData">
                        <template v-slot:player="{ index }">
                            <TextInputComponent v-model="placementPlayers[index]" @update:model-value="(val) => tryLookupPlayer(val, index)" :error="playersIncorrect[index]" />
                        </template>
                        <template v-slot:bracket="{ index }">
                            <TextInputComponent v-model="placementsData[index].bracket" class="w-64" />
                        </template>
                        <template v-slot:placement="{ index }">
                            <TextInputComponent v-model="placementsData[index].placement" type="number" class="w-24" />
                        </template>
                        <template v-slot:more="{ index }">
                            <ButtonComponent @click="removePlacement(index)">Delete</ButtonComponent>
                        </template>
                    </TableComponent>

                    <ButtonComponent class="float-right mt-3 mr-10" @click="addPlacement()">
                        Add
                    </ButtonComponent>
                </template>
            </TabbedContainer>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import { ICompetition, ICompetitionPlacement } from '~/utils/interfaces/ICompetition';

const props = defineProps({
    'competition': {
        type: Object as PropType<ICompetition>,
        required: true
    },
    'placements': {
        type: Object as PropType<ICompetitionPlacement[]>,
        required: true
    }
});

const compData = toRef(props.competition);
const placementsData = toRef(props.placements);
const playerLookupTable: Ref<Record<string, string>> = ref({});
const placementPlayers: Ref<string[]> = ref([]);
const playersIncorrect: Ref<boolean[]> = ref([]);
const groupsEnabled = ref(compData.value.groupsConfig != null);

const placementsHeaders = [
    { key: 'player', title: 'Player' },
    { key: 'bracket', title: 'Bracket' },
    { key: 'placement', title: 'Placement' },
    { key: 'more', title: '' }
]

function addPlacement() {
    placementsData.value.push({
        player: "",
        bracket: "",
        competition: compData.value.tag,
        placement: undefined
    });
    placementPlayers.value.push("");
    playersIncorrect.value.push(true);
}

function removePlacement(index: number) {
    placementsData.value.splice(index, 1);
    placementPlayers.value.splice(index, 1);
    playersIncorrect.value.splice(index, 1);
}

onBeforeMount(async () => {
    const playersRequest = await useFetch('/api/player/lookup', { query: { players: placementsData.value.map(p => p.player) } });
    if (playersRequest.data != null && playersRequest.status.value === 'success') {
        playerLookupTable.value = playersRequest.data.value as Record<string, string>;
        for (const placement of placementsData.value) {
            placementPlayers.value.push(playerLookupTable.value[placement.player]);
            playersIncorrect.value.push(false);
        }
    }
});

async function tryLookupPlayer(player: string, index: number) {
    if (Object.values(playerLookupTable.value).includes(player)) {
        playersIncorrect.value[index] = false;
        return;
    }

    const lookupQuery = await useFetch('/api/player/lookup', { query: { names: [player, ""] } });
    if (lookupQuery.status.value !== 'success' || lookupQuery.data == null) {
        playersIncorrect.value[index] = true;
        return;
    }

    for (const uuid in (lookupQuery.data.value as Record<string, string>)) {
        if ((lookupQuery.data.value as Record<string, string>)[uuid] === player) {
            playerLookupTable.value[uuid] = player;
            playersIncorrect.value[index] = false;
            return;
        }
    }
    
    playersIncorrect.value[index] = true;
}
</script>