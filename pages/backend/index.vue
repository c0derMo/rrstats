<template>
    <div class="grid grid-cols-4 mt-10 justify-items-center gap-5">
        <BackendButton
            v-if="user?.permissions.includes(IPermission.EDIT_COMPETITIONS)"
            title="Competitions"
            subtitle="List & edit competitions"
            target="/backend/competitions"
        >
            <FontAwesomeIcon :icon="['fa', 'trophy']" />
        </BackendButton>
        <BackendButton
            v-if="user?.permissions.includes(IPermission.EDIT_PLAYERS)"
            title="Players"
            subtitle="List & edit players"
            target="/backend/players"
        >
            <FontAwesomeIcon :icon="['fa', 'user-edit']" class="ml-5" />
        </BackendButton>
        <BackendButton
            v-if="user?.permissions.includes(IPermission.EDIT_MATCHES)"
            title="Matches"
            subtitle="List & edit matches"
            target="/backend/matches"
        >
            <FontAwesomeIcon :icon="['fa', 'gamepad']" />
        </BackendButton>
        <BackendButton
            v-if="user?.permissions.includes(IPermission.EDIT_RECORDS)"
            title="Records"
            subtitle="Update & add records"
            target="/backend/records"
        >
            <FontAwesomeIcon :icon="['fa', 'medal']" />
        </BackendButton>
        <BackendButton
            v-if="user?.permissions.includes(IPermission.EDIT_USERS)"
            title="Users"
            subtitle="Edit backend users"
            target="/backend/users"
        >
            <FontAwesomeIcon :icon="['fa', 'user-cog']" />
        </BackendButton>
        <BackendButton
            v-if="user?.permissions.includes(IPermission.TWEET)"
            title="Tweet"
            subtitle="Send tweets from the @rrstats account"
            target="/backend/tweet"
        >
            <FontAwesomeIcon :icon="['fab', 'twitter']" />
        </BackendButton>
        <BackendButton
            title="Database checks"
            subtitle="Run various checks on the database"
            target="/backend/databaseChecks"
        >
            <FontAwesomeIcon :icon="['fa', 'stethoscope']" />
        </BackendButton>
    </div>
</template>

<script setup lang="ts">
import { IPermission } from "~/utils/interfaces/IUser";

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
});

const user = (await useFetch("/api/auth/user")).data;
</script>
