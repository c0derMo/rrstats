<template>
    <div
        class="fixed z-50 bg-black bg-opacity-50 w-full h-full top-0 left-0 grid place-items-center"
    >
        <div class="absolute w-full h-full" @click="$emit('clickOutside')" />
        <Transition
            name="dialog"
            :appear="animateOnShow"
            @after-appear="emits('opened')"
            @after-enter="emits('opened')"
            @after-leave="emits('closed')"
        >
            <div v-show="open" class="relative" :class="dialogClass">
                <slot />
            </div>
        </Transition>
    </div>
</template>

<style>
.dialog-enter-active,
.dialog-leave-active {
    transition-property: opacity, transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}

.dialog-enter-from,
.dialog-leave-to {
    opacity: 0;
    transform: translateY(-5rem);
}

.dialog-leave-from,
.dialog-enter-to {
    opacity: 1;
    transform: none;
}

@media (prefers-reduced-motion: reduce) {
    .dialog-enter-active,
    .dialog-leave-active {
        transition-property: none;
    }
}
</style>

<script setup lang="ts">
const emits = defineEmits<{
    clickOutside: [];
    opened: [];
    closed: [];
}>();

withDefaults(
    defineProps<{
        dialogClass?: string;
        open?: boolean;
        animateOnShow?: boolean;
    }>(),
    {
        dialogClass: "",
        open: true,
        animateOnShow: true,
    },
);

const openDialogs = useState<number>("openDialogs", () => 0);

onMounted(() => {
    openDialogs.value += 1;
});
onBeforeUnmount(() => {
    openDialogs.value -= 1;
});
</script>
