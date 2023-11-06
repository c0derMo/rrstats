<template>
    <div class="relative w-fit h-fit">
        <input 
            class="rounded py-1 px-3 bg-transparent peer outline-none w-full h-fit"
            required
            ref="input"
            :value="modelValue"
            @input="$emit('update:model-value', (<HTMLInputElement>$event.target).value)"
            @focusin="isFocused = true"
            @focusout="isFocused = false"
            @keydown="(key) => $emit('keydown', key)"
        />

        <label
            class="absolute left-3 top-1 peer-focus:-translate-y-4 peer-focus:scale-75 origin-left pointer-events-none transition-all peer-valid:-translate-y-4 peer-valid:scale-75"
        >
            {{ placeholder }}
        </label>

        <div class="absolute flex w-full h-full top-0 left-0 pointer-events-none">
            <div
                class="h-full w-3 inline-block border rounded-l border-r-0 dark:border-neutral-500"
                :class="{
                    '!border-blue-700': isFocused
                }"
            ></div>
            <div
                class="h-full w-fit inline-block border border-l-0 border-r-0 text-transparent text-xs dark:border-neutral-500"
                :class="{
                    '!border-blue-700': isFocused,
                    'border-t-0': isFocused || modelValue !== ''
                }"
            >{{ placeholder }}</div>
            <div
                class="h-full grow inline-block border border-l-0 rounded-r dark:border-neutral-500"
                :class="{
                    '!border-blue-700': isFocused
                }"
            ></div>
        </div>
    </div>
</template>

<script setup lang="ts">
const emits = defineEmits(['update:model-value', 'focus-change', 'keydown']);

defineProps({
    'placeholder': {
        type: String,
        required: false,
        default: ''
    },
    'modelValue': {
        type: String,
        required: false,
        default: '',
    }
});

const isFocused = ref(false);

watch(isFocused, newValue => {
    emits('focus-change', newValue);
})
</script>