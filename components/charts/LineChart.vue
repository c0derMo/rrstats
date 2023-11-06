<template>
    <div class="w-full h-full relative">
        <canvas ref="chart"></canvas>
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
    Tick,
    TooltipItem
} from 'chart.js';

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

interface IProps {
    labels: unknown[],
    data: unknown[],
    label?: string,
    yTickFormatFunction?: (tickValue: string | number, index: number, ticks: Tick[]) => string,
    color?: string,
    tooltipLabelFunction?: (item: TooltipItem<'line'>) => string | string[] | undefined
}
const props = defineProps<IProps>();

const chart: Ref<HTMLCanvasElement | null> = ref(null);
const chartObj: Ref<Chart<"line", unknown, unknown> | null> = ref(null);

function makeChart() {
    if (chartObj.value !== null) {
        chartObj.value.destroy();
        chartObj.value = null;
    }
    if (chart.value !== null) {
        chartObj.value = new Chart(chart.value, {
            type: 'line',
            data: {
                labels: props.labels,
                datasets: [{
                    data: props.data,
                    label: props.label,
                    pointRadius: 0,
                    pointHitRadius: 8,
                    pointHoverRadius: 6,
                    borderColor: props.color,
                    backgroundColor: props.color,
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: props.yTickFormatFunction,
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: props.tooltipLabelFunction
                        }
                    }
                }
            }
        });
    }
}

onMounted(makeChart);
onUpdated(makeChart);
</script>