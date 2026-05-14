<script setup>
import BarChart from '@/components/ui/charts/bar-chart.vue';
import { CustomCard } from '@/components/ui/custom-card';
import { ref } from 'vue';

const chartData = ref([
    {
        label: 'Income',
        data: [
            { x: '2024-01-01', y: 67432 },
            { x: '2024-02-01', y: 42189 },
            { x: '2024-03-01', y: 78901 },
            { x: '2024-04-01', y: 23456 },
            { x: '2024-05-01', y: 56789 },
            { x: '2024-06-01', y: 34567 },
            { x: '2024-07-01', y: 89012 },
            { x: '2024-08-01', y: 12345 },
            { x: '2024-09-01', y: 45678 },
            { x: '2024-10-01', y: 78901 },
            { x: '2024-11-01', y: 23456 },
            { x: '2024-12-01', y: 67890 }
        ]
    },
    {
        label: 'Expenses',
        data: [
            { x: '2024-01-01', y: 54321 },
            { x: '2024-02-01', y: 87654 },
            { x: '2024-03-01', y: 32109 },
            { x: '2024-04-01', y: 65432 },
            { x: '2024-05-01', y: 21098 },
            { x: '2024-06-01', y: 76543 },
            { x: '2024-07-01', y: 43210 },
            { x: '2024-08-01', y: 87654 },
            { x: '2024-09-01', y: 10987 },
            { x: '2024-10-01', y: 54321 },
            { x: '2024-11-01', y: 89076 },
            { x: '2024-12-01', y: 32109 }
        ],
        backgroundColor: 'violet-500',
        backgroundColorClass: 'bg-violet-500'
    }
]);

const legendData = ref([
    {
        label: 'Income',
        backgroundColorClass: 'bg-primary-active'
    },
    {
        label: 'Expenses',
        backgroundColorClass: 'bg-violet-500'
    }
]);
const valueFormatter = (value) => {
    return `$${value.toLocaleString()}`;
};

const yLabelFormatter = (value) => {
    return value >= 1000 ? `${Math.round(value / 1000)}K` : value;
};

const selectedPeriod = ref({ name: 'Yearly', code: 'yearly' });
const periods = ref([
    { name: 'Yearly', code: 'yearly' },
    { name: 'Monthly', code: 'monthly' },
    { name: 'Weekly', code: 'weekly' },
    { name: 'Daily', code: 'daily' }
]);
</script>

<template>
    <CustomCard class="col-span-12">
        <CustomCard.Header class="!max-h-none xl:flex-row flex-col !items-start xl:!items-center">
            <CustomCard.Title>Overall Performance Summary</CustomCard.Title>
            <CustomCard.Action class="w-full xl:w-auto justify-between">
                <div class="flex items-center gap-6">
                    <div v-for="item in legendData" :key="item.label" class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-[4px]" :class="item?.backgroundColorClass ?? 'bg-primary-active'" />
                        <span class="text-sm font-medium">{{ item.label }}</span>
                    </div>
                </div>
                <Select v-model="selectedPeriod" :options="periods" optionLabel="name" placeholder="Select a Period" class="w-full md:w-40" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="p-4">
            <BarChart class="!min-w-[720px]" :datasets="chartData" :categoryPercentage="0.6" :valueFormatter="valueFormatter" :yLabelFormatter="yLabelFormatter" :showYGrid="true" :stacked="false" />
        </CustomCard.Content>
    </CustomCard>
</template>
