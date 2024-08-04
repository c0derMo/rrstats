<template>
    <ul v-if="spin">
        <li v-for="(target, idx) in spin.targetConditions" :key="idx">
            <span class="font-bold">{{ target.target.name }}</span
            >: {{ buildKillMethod(target.killMethod) }} as
            {{ target.disguise.name }}
            {{ buildComplications(target.complications) }}
        </li>
        <li v-for="(additional, idx) in spin.additionalObjectives" :key="idx">
            <span class="font-bold">{{ additional.objective.name }}</span>
            : {{ additional.completionMethod.name }}
            <span v-if="additional.disguise != null">
                as {{ additional.disguise.name }}
            </span>
        </li>
    </ul>
</template>

<script setup lang="ts">
import type { Spin } from "~/utils/interfaces/IMatch";

defineProps({
    spin: {
        type: Object as PropType<Spin>,
        required: false,
        default: undefined,
    },
});

function buildKillMethod(method: {
    selectedVariant: string | null;
    name: string;
}): string {
    if (method.selectedVariant != null && method.selectedVariant != "") {
        return `${method.selectedVariant} ${method.name}`;
    } else {
        return method.name;
    }
}

function buildComplications(complications: { name: string }[]): string {
    if (complications.length <= 0) {
        return "";
    }
    return `(${complications.map((c) => c.name).join(", ")})`;
}
</script>
