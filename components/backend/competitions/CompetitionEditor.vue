<template>
    <DialogComponent dialogClass="w-3/5">
        <CardComponent class="overflow-y-auto flex flex-col gap-3">
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

                    <GroupsEditor v-if="groupsEnabled" v-model:groupSettings="groupSettings" />
                </template>

                <template #Placements>
                    <PlacementsEditor v-model:placements="placementsData" />
                </template>
            </TabbedContainer>

            <ButtonComponent @click="save()">Save</ButtonComponent>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import { ICompetition, ICompetitionPlacement, IGroupSettings } from '~/utils/interfaces/ICompetition';

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
const groupsEnabled = ref(compData.value.groupsConfig != null);
const groupSettings: Ref<IGroupSettings> = ref(compData.value.groupsConfig || {
    matchesBetweenPlayers: 0,
    maxPointsPerMatch: 0,
    groups: []
});

function save() {
    // TODO: Set correct tag for each placement!
    console.log(compData.value);
    console.log(placementsData.value);
}
</script>