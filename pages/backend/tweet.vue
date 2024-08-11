<template>
    <div>
        <div class="text-3xl bold my-5">Tweet</div>
        <span class="italic"
            >This tweets directly from the official @rrstats account. Please
            handle with care.</span
        >

        <div class="flex flex-row justify-between">
            <DropdownComponent
                :items="dropdownableRecords"
                button-text="Add record template"
                @update:model-value="(v) => addRecordTemplate(v)"
            />

            <div class="flex flex-row gap-2">
                <ButtonComponent @click="addTweet()">
                    <FontAwesomeIcon
                        :icon="['fa', 'plus']"
                        class="text-green-500"
                    />
                </ButtonComponent>
                <ButtonComponent @click="removeTweet()">
                    <FontAwesomeIcon
                        :icon="['fa', 'minus']"
                        class="text-red-500"
                    />
                </ButtonComponent>
            </div>
        </div>

        <div class="flex flex-col gap-3 my-2">
            <CardComponent v-for="idx of tweets.length" :key="idx">
                <TextareaComponent
                    v-model="tweets[idx - 1]"
                    class="h-36"
                    :max-length="280"
                    :placeholder="`Tweet ${idx}`"
                />
            </CardComponent>
        </div>

        <ButtonComponent :loading="tweeting" @click="tweet()">
            <FontAwesomeIcon class="mr-2" :icon="['fab', 'twitter']" />
            Send {{ tweets.length == 1 ? "tweet" : "thread" }}
        </ButtonComponent>

        <span v-if="success" class="ml-5 text-green-500"
            >Sent successfully.</span
        >
        <span v-if="error" class="ml-5 text-red-500"
            >An error occured while sending the tweet(s).</span
        >
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import type { IGenericRecord, IMapRecord } from "~/utils/interfaces/IRecord";

interface PreviousRecord {
    players: string;
    time: number;
}

const recentRecords: Ref<(IGenericRecord | IMapRecord)[]> = ref([]);
const recordPlayers: Ref<Record<string, string>> = ref({});
const tweets: Ref<string[]> = ref([""]);
const tweeting = ref(false);
const success = ref(false);
const error = ref(false);

definePageMeta({
    layout: "backend",
    middleware: ["auth"],
    pageTitle: "Tweet",
});

const dropdownableRecords = computed(() => {
    return recentRecords.value.map((record) => {
        if (Object.hasOwn(record, "player")) {
            const mapRecord = record as IMapRecord;
            return {
                text: `${getMap(mapRecord.map)!.name}: ${secondsToTime(
                    mapRecord.time,
                )} by ${recordPlayers.value[mapRecord.player]}`,
                value: record,
            };
        } else {
            const genericRecord = record as IGenericRecord;
            const players = genericRecord.players
                .map((p) => recordPlayers.value[p])
                .join(", ");
            return {
                text: `${genericRecord.record}: ${secondsToTime(
                    genericRecord.time,
                )} by ${players}`,
                value: record,
            };
        }
    });
});

async function addRecordTemplate(record: IGenericRecord | IMapRecord) {
    let recordString: string, players: string;
    if (Object.hasOwn(record, "player")) {
        const mapRecord = record as IMapRecord;
        recordString = getMap(mapRecord.map)!.name;
        players = recordPlayers.value[mapRecord.player];
    } else {
        const genericRecord = record as IGenericRecord;
        recordString = genericRecord.record;
        players = genericRecord.players
            .map((p) => recordPlayers.value[p])
            .join(" and ");
    }

    const previousRecords = await fetchPreviousRecord(record);
    const text: string[] = ["The following record has been updated:"];
    if (previousRecords.length === 0) {
        text.push(
            `${recordString}: ${players} has set a new record, WR is now ${secondsToTime(
                record.time,
            )}.`,
        );
    } else if (previousRecords[0].time === record.time) {
        const allPlayers = previousRecords.map((r) => r.players).join(", ");
        text.push(
            `${recordString}: ${players} tied ${allPlayers} record, WR is ${secondsToTime(
                record.time,
            )}`,
        );
    } else if (previousRecords.length === 1) {
        const timeDiff = previousRecords[0].time - record.time;
        text.push(
            `${recordString}: ${players} broke ${
                previousRecords[0].players
            }'s record by ${timeDiff} seconds, WR is now ${secondsToTime(
                record.time,
            )}`,
        );
    } else {
        const timeDiff = previousRecords[0].time - record.time;
        const allPlayers = previousRecords.map((r) => r.players).join(", ");
        text.push(
            `${recordString}: ${players} broke ${allPlayers}'s record by ${timeDiff} seconds, WR is now ${secondsToTime(
                record.time,
            )}`,
        );
    }
    text.push("View the records at https://rrstats.currymaker.net/records");

    // Adding the templates
    for (const line of text) {
        if (280 - tweets.value[tweets.value.length - 1].length < line.length) {
            tweets.value.push("");
        }
        tweets.value[tweets.value.length - 1] += `${line}\n\n`;
    }
}

function addTweet() {
    tweets.value.push("");
}

function removeTweet() {
    if (tweets.value.length > 1) {
        tweets.value.pop();
    }
}

async function tweet() {
    tweeting.value = true;
    success.value = false;
    error.value = false;

    try {
        const tweetQuery = await $fetch("/api/procedures/tweet", {
            method: "POST",
            body: tweets,
        });
        if (tweetQuery === true) {
            success.value = true;
        } else {
            error.value = true;
        }
    } catch {
        error.value = true;
    }

    tweeting.value = false;
}

async function fetchPlayerNames(playerUuids: string[]): Promise<string[]> {
    try {
        const lookupQuery = await $fetch("/api/player/lookup", {
            query: { players: playerUuids },
        });
        const players: string[] = [];
        for (const player of playerUuids) {
            players.push(lookupQuery[player]);
        }

        return players;
    } catch {
        return [];
    }
}

async function fetchPreviousRecord(
    record: IMapRecord | IGenericRecord,
): Promise<PreviousRecord[]> {
    let query = {};
    if (Object.hasOwn(record, "player")) {
        query = { map: (record as IMapRecord).map };
    } else {
        query = { generic: (record as IGenericRecord).record };
    }

    let records: (IMapRecord | IGenericRecord)[];
    try {
        records = await $fetch<(IMapRecord | IGenericRecord)[]>(
            "/api/records/history",
            { query },
        );
    } catch {
        return [];
    }

    if (records.length <= 1) {
        return [];
    }

    records.pop(); // Remove new record
    const previousRecords: PreviousRecord[] = [];
    do {
        const nextRecord = records.pop() as IMapRecord | IGenericRecord;
        let players: string[];
        if (Object.hasOwn(nextRecord, "player")) {
            players = await fetchPlayerNames([
                (nextRecord as IMapRecord).player,
            ]);
        } else {
            players = await fetchPlayerNames(
                (nextRecord as IGenericRecord).players,
            );
        }
        previousRecords.push({
            players: players.join(" and "),
            time: nextRecord.time,
        });
    } while (
        records.length > 0 &&
        records[records.length - 1].time === previousRecords[0].time
    );

    return previousRecords;
}

async function fetchRecentRecords() {
    const recordQuery = await $fetch("/api/records");

    recordPlayers.value = recordQuery.players;
    recentRecords.value = [...recordQuery.maps, ...recordQuery.generic];
}

await fetchRecentRecords();
</script>
