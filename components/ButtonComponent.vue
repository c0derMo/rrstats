<template>
    <div
        class="relative border inline-block w-fit rounded dark:border-neutral-500 transition ease-in-out duration-150 cursor-pointer select-none font-titilliumWeb"
        :class="{
            'dark:hover:bg-neutral-600 hover:bg-neutral-100 active:bg-neutral-300 active:dark:bg-neutral-500':
                !disableHover,
        }"
        @click="click()"
    >
        <div
            v-if="loading"
            class="absolute w-full h-full bg-opacity-70 bg-gray-500 text-center"
        >
            <FontAwesomeIcon
                :icon="['fa', 'spinner']"
                class="h-full animate-spin"
            />
        </div>
        <div class="p-2">
            <span v-if="cooldown > 0" class="text-red-500"
                >Are you sure? {{ cooldown }}</span
            >
            <slot v-else />
        </div>
    </div>
</template>

<script setup lang="ts">
const emits = defineEmits(["click"]);
const props = defineProps({
    loading: {
        type: Boolean,
        default: false,
    },
    disableHover: {
        type: Boolean,
        default: false,
    },
    confirmButton: {
        type: Boolean,
        default: false,
    },
});

const cooldown = ref(0);
const cooldownTimer: Ref<NodeJS.Timeout | undefined> = ref(undefined);

function click() {
    if (props.loading) {
        return;
    }
    if (!props.confirmButton) {
        emits("click");
        return;
    }
    if (cooldown.value > 0) {
        emits("click");
        cooldown.value = 0;
        clearInterval(cooldownTimer.value);
        cooldownTimer.value = undefined;
    } else {
        cooldown.value = 3;
        cooldownTimer.value = setInterval(() => {
            cooldown.value -= 1;
            if (cooldown.value <= 0) {
                clearInterval(cooldownTimer.value);
                cooldownTimer.value = undefined;
            }
        }, 1000);
    }
}
</script>
