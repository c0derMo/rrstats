<template>
    <table class="min-w-full text-left font-light text-sm">
        <thead class="border-b dark:border-neutral-500">
            <tr>
                <th v-for="header of convertedHeaders" :key="header.key" class="px-6 py-2">
                    <slot :name="`header-${header.key}`" :value="header.title">
                        {{ header.title }}
                    </slot>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, idx) of rows" :key="idx" class="border-b dark:border-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition ease-in-out duration-600">
                <td v-for="header of convertedHeaders" :key="header.key" class="px-6 py-2">
                    <slot :name="header.key" :value="row[header.key]" :row="row">
                        {{ row[header.key] }}
                    </slot>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts" generic="R extends { [key in keyof any]: unknown }">
interface ExtendedHeader {
    title: string;
    key: string;
}

const props = defineProps({
    headers: {
        type: Array as () => string[] | ExtendedHeader[],
        required: true,
    },
    rows: {
        type: Array as () => R[],
        required: true,
    }
});

const convertedHeaders: ComputedRef<ExtendedHeader[]> = computed(() => {
    if (props.headers.length === 0) {
        return [];
    };
    if ((props.headers[0] as ExtendedHeader).key !== undefined) {
        return props.headers as ExtendedHeader[];
    }
    return (props.headers as string[]).map(header => {
        return { key: header, title: header }
    });
});
</script>