<template>
    <CardComponent>
        <div
            class="border-b border-gray-500"
            @click="showContent = !showContent"
        >
            <slot name="title" />

            <FontAwesomeIcon
                :icon="['fas', 'chevron-down']"
                :class="{
                    'rotate-180': showContent,
                }"
                class="transition float-right"
            />
        </div>

        <Transition
            name="collapse"
            @enter="updateFullHeight"
            @leave="updateFullHeight"
        >
            <div v-show="showContent">
                <slot />
            </div>
        </Transition>
    </CardComponent>
</template>

<style>
.collapse-enter-from,
.collapse-leave-to {
    max-height: 0px;
}

.collapse-enter-active,
.collapse-leave-active {
    transition-property: max-height;
    transition-duration: 200ms;
    transition-timing-function: ease;
    overflow-y: hidden;
}

.collapse-enter-to,
.collapse-leave-from {
    max-height: v-bind(fullHeight);
}

@media (prefers-reduced-motion: reduce) {
    .collapse-enter-active,
    .collapse-leave-active {
        transition-property: none;
    }
}
</style>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        expanded?: boolean;
    }>(),
    {
        expanded: false,
    },
);

const showContent = ref(props.expanded);
const fullHeight = ref("100vwh");

function updateFullHeight(el: Element) {
    fullHeight.value = `${el.scrollHeight}px`;
}
</script>
