<script setup>
import ChartDown from '@/components/icons/ChartDown.vue';
import ChartUp from '@/components/icons/ChartUp.vue';
import { CustomCard } from '@/components/ui/custom-card';
import { formatCurrency } from '@/utils';
import { markRaw, ref } from 'vue';

const salesChartData = ref([
    {
        label: 'Income',
        data: [
            { x: '2024-01-01', y: 674320 },
            { x: '2024-02-01', y: 421890 },
            { x: '2024-03-01', y: 789010 },
            { x: '2024-04-01', y: 234560 },
            { x: '2024-05-01', y: 567890 },
            { x: '2024-06-01', y: 345670 },
            { x: '2024-07-01', y: 890120 },
            { x: '2024-08-01', y: 123450 },
            { x: '2024-09-01', y: 456780 },
            { x: '2024-10-01', y: 789010 },
            { x: '2024-11-01', y: 234560 },
            { x: '2024-12-01', y: 678900 }
        ],
        backgroundColor: 'primary-active'
    },
    {
        label: 'Expenses',
        data: [
            { x: '2024-01-01', y: -543210 },
            { x: '2024-02-01', y: -876540 },
            { x: '2024-03-01', y: -321090 },
            { x: '2024-04-01', y: -654320 },
            { x: '2024-05-01', y: -210980 },
            { x: '2024-06-01', y: -765430 },
            { x: '2024-07-01', y: -432100 },
            { x: '2024-08-01', y: -876540 },
            { x: '2024-09-01', y: -109870 },
            { x: '2024-10-01', y: -543210 },
            { x: '2024-11-01', y: -890760 },
            { x: '2024-12-01', y: -321090 }
        ],
        backgroundColor: 'red-600'
    }
]);

const salesChartLegend = ref([
    {
        label: 'Income',
        value: 1248583,
        increase: true,
        percent: 18,
        icon: markRaw(ChartUp),
        iconClass: '[&_svg]:fill-primary-active'
    },
    {
        label: 'Expenses',
        value: 782812,
        increase: false,
        percent: 12,
        icon: markRaw(ChartDown),
        iconClass: '[&_svg]:fill-red-600'
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
    <CustomCard class="col-span-12 xl:col-span-6">
        <CustomCard.Header>
            <CustomCard.Title>Sales Data</CustomCard.Title>
            <CustomCard.Action>
                <Select v-model="selectedPeriod" :options="periods" optionLabel="name" placeholder="Select a Period" class="w-full md:w-40" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="flex flex-col">
            <div class="p-5 flex gap-10 border-b md:flex-row flex-col">
                <template v-for="(item, index) of salesChartLegend" :key="index">
                    <div class="flex-1 flex items-center gap-3">
                        <div class="w-12 h-12 flex items-center justify-center rounded-xl shadow-stroke" :class="item.iconClass">
                            <component :is="item.icon" />
                        </div>
                        <div class="flex-1 flex flex-col">
                            <span class="text-surface-500 text-sm">{{ item.label }}</span>
                            <div class="mt-1 flex items-center gap-1">
                                <span class="text-xl font-medium">{{ formatCurrency(item.value, 'USD') }}</span>
                                <Tag :severity="item.increase ? 'success' : 'danger'" :value="item.percent + '%'" />
                            </div>
                        </div>
                    </div>
                    <div v-if="index !== salesChartLegend.length - 1" class="md:w-px w-full md:h-full h-px bg-surface-200 dark:bg-surface-800" />
                </template>
            </div>
            <div class="flex-1 p-4">
                <BarChart class="min-h-80" :yStepSize="300000" :datasets="salesChartData" :valueFormatter="valueFormatter" :yLabelFormatter="yLabelFormatter" :showYGrid="true" :showXGrid="true" :beginAtZero="true" />
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
