<template>
    <div class="w-full h-full relative">
        <canvas ref="chart" />
    </div>
</template>

<script setup lang="ts">
import {
    Chart,
    LineController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    type Tick,
    type TooltipItem,
} from "chart.js";

Chart.register(
    LineController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
);

interface IProps {
    axisLabels: unknown[];
    data: unknown[];
    labels?: string[];
    yTickFormatFunction?: (
        tickValue: string | number,
        index: number,
        ticks: Tick[],
    ) => string;
    colors?: string[];
    tooltipLabelFunction?: (
        item: TooltipItem<"line">,
    ) => string | string[] | undefined;
    legend?: boolean;
}
const props = defineProps<IProps>();

const chart: Ref<HTMLCanvasElement | null> = ref(null);
const chartObj: Ref<Chart<"line", unknown, unknown> | null> = ref(null);

const transformedData = computed(() => {
    return props.data.map((data, idx) => {
        let label = undefined;
        let color = undefined;
        if (props.labels != null && props.labels.length >= idx) {
            label = props.labels[idx];
        }
        if (props.colors != null && props.colors.length >= idx) {
            color = props.colors[idx];
        }

        return {
            data: data,
            label: label,
            pointRadius: 0,
            pointHitRadius: 8,
            pointHoverRaudius: 6,
            borderColor: color,
            backgroundColor: color,
        };
    });
});

function makeChart() {
    if (chartObj.value !== null) {
        chartObj.value.destroy();
        chartObj.value = null;
    }
    if (chart.value !== null) {
        chartObj.value = new Chart(chart.value, {
            type: "line",
            data: {
                labels: props.axisLabels,
                datasets: transformedData.value,
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: props.yTickFormatFunction,
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: props.tooltipLabelFunction,
                        },
                    },
                    legend: {
                        display: props.legend != null,
                        position: "bottom",
                    },
                },
            },
        });
    }
}

onMounted(makeChart);
watch(props, () => {
    makeChart();
});
</script>
