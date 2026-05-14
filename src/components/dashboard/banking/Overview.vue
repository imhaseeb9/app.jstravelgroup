<script setup>
import ChartDown from '@/components/icons/ChartDown.vue';
import ChartUp from '@/components/icons/ChartUp.vue';
import BarChart from '@/components/ui/charts/bar-chart.vue';
import { CustomCard } from '@/components/ui/custom-card';
import { formatCurrency } from '@/utils';
import { Menu } from 'primevue';
import { markRaw, ref } from 'vue';

const data = ref({
    week: {
        value: 278942.12,
        from: 48157.94,
        increase: true,
        percent: 4,
        datasets: []
    },
    month: {
        value: 228942.12,
        from: 38157.94,
        increase: true,
        percent: 40,
        datasets: []
    },
    year: {
        value: 328942.12,
        from: 128157.94,
        increase: true,
        percent: 18,
        datasets: []
    }
});
const selectedTime = ref({ name: 'Weekly', value: 'week' });
const options = ref([
    { name: 'Weekly', value: 'week' },
    { name: 'Monthly', value: 'month' },
    { name: 'Yearly', value: 'year' }
]);

const chartData = ref([
    {
        label: 'Income',
        data: [
            { x: '2024-01-01', y: 10000 },
            { x: '2024-02-01', y: 19000 },
            { x: '2024-03-01', y: 12000 },
            { x: '2024-04-01', y: 15000 },
            { x: '2024-05-01', y: 3000 },
            { x: '2024-06-01', y: 16000 },
            { x: '2024-07-01', y: 4000 },
            { x: '2024-08-01', y: 8000 },
            { x: '2024-09-01', y: 17000 },
            { x: '2024-10-01', y: 12000 },
            { x: '2024-11-01', y: 10000 },
            { x: '2024-12-01', y: 10000 }
        ]
    },
    {
        label: 'Expenses',
        data: [
            { x: '2024-01-01', y: -12000 },
            { x: '2024-02-01', y: -6000 },
            { x: '2024-03-01', y: -17000 },
            { x: '2024-04-01', y: -15000 },
            { x: '2024-05-01', y: -8000 },
            { x: '2024-06-01', y: -14000 },
            { x: '2024-07-01', y: -4000 },
            { x: '2024-08-01', y: -12000 },
            { x: '2024-09-01', y: -10000 },
            { x: '2024-10-01', y: -17000 },
            { x: '2024-11-01', y: -4000 },
            { x: '2024-12-01', y: -15000 }
        ],
        backgroundColor: 'orange-600'
    }
]);

const chartLegend = ref([
    {
        label: 'Income',
        backgroundColor: 'blue-600',
        icon: markRaw(ChartUp),
        value: 178232.03,
        increase: true,
        percent: 52,
        iconClass: '[&_svg]:fill-blue-600'
    },
    {
        label: 'Expenses',
        backgroundColor: 'orange-600',
        icon: markRaw(ChartDown),
        value: 59723.12,
        increase: false,
        percent: 12,
        iconClass: '[&_svg]:fill-orange-600'
    }
]);

const valueFormatter = (value) => {
    return `$${value.toLocaleString()}`;
};

const yLabelFormatter = (value) => {
    return value >= 1000 ? `${Math.round(value / 1000)}K` : value;
};

const menu = ref();
const items = ref([
    {
        label: 'Options',
        items: [
            {
                label: 'Refresh',
                icon: 'pi pi-refresh'
            },
            {
                label: 'Export',
                icon: 'pi pi-upload'
            }
        ]
    }
]);

const toggle = (event) => {
    menu.value.toggle(event);
};
</script>

<template>
    <CustomCard class="col-span-12 xl:col-span-8 row-span-1">
        <CustomCard.Header>
            <CustomCard.Title>Overview</CustomCard.Title>
            <CustomCard.Action>
                <Button type="button" icon="pi pi-ellipsis-h" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" severity="secondary" text />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="flex flex-col">
            <div class="p-5 flex items-start justify-between md:flex-row flex-col-reverse gap-4">
                <div>
                    <div class="flex items-center gap-4">
                        <div class="text-4xl font-semibold">{{ formatCurrency(data[selectedTime.value].value, 'USD') }}</div>
                        <Tag :severity="data[selectedTime.value].increase ? 'success' : 'danger'" :value="data[selectedTime.value].percent + '%'" />
                    </div>
                    <div class="mt-2 flex items-center gap-1">
                        <span class="text-surface-500">From</span>
                        <span class="font-medium" :class="{ 'text-green-600': data[selectedTime.value].increase, 'text-red-600': !data[selectedTime.value].increase }">{{ formatCurrency(data[selectedTime.value].from, 'USD') }}</span>
                    </div>
                </div>
                <SelectButton v-model="selectedTime" :options="options" optionLabel="name" />
            </div>
            <div class="flex-1 p-4 max-h-80">
                <BarChart :datasets="chartData" :valueFormatter="valueFormatter" :yLabelFormatter="yLabelFormatter" :showYGrid="true" :showXGrid="true" :beginAtZero="true" />
            </div>
            <div class="p-5 flex gap-10 border-t md:flex-row flex-col">
                <template v-for="(item, index) of chartLegend" :key="index">
                    <div class="sm:flex-1 flex items-center gap-4">
                        <div class="w-14 h-14 flex items-center justify-center rounded-xl shadow-stroke" :class="item.iconClass">
                            <component :is="item.icon" />
                        </div>
                        <div class="flex-1 flex flex-col">
                            <span class="text-surface-500">{{ item.label }}</span>
                            <div class="flex items-center gap-1">
                                <span class="text-xl font-semibold">{{ formatCurrency(item.value, 'USD') }}</span>
                                <i class="pi !text-sm" :class="{ 'text-green-600 pi-arrow-up-right': item.increase, 'text-orange-600 pi-arrow-down-right': !item.increase }" />
                                <span class="font-medium" :class="{ 'text-green-600': item.increase, 'text-orange-600': !item.increase }">{{ item.percent }}%</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="index !== chartLegend.length - 1" class="md:w-px w-full md:h-full h-px bg-surface-200 dark:bg-surface-800" />
                </template>
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
