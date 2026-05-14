<script setup>
import LineChart from '@/components/ui/charts/line-chart.vue';
import { CustomCard } from '@/components/ui/custom-card';
import { ref } from 'vue';

const chartData = ref([
    {
        label: 'Visitor',
        data: [
            { x: '2024-01-01', y: 6743 },
            { x: '2024-02-01', y: 8218 },
            { x: '2024-03-01', y: 7890 },
            { x: '2024-04-01', y: 7345 },
            { x: '2024-05-01', y: 8678 },
            { x: '2024-06-01', y: 8457 },
            { x: '2024-07-01', y: 8901 },
            { x: '2024-08-01', y: 8234 },
            { x: '2024-09-01', y: 7567 },
            { x: '2024-10-01', y: 8890 },
            { x: '2024-11-01', y: 8345 },
            { x: '2024-12-01', y: 8789 }
        ],
        borderColor: 'primary-active',
        backgroundColor: [
            { color: 'primary-active', opacity: 0.15 },
            { color: 'primary-active', opacity: 0 }
        ]
    },
    {
        label: 'Customer',
        data: [
            { x: '2024-01-01', y: 5432 },
            { x: '2024-02-01', y: 4765 },
            { x: '2024-03-01', y: 5210 },
            { x: '2024-04-01', y: 4543 },
            { x: '2024-05-01', y: 5109 },
            { x: '2024-06-01', y: 4654 },
            { x: '2024-07-01', y: 4321 },
            { x: '2024-08-01', y: 4765 },
            { x: '2024-09-01', y: 5098 },
            { x: '2024-10-01', y: 4432 },
            { x: '2024-11-01', y: 4907 },
            { x: '2024-12-01', y: 5210 }
        ],
        borderColor: 'orange-600',
        backgroundColor: [
            { color: 'orange-600', opacity: 0.15 },
            { color: 'orange-600', opacity: 0 }
        ]
    }
]);

const chartLegend = ref([
    {
        label: 'Visitor',
        backgroundColorClass: 'bg-primary-active'
    },
    {
        label: 'Customer',
        backgroundColorClass: 'bg-orange-600'
    }
]);
const selectedPeriod = ref({ name: 'Yearly', code: 'yearly' });
const periods = ref([
    { name: 'Yearly', code: 'yearly' },
    { name: 'Monthly', code: 'monthly' },
    { name: 'Weekly', code: 'weekly' },
    { name: 'Daily', code: 'daily' }
]);
</script>
<template>
    <CustomCard class="col-span-12 xl:col-span-6">
        <CustomCard.Header class="!max-h-none xl:flex-row flex-col !items-start xl:!items-center">
            <CustomCard.Title>Visitor Conversion</CustomCard.Title>
            <CustomCard.Action class="justify-between w-full xl:w-auto">
                <div class="flex items-center gap-4">
                    <div v-for="item in chartLegend" :key="item.label" class="flex items-center gap-1.5">
                        <div class="w-3 h-3 rounded-[4px]" :class="item?.backgroundColorClass ?? 'bg-primary-active'" />
                        <span class="text-sm font-medium">{{ item.label }}</span>
                    </div>
                </div>
                <Select v-model="selectedPeriod" :options="periods" optionLabel="name" placeholder="Select a Period" class="w-full md:w-40" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="p-4">
            <LineChart class="min-h-72" :datasets="chartData" :tension="0.4" :showXGrid="false" :showXBorder="true" :minY="2000" :area="true" />
        </CustomCard.Content>
    </CustomCard>
</template>
