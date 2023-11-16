<template>
    <div class="flex flex-col gap-3">
        <TextInputComponent placeholder="Matches between players in groups" v-model="settings.matchesBetweenPlayers" type="number" />
        <TextInputComponent placeholder="Max points per match" v-model="settings.maxPointsPerMatch" type="number" />

        <div>
            <DropdownComponent v-model="selectedGroup" :items="settings.groups.map(g => g.groupName)" />
            <ButtonComponent class="float-right">Add</ButtonComponent>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IGroupSettings } from '~/utils/interfaces/ICompetition';

const props = defineProps({
    'groupSettings': {
        type: Object as PropType<IGroupSettings>,
        required: true
    }
});

const settings = toRef(props.groupSettings);
const selectedGroup = ref("");
</script>