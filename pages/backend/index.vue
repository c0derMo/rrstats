<template>
    <div class="grid grid-cols-4 mx-10 mt-10 justify-items-center gap-5">
        <BackendButton title="Competitions" subtitle="List & edit competitions" target="/backend/competitions">
            <FontAwesomeIcon :icon="['fa', 'trophy']"></FontAwesomeIcon>
        </BackendButton>
        <BackendButton title="Players" subtitle="List & edit players" target="/backend/competitions">
            <FontAwesomeIcon :icon="['fa', 'user-edit']" class="ml-5"></FontAwesomeIcon>
        </BackendButton>
        <BackendButton title="Matches" subtitle="List & edit matches" target="/backend/competitions">
            <FontAwesomeIcon :icon="['fa', 'gamepad']"></FontAwesomeIcon>
        </BackendButton>
        <BackendButton title="Records" subtitle="Update & add records" target="/backend/competitions">
            <FontAwesomeIcon :icon="['fa', 'medal']"></FontAwesomeIcon>
        </BackendButton>
        <BackendButton title="Users" subtitle="Edit backend users" target="/backend/competitions">
            <FontAwesomeIcon :icon="['fa', 'user-cog']"></FontAwesomeIcon>
        </BackendButton>
        <BackendButton title="Tweet" subtitle="Send tweets from the @rrstats account" target="/backend/competitions">
            <FontAwesomeIcon :icon="['fab', 'twitter']"></FontAwesomeIcon>
        </BackendButton>
        <BackendButton title="Database checks" subtitle="Run various checks on the database" target="/backend/competitions">
            <FontAwesomeIcon :icon="['fa', 'stethoscope']"></FontAwesomeIcon>
        </BackendButton>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTrophy, faUserEdit, faGamepad, faMedal, faUserCog, faStethoscope } from "@fortawesome/free-solid-svg-icons";
import { faTwitter } from "@fortawesome/free-brands-svg-icons";

library.add(faTrophy);
library.add(faUserEdit);
library.add(faGamepad);
library.add(faMedal);
library.add(faUserCog);
library.add(faTwitter);
library.add(faStethoscope);

definePageMeta({
    layout: 'backend',
    middleware: ['auth']
});
</script>