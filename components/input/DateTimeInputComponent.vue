<template>
    <TextInputComponent type="datetime-local" v-model="input" :placeholder="placeholder" />
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

const props = defineProps({
    'placeholder': {
        type: String,
        default: ''
    },
    'modelValue': {
        type: Number
    }
});
const emits = defineEmits(['update:modelValue']);

const input = computed({
    get() {
        if (props.modelValue == null) {
            return undefined;
        }
        return DateTime.fromMillis(props.modelValue).toFormat("yyyy-MM-dd'T'hh:mm")
    },
    set(newValue) {
        if (newValue == null) {
            return;
        }
        emits('update:modelValue', DateTime.fromISO(newValue).toMillis())
    }
});
</script>