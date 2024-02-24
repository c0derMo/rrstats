<template>
    <div class="p-5 rounded relative" :class="backgroundColor">
        <div
            class="h-1 bg-white dark:bg-black dark:bg-opacity-50 bg-opacity-50 absolute top-0 left-0 rounded"
            :style="style"
        />
        <slot />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    time: {
        type: Number,
        default: 15000,
    },
    type: {
        type: String,
        default: "",
    },
});
const emits = defineEmits(["close"]);

const timer = ref(props.time);
const closed = ref(false);
const animationShow = ref(false);

const style = computed(() => {
    return `width: ${(timer.value / props.time) * 100}%`;
});

const backgroundColor = computed(() => {
    if (props.type.toLowerCase() === "error") {
        return "bg-red-500";
    }
    if (props.type.toLowerCase() === "success") {
        return "bg-green-500";
    }
    return "bg-slate-500";
});

onMounted(() => {
    setInterval(() => {
        if (closed.value) return;
        if (timer.value < 0) {
            emits("close");
            closed.value = true;
        } else {
            timer.value -= 50;
        }
    }, 50);
    animationShow.value = true;
});
</script>
