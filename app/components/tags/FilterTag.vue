<template>
    <Tag narrow>
        <slot />
        <FontAwesomeIcon :icon="['fas', 'x']" class="text-xs ml-2" />
    </Tag>
</template>
