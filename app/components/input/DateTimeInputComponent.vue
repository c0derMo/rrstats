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

const props = withDefaults(
    defineProps<{
        placeholder?: string;
        modelValue?: number;
        seconds?: boolean;
    }>(),
    {
        placeholder: "",
        modelValue: undefined,
        seconds: false,
    },
);
const emits = defineEmits<{
    "update:modelValue": [value: number];
}>();

const input = computed({
    get() {
        if (props.modelValue == null) {
            return undefined;
        }
        return DateTime.fromMillis(props.modelValue).toFormat(
            "yyyy-MM-dd'T'HH:mm:ss",
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
