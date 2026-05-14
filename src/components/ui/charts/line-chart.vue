<script setup>
import { useLayout } from '@/layout/composables/layout';
import { getColor } from '@/utils';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { ref, watch } from 'vue';
import { tooltip } from './tooltip';

const emit = defineEmits(['pointClick']);
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
        default: false
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
    borderColor: {
        type: String,
        default: null
    },
    area: {
        type: Boolean,
        default: false
    },
    showYGrid: {
        type: Boolean,
        default: false
    },
    showXGrid: {
        type: Boolean,
        default: true
    },
    beginAtZero: {
        type: Boolean,
        default: true
    },
    tension: {
        type: Number,
        default: 0.3
    },
    borderWidth: {
        type: Number,
        default: 1.2
    },
    showPoints: {
        type: Boolean,
        default: false
    },
    minY: {
        type: Number,
        default: 0
    },
    maxY: {
        type: Number,
        default: null
    },
    showXBorder: {
        type: Boolean,
        default: false
    },
    showYBorder: {
        type: Boolean,
        default: false
    },
    yStepSize: {
        type: Number,
        default: null
    }
});

const chartPlugins = ref([]);
const chartData = ref({});
const chartOptions = ref({});
const activePointIndex = ref(null);
const { layoutConfig, isDarkTheme } = useLayout();

function setChartPlugins() {
    const hoverLine = {
        id: 'hoverLine',
        afterDraw: (chart) => {
            const { ctx, tooltip, chartArea } = chart;

            if (!tooltip || tooltip.opacity === 0) return;

            const x = tooltip.caretX;

            if (!x) return;

            const { top, bottom } = chartArea;

            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = props.borderWidth;
            ctx.strokeStyle = getColor(isDarkTheme.value ? 'surface-500' : 'surface-400');
            ctx.setLineDash([4, 4]);
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();
            ctx.restore();
        }
    };

    return [hoverLine];
}

function setChartData() {
    const datasets = props.datasets.map((dataset) => ({
        ...dataset,
        fill: props.area,
        tension: props.tension,
        borderWidth: props.borderWidth,
        pointBorderColor: props.showPoints ? getColor(isDarkTheme.value ? 'surface-950' : 'surface-0') : 'rgba(0,0,0,0)',
        pointBackgroundColor: props.showPoints ? getColor(dataset.borderColor ?? 'primary-active') : 'rgba(0,0,0,0)',
        pointHoverBackgroundColor: getColor(dataset.borderColor ?? 'primary-active'),
        pointHoverBorderColor: getColor(isDarkTheme.value ? 'surface-950' : 'surface-0'),
        pointBorderWidth: 1.5,
        pointStyle: 'rect',
        pointRadius: 5,
        pointHoverRadius: 5,
        borderColor: getColor(dataset.borderColor ?? 'primary-active'),
        backgroundColor: props.area
            ? (context) => {
                  const defaultColor = isDarkTheme.value
                      ? [
                            { color: 'surface-0', opacity: 0.24 },
                            { color: 'surface-0', opacity: 0 }
                        ]
                      : [
                            { color: 'surface-950', opacity: 0.24 },
                            { color: 'surface-950', opacity: 0 }
                        ];
                  const bg = dataset.backgroundColor ?? defaultColor;

                  if (!context.chart.chartArea) return;

                  const {
                      ctx,
                      chartArea: { top, bottom }
                  } = context.chart;
                  const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
                  const colorTranches = 1 / (bg.length - 1);

                  bg.forEach((item, index) => {
                      gradientBg.addColorStop(index * colorTranches, getColor(item.color, item.opacity));
                  });

                  return gradientBg;
              }
            : undefined
    }));

    return {
        labels: props.labels,
        datasets
    };
}

function setChartOptions() {
    return {
        interaction: {
            intersect: false,
            mode: 'nearest',
            axis: 'x'
        },
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        hover: {
            animationDuration: 0,
            mode: 'nearest',
            intersect: false,
            axis: 'x'
        },
        responsiveAnimationDuration: 0,
        elements: {
            point: {
                radius: 4,
                hitRadius: 4,
                hoverRadius: 4,
                hoverBorderWidth: 2,
                transition: 0
            }
        },
        layout: {
            padding: 0
        },
        plugins: {
            tooltip: {
                enabled: false,
                position: 'nearest',
                external: (context) => tooltip(context, props.valueFormatter, 'line')
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
                type: 'time',
                time: {
                    unit: 'month'
                },
                grid: {
                    display: props.showXGrid,
                    color: isDarkTheme.value ? getColor('surface-800') : getColor('surface-200'),
                    lineWidth: props.borderWidth
                },
                ticks: {
                    color: isDarkTheme.value ? getColor('surface-500') : getColor('surface-400'),
                    padding: 2,
                    autoSkip: false,
                    maxRotation: 0,
                    source: 'auto',
                    font: {
                        size: 14,
                        family: 'Archivo'
                    },
                    callback: function (value) {
                        return props.xLabelFormatter(value);
                    }
                },
                border: {
                    display: props.showXBorder
                }
            },
            y: {
                beginAtZero: props.beginAtZero,
                display: props.showYAxis,
                min: props.minY,
                max: props.maxY,
                grid: {
                    display: props.showYGrid,
                    color: isDarkTheme.value ? getColor('surface-800') : getColor('surface-200'),
                    lineWidth: props.borderWidth
                },
                ticks: {
                    color: isDarkTheme.value ? getColor('surface-500') : getColor('surface-400'),
                    stepSize: props.yStepSize,
                    callback: function (value) {
                        return props.yLabelFormatter(value);
                    },
                    font: {
                        size: 14,
                        family: 'Archivo'
                    }
                },
                border: {
                    display: props.showYBorder
                }
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const clickedIndex = elements[0].index;
                activePointIndex.value = activePointIndex.value === clickedIndex ? null : clickedIndex;
                emit('pointClick', {
                    index: clickedIndex,
                    value: props.datasets[elements[0].datasetIndex].data[clickedIndex],
                    active: activePointIndex.value === clickedIndex
                });
            }
        }
    };
}

const redrawChart = () => {
    chartPlugins.value = setChartPlugins();
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

const chartRef = ref(null);
</script>

<template>
    <Chart ref="chartRef" type="line" :data="chartData" :plugins="chartPlugins" :options="chartOptions" :class="['h-full w-full cursor-pointer', props.class]" />
</template>
