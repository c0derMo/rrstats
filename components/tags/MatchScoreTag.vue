<template>
    <Tag :color="color">
        {{ text }}
    </Tag>
</template>

<script setup lang="ts">
import { WinningPlayer } from "~/utils/interfaces/IMatch";

const props = defineProps<{
    left: number;
    right: number;
    playerIndex: number;
}>();

const color = computed(() => {
    if (props.left === props.right) {
        // Draw
        return "#d0c033";
    }
    if (props.left + props.right === 1) {
        if (
            (props.left === 1 &&
                props.playerIndex === WinningPlayer.PLAYER_ONE) ||
            (props.right === 1 &&
                props.playerIndex === WinningPlayer.PLAYER_TWO)
        ) {
            // W
            return "#339436";
        } else {
            // L
            return "#b7251a";
        }
    }
    if (
        (props.left > props.right &&
            props.playerIndex === WinningPlayer.PLAYER_ONE) ||
        (props.right > props.left &&
            props.playerIndex === WinningPlayer.PLAYER_TWO)
    ) {
        // Win
        return "#4caf50";
    } else {
        // Lose
        return "#f44336";
    }
});

const text = computed(() => {
    if (props.left + props.right === 1) {
        if (
            (props.left === 1 &&
                props.playerIndex === WinningPlayer.PLAYER_ONE) ||
            (props.right === 1 &&
                props.playerIndex === WinningPlayer.PLAYER_TWO)
        ) {
            return "W";
        } else {
            return "L";
        }
    }
    return `${props.left} - ${props.right}`;
});
</script>
