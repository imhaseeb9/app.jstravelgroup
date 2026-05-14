<script setup>
import { useLayout } from '@/layout/composables/layout';
import { getColor } from '@/utils';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { ref, watch } from 'vue';
import { tooltip } from './tooltip';
const emit = defineEmits(['barClick']);

const props = defineProps({
    class: String,
    datasets: {
        type: Array,
        default: () => []
    },
    labels: {
        type: Array,
        default: () => []
    },
    valueFormatter: {
        type: Function,
        default: (value) => `${value}`
    },
    showYAxis: {
        type: Boolean,
        default: true
    },
    xLabelFormatter: {
        type: Function,
        default: (value) => format(value, 'MMM')
    },
    yLabelFormatter: {
        type: Function,
        default: (value) => value
    },
    tooltipTitleFormatter: {
        type: Function,
        default: (value) => {
            const date = new Date(value);
            return format(date, 'MMMM yyyy');
        }
    },
    stacked: {
        type: Boolean,
        default: true
    },
    showYGrid: {
        type: Boolean,
        default: false
    },
    showXGrid: {
        type: Boolean,
        default: false
    },
    beginAtZero: {
        type: Boolean,
        default: true
    },
    yStepSize: {
        type: Number,
        default: null
    },
    categoryPercentage: {
        type: Number,
        default: 0.7
    }
});

const chartPlugins = ref([]);
const chartData = ref({});
const chartOptions = ref({});
const activeBarIndex = ref(null);
const { layoutConfig, isDarkTheme } = useLayout();

function setChartData() {
    const datasets = props.datasets.map((dataset) => ({
        hideInLegendAndTooltip: dataset.hideInLegendAndTooltip ?? false,
        borderRadius: dataset.borderRadius ?? 6,
        borderSkipped: dataset.borderSkipped ?? false,
        maxBarThickness: dataset.maxBarThickness ?? 28,
        ...dataset,
        fill: dataset.fill ?? true,
        backgroundColor: (context) => {
            if (activeBarIndex.value !== null && context.dataIndex !== activeBarIndex.value) {
                return getColor(dataset.backgroundColor ?? 'primary-active', 0.4);
            }
            return getColor(dataset.backgroundColor ?? 'primary-active');
        },
        tooltipBackgroundColor: () => {
            return getColor(dataset.backgroundColor ?? 'primary-active');
        },
        hoverBackgroundColor: (context) => {
            const color = getColor(dataset.backgroundColor ?? 'primary-active', 0.6);
            if (activeBarIndex.value === null) {
                return color;
            }
            return context.dataset.backgroundColor(context);
        }
    }));
    const labels = props.labels.map((label) => label ?? '');
    return {
        labels,
        datasets
    };
}

function setChartOptions() {
    return {
        barPercentage: 1,
        categoryPercentage: props.categoryPercentage,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 100
        },
        hover: {
            animationDuration: 0
        },
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            }
        },
        plugins: {
            tooltip: {
                enabled: false,
                position: 'nearest',
                external: (context) => tooltip(context, props.valueFormatter, 'bar')
            },
            legend: {
                display: false
            },
            title: {
                display: false
            }
        },
        scales: {
            x: {
                stacked: props.stacked,
                type: 'time',
                time: {
                    unit: 'month'
                },
                offset: true,
                grid: {
                    display: props.showXGrid,
                    color: isDarkTheme.value ? getColor('surface-900') : getColor('surface-100')
                },
                ticks: {
                    color: isDarkTheme.value ? getColor('surface-500') : getColor('surface-400'),
                    autoSkip: true,
                    maxRotation: 0,
                    source: 'data',
                    font: {
                        size: 14,
                        family: 'Archivo'
                    },
                    callback: function (value) {
                        return props.xLabelFormatter(value);
                    }
                },
                border: {
                    display: false,
                    dash: [5, 5]
                },
                position: 'bottom'
            },
            y: {
                beginAtZero: props.beginAtZero,
                display: props.showYAxis,
                stacked: props.stacked,
                grid: {
                    display: props.showYGrid,
                    color: isDarkTheme.value ? getColor('surface-900') : getColor('surface-100')
                },
                border: {
                    display: false
                },
                ticks: {
                    maxTicksLimit: props.yStepSize ? undefined : 6,
                    stepSize: props.yStepSize,
                    color: isDarkTheme.value ? getColor('surface-500') : getColor('surface-400'),
                    callback: function (value) {
                        return props.yLabelFormatter(Math.abs(value));
                    },
                    font: {
                        size: 14,
                        family: 'Archivo'
                    }
                }
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const chart = event.chart;
                const clickedIndex = elements[0].index;
                const clickedElement = elements[0];

                const barData = {
                    index: clickedIndex,
                    label: props.labels[clickedIndex],
                    value: props.datasets[clickedElement.datasetIndex].data[clickedIndex],
                    x: clickedElement.element.x,
                    y: clickedElement.element.y,
                    datasetIndex: clickedElement.datasetIndex,
                    active: activeBarIndex.value === clickedIndex ? clickedIndex : null
                };

                if (activeBarIndex.value === clickedIndex) {
                    activeBarIndex.value = null;
                } else {
                    activeBarIndex.value = clickedIndex;
                }

                emit('barClick', barData);

                chart.update('none');
            }
        }
    };
}

const redrawChart = () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
};

watch(
    [() => isDarkTheme.value, () => layoutConfig.surface, () => layoutConfig.primary],
    () => {
        redrawChart();
    },
    { immediate: true }
);

watch(activeBarIndex, () => {
    const chart = chartRef.value?.chart;
    if (chart) {
        chart.update('none');
    }
});

const chartRef = ref(null);
</script>

<template>
    <div class="w-full h-full overflow-auto">
        <Chart ref="chartRef" type="bar" :data="chartData" :plugins="chartPlugins" :options="chartOptions" :class="['w-full cursor-pointer min-h-72 min-w-[600px] pb-2 overflow-hidden', props.class]" />
    </div>
</template>
