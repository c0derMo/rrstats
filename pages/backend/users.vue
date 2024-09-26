<template>
    <div>
        <div class="ml-5 text-3xl bold my-5">
            Users
            <ButtonComponent class="float-right text-base mr-5" @click="save()">
                Save
            </ButtonComponent>
        </div>

        <TabbedContainer :tabs="['Users', 'API-Keys']">
            <template #Users>
                <DataTableComponent
                    :headers="userHeaders"
                    :rows="users"
                    :enable-sorting="false"
                >
                    <template #header-more>
                        <ButtonComponent @click="addUser()">
                            <FontAwesomeIcon
                                :icon="['fa', 'plus']"
                                class="text-green-500"
                            />
                        </ButtonComponent>
                    </template>

                    <template #username="{ row }">
                        <TextInputComponent
                            v-model="row.username"
                            :error="row.username === ''"
                            :disabled="row.authorizationKey === currentUserId"
                        />
                    </template>

                    <template #discordId="{ row }">
                        <TextInputComponent
                            v-model="row.authorizationKey"
                            :error="row.authorizationKey == ''"
                            :disabled="row.authorizationKey === currentUserId"
                        />
                    </template>

                    <template #permissions="{ row }">
                        <MultiSelectComponent
                            v-model="row.permissions"
                            :items="selectablePermissions"
                            :disabled="row.authorizationKey === currentUserId"
                        />
                    </template>

                    <template #more="{ index }">
                        <ButtonComponent @click="removeUser(index)">
                            <FontAwesomeIcon
                                :icon="['fa', 'trash']"
                                class="text-red-500"
                            />
                        </ButtonComponent>
                    </template>
                </DataTableComponent>
            </template>
            <template #API-Keys>
                <DataTableComponent
                    :headers="apiHeaders"
                    :rows="apiKeys"
                    :enable-sorting="false"
                >
                    <template #header-more>
                        <ButtonComponent @click="addAPIKey()">
                            <FontAwesomeIcon
                                :icon="['fa', 'plus']"
                                class="text-green-500"
                            />
                        </ButtonComponent>
                    </template>

                    <template #username="{ row }">
                        <TextInputComponent
                            v-model="row.username"
                            :error="row.username == ''"
                        />
                    </template>

                    <template #apikey="{ row }">
                        <TextInputComponent
                            v-model="row.authorizationKey"
                            :error="row.authorizationKey == ''"
                        />
                    </template>

                    <template #permissions="{ row }">
                        <MultiSelectComponent
                            v-model="row.permissions"
                            :items="selectablePermissions"
                        />
                    </template>

                    <template #more="{ index }">
                        <ButtonComponent @click="removeAPIKey(index)">
                            <FontAwesomeIcon
                                :icon="['fa', 'trash']"
                                class="text-red-500"
                            />
                        </ButtonComponent>
                    </template>
                </DataTableComponent>
            </template>
        </TabbedContainer>
    </div>
</template>

<script setup lang="ts">
import { IPermission, type IUser } from "~/utils/interfaces/IUser";

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
    pageTitle: "Users",
});

const userHeaders = [
    { key: "username", title: "Username" },
    { key: "discordId", title: "Discord ID" },
    { key: "permissions", title: "Permissions" },
    { key: "more", title: "" },
];
const apiHeaders = [
    { key: "username", title: "Username" },
    { key: "apikey", title: "API-Key" },
    { key: "permissions", title: "Permissions" },
    { key: "more", title: "" },
];

const addAlert =
    inject<(text: string, type?: string) => void>("alertHandler") ?? (() => {});

const currentUserId: Ref<string> = ref("");
const users: Ref<IUser[]> = ref([]);
const apiKeys: Ref<IUser[]> = ref([]);
const selectablePermissions = Object.values(IPermission)
    .filter((perm) => isNaN(perm as IPermission))
    .map((perm, idx) => {
        return { text: perm as string, value: idx };
    });

function addUser() {
    users.value.push({
        username: "",
        authorizationKey: "",
        isAPIKey: false,
        permissions: [],
    });
}

function addAPIKey() {
    apiKeys.value.push({
        username: "",
        authorizationKey: "",
        isAPIKey: true,
        permissions: [],
    });
}

function removeUser(index: number) {
    users.value.splice(index, 1);
}

function removeAPIKey(index: number) {
    apiKeys.value.splice(index, 1);
}

async function updateUserList() {
    const usersQuery = await $fetch("/api/auth/users");

    users.value = usersQuery.filter((user) => !user.isAPIKey);
    apiKeys.value = usersQuery.filter((user) => user.isAPIKey);
}

async function updateLocalUser() {
    const userQuery = await $fetch("/api/auth/user");

    currentUserId.value = userQuery.authorizationKey;
}

async function save() {
    const toSave = [...users.value, ...apiKeys.value];

    for (const user of toSave) {
        if (user.username == "" || user.authorizationKey == "") {
            return;
        }
    }

    try {
        await $fetch("/api/auth/users", {
            method: "POST",
            body: toSave,
        });
        addAlert("Users saved successfully.", "success");
    } catch {
        addAlert("Error upon saving users.", "error");
    }
}

await updateUserList();
await updateLocalUser();
</script>
