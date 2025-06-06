<template>
    <DialogComponent
        dialog-class="w-3/5"
        :open="showDialog"
        @closed="$emit('close')"
    >
        <CardComponent class="overflow-y-auto flex flex-col gap-3 max-h-screen">
            <TabbedContainer :tabs="['Basic', 'Groups', 'Placements']">
                <template #Basic>
                    <div class="flex flex-col gap-5 w-full">
                        <TextInputComponent
                            v-model="compData.name"
                            placeholder="Competition Name"
                            class="w-full"
                        />
                        <TextInputComponent
                            v-model="compData.tag"
                            placeholder="Competition Tag"
                            class="w-full"
                        />

                        <SwitchComponent
                            id="officialCompetition"
                            v-model="compData.officialCompetition"
                            label="Official competition:"
                        />

                        <DateTimeInputComponent
                            v-model="compData.startingTimestamp"
                        />

                        <TextInputComponent
                            v-model="compData.hitmapsStatsUrl"
                            placeholder="Hitmaps Stats URL"
                            class="w-full"
                        />
                        <TextInputComponent
                            v-model="compData.hitmapsSlug"
                            placeholder="Hitmaps Slug"
                            class="w-full"
                        />

                        <SwitchComponent
                            id="updateWithHitmaps"
                            v-model="compData.updateWithHitmaps"
                            label="Update with hitmaps:"
                        />

                        <TextInputComponent
                            v-model="compData.backgroundImage"
                            placeholder="Background image"
                            class="w-full"
                        />

                        <TextInputComponent
                            v-model="compData.matchTimeoutTime"
                            placeholder="Map timeout time"
                            type="number"
                            class="w-full"
                        />
                    </div>
                </template>

                <template #Groups>
                    <SwitchComponent
                        id="enableGroups"
                        v-model="groupsEnabled"
                        label="Enable groups:"
                        class="mb-5"
                    />

                    <GroupsEditor
                        v-if="groupsEnabled"
                        v-model:group-settings="groupSettings"
                    />
                </template>

                <template #Placements>
                    <PlacementsEditor v-model:placements="placementsData" />
                </template>
            </TabbedContainer>

            <div class="flex flex-row gap-3">
                <ButtonComponent :loading="isSaving" @click="save()"
                    >Save</ButtonComponent
                >
                <ButtonComponent @click="close()">Discard</ButtonComponent>
            </div>
        </CardComponent>
    </DialogComponent>
</template>

<script setup lang="ts">
import type {
    ICompetition,
    ICompetitionPlacement,
    IGroupSettings,
} from "~/utils/interfaces/ICompetition";

const props = defineProps<{
    competition: ICompetition;
    placements: ICompetitionPlacement[];
}>();

defineEmits<{
    close: [];
}>();
const addAlert =
    inject<(text: string, type?: string) => void>("alertHandler") ?? (() => {});

const showDialog = ref(true);
const compData = toRef(props.competition);
const placementsData = toRef(props.placements);
const groupsEnabled = ref(compData.value.groupsConfig != null);
const groupSettings: Ref<IGroupSettings> = ref(
    compData.value.groupsConfig ?? {
        matchesBetweenPlayers: 0,
        maxPointsPerMatch: 0,
        groups: [],
    },
);
const isSaving = ref(false);

async function save() {
    isSaving.value = true;
    if (groupsEnabled.value) {
        compData.value.groupsConfig = groupSettings.value;
    } else {
        compData.value.groupsConfig = undefined;
    }

    for (const placement of placementsData.value) {
        placement.competition = compData.value.tag;
    }

    try {
        await $fetch("/api/competitions", {
            method: "post",
            body: compData.value,
        });
        await $fetch("/api/competitions/placements", {
            method: "post",
            body: placementsData.value,
        });
        addAlert("Competition saved successfully.", "success");
    } catch {
        addAlert("Error upon saving competition.", "error");
    }

    isSaving.value = false;
    showDialog.value = false;
}

function close() {
    showDialog.value = false;
}
</script>
