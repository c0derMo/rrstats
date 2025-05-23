<template>
    <div
        class="fixed z-50 bg-black bg-opacity-50 w-full h-full top-0 left-0 grid place-items-center"
    >
        <div class="absolute w-full h-full" @click="$emit('clickOutside')" />
        <div
            class="relative transition-all motion-reduce:transition-none"
            :class="classes"
            @transitionend="transitionEndEvent"
        >
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
const emits = defineEmits<{
    clickOutside: [];
    opened: [];
    closed: [];
}>();

const props = withDefaults(
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

const currentlyOpen = ref(!props.animateOnShow && props.open);
const openDialogs = useState<number>("openDialogs", () => 0);

const classes = computed(() => {
    if (currentlyOpen.value) {
        return props.dialogClass;
    } else {
        return `-translate-y-20 !opacity-0 ${props.dialogClass}`;
    }
});

onMounted(() => {
    setTimeout(() => {
        currentlyOpen.value = props.open;
    }, 5);
    openDialogs.value += 1;
});
onBeforeUnmount(() => {
    openDialogs.value -= 1;
});
watch(
    () => props.open,
    () => {
        currentlyOpen.value = props.open;
    },
);

function transitionEndEvent(e: TransitionEvent) {
    if (e.propertyName == "opacity") {
        if (props.open) {
            emits("opened");
        } else {
            emits("closed");
        }
    }
}
</script>
