<template>
    <TextInputComponent
        v-model="input"
        type="datetime-local"
        :placeholder="placeholder"
        :step="seconds ? 1 : 60"
    />
</template>

<script setup lang="ts">
import { DateTime } from "luxon";

const props = defineProps({
    placeholder: {
        type: String,
        default: "",
    },
    modelValue: {
        type: Number,
        default: undefined,
    },
    seconds: {
        type: Boolean,
        default: false,
    },
});
const emits = defineEmits(["update:modelValue"]);

const input = computed({
    get() {
        if (props.modelValue == null) {
            return undefined;
        }
        return DateTime.fromMillis(props.modelValue).toFormat(
            "yyyy-MM-dd'T'hh:mm:ss",
        );
    },
    set(newValue) {
        if (newValue == null) {
            return;
        }
        emits("update:modelValue", DateTime.fromISO(newValue).toMillis());
    },
});
</script>
