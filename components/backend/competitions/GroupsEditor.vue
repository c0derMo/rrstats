<template>
    <div class="flex flex-col gap-3">
        <TextInputComponent placeholder="Matches between players in groups" v-model="settings.matchesBetweenPlayers" type="number" />
        <TextInputComponent placeholder="Max points per match" v-model="settings.maxPointsPerMatch" type="number" />

        <div class="flex flex-row gap-5">
            <DropdownComponent v-model="selectedGroup" :items="settings.groups.map((g, idx) => `Group ${idx+1}`)" />

            <div class="flex-grow"></div>

            <ButtonComponent>Delete</ButtonComponent>
            <ButtonComponent>Add</ButtonComponent>
        </div>

        <div v-if="selectedGroupIndex != null" class="flex flex-col gap-3">
            <TextInputComponent v-model="settings.groups[selectedGroupIndex].groupName" placeholder="Group name" />
            <TextInputComponent v-model="settings.groups[selectedGroupIndex].advancingPlayers" placeholder="Number of advancing players" type="number" />
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

const selectedGroupIndex = computed(() => {
    if (selectedGroup.value === "") {
        return null;
    }
    const index = parseInt(selectedGroup.value.split(" ")[1])-1;
    return index;
});
</script>