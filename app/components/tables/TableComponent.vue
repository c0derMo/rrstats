<template>
    <table class="min-w-full text-left">
        <thead class="border-b dark:border-neutral-500 border-neutral-300">
            <tr>
                <th
                    v-for="header of convertedHeaders"
                    :key="header.key"
                    class="px-3 py-2"
                >
                    <slot :name="`header-${header.key}`" :value="header.title">
                        {{ header.title }}
                    </slot>
                </th>
            </tr>
        </thead>
        <tbody
            v-for="(row, idx) of rows"
            :key="idx"
            class="border-b dark:border-neutral-500 border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition ease-in-out duration-300"
            @click="$emit('click-row', row, idx)"
        >
            <tr v-if="$slots['before-row']">
                <td :colspan="convertedHeaders.length" class="text-center">
                    <slot name="before-row" :row="row" :index="idx" />
                </td>
            </tr>
            <tr>
                <td
                    v-for="header of convertedHeaders"
                    :key="header.key"
                    class="md:px-3 px-1 py-2"
                >
                    <slot
                        :name="header.key"
                        :value="getValue(row, header.key)"
                        :row="row"
                        :index="idx"
                    >
                        {{ getValue(row, header.key) }}
                    </slot>
                </td>
            </tr>
            <tr v-if="$slots['after-row']">
                <td :colspan="convertedHeaders.length" class="text-center">
                    <slot name="after-row" :row="row" :index="idx" />
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts" generic="R">
interface ExtendedHeader {
    title: string;
    key: string;
}

const props = defineProps<{
    headers: string[] | ExtendedHeader[];
    rows: R[];
}>();

defineEmits<{
    "click-row": [row: R, idx: number];
}>();

const convertedHeaders: ComputedRef<ExtendedHeader[]> = computed(() => {
    if (props.headers.length === 0) {
        return [];
    }
    if ((props.headers[0] as ExtendedHeader).key !== undefined) {
        return props.headers as ExtendedHeader[];
    }
    return (props.headers as string[]).map((header) => {
        return { key: header, title: header } as ExtendedHeader;
    });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getValue(row: R, key: string): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return row[key as keyof R] as any;
}
</script>
