<script setup>
import LineChart from '@/components/ui/charts/line-chart.vue';
import { CustomCard } from '@/components/ui/custom-card';
import { ref } from 'vue';

const chartData = ref([
    {
        label: 'Facebook',
        data: [
            { x: '2024-01-01', y: 145670 },
            { x: '2024-02-01', y: 167890 },
            { x: '2024-03-01', y: 189450 },
            { x: '2024-04-01', y: 212340 },
            { x: '2024-05-01', y: 174560 },
            { x: '2024-06-01', y: 156780 },
            { x: '2024-07-01', y: 198450 },
            { x: '2024-08-01', y: 223670 },
            { x: '2024-09-01', y: 187890 },
            { x: '2024-10-01', y: 165430 },
            { x: '2024-11-01', y: 198760 },
            { x: '2024-12-01', y: 234560 }
        ],
        borderColor: 'blue-600',
        backgroundColor: [
            { color: 'blue-600', opacity: 0.12 },
            { color: 'blue-600', opacity: 0 }
        ]
    },
    {
        label: 'Instagram',
        data: [
            { x: '2024-01-01', y: 345670 },
            { x: '2024-02-01', y: 397890 },
            { x: '2024-03-01', y: 389450 },
            { x: '2024-04-01', y: 412340 },
            { x: '2024-05-01', y: 474560 },
            { x: '2024-06-01', y: 456780 },
            { x: '2024-07-01', y: 423670 },
            { x: '2024-08-01', y: 445890 },
            { x: '2024-09-01', y: 467890 },
            { x: '2024-10-01', y: 489450 },
            { x: '2024-11-01', y: 478900 },
            { x: '2024-12-01', y: 492340 }
        ],
        borderColor: 'pink-600',
        backgroundColor: [
            { color: 'pink-600', opacity: 0.12 },
            { color: 'pink-600', opacity: 0 }
        ]
    },
    {
        label: 'Twitter',
        data: [
            { x: '2024-01-01', y: 289450 },
            { x: '2024-02-01', y: 312340 },
            { x: '2024-03-01', y: 334560 },
            { x: '2024-04-01', y: 356780 },
            { x: '2024-05-01', y: 378900 },
            { x: '2024-06-01', y: 391230 },
            { x: '2024-07-01', y: 367890 },
            { x: '2024-08-01', y: 345670 },
            { x: '2024-09-01', y: 389450 },
            { x: '2024-10-01', y: 412340 },
            { x: '2024-11-01', y: 389760 },
            { x: '2024-12-01', y: 401230 }
        ],
        borderColor: 'violet-600',
        backgroundColor: [
            { color: 'violet-600', opacity: 0.12 },
            { color: 'violet-600', opacity: 0 }
        ]
    }
]);

const chartLegend = ref([
    {
        label: 'Facebook',
        color: 'blue-600',
        value: 327812,
        increase: true,
        icon: 'pi pi-facebook'
    },
    {
        label: 'Instagram',
        color: 'pink-600',
        value: 384162,
        increase: true,
        icon: 'pi pi-instagram'
    },
    {
        label: 'Twitter',
        color: 'violet-600',
        value: 384162,
        increase: true,
        icon: 'pi pi-twitter'
    }
]);

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
            <CustomCard.Title>Social Media Performance</CustomCard.Title>
            <CustomCard.Action>
                <Select v-model="selectedPeriod" :options="periods" optionLabel="name" placeholder="Select a Period" class="w-full md:w-40" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="flex flex-col">
            <div class="p-5 flex gap-4 border-b md:flex-row flex-col">
                <template v-for="(item, index) of chartLegend" :key="index">
                    <div class="flex-1 flex items-center gap-2">
                        <div class="w-12 h-12 flex items-center justify-center rounded-xl shadow-stroke">
                            <i :class="item.icon" class="!text-xl" :style="{ color: `var(--p-${item.color})` }" />
                        </div>
                        <div class="flex-1 flex flex-col">
                            <span class="text-sm text-surface-500">{{ item.label }}</span>
                            <div class="mt-1 flex items-center gap-1">
                                <span class="text-xl font-medium">{{ item.value.toLocaleString() }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="index !== chartLegend.length - 1" class="md:w-px w-full md:h-full h-px bg-surface-200 dark:bg-surface-800" />
                </template>
            </div>
            <div class="flex-1 p-4">
                <LineChart class="min-h-72" :datasets="chartData" :tension="0.4" :maxY="500000" :yStepSize="100000" :showXBorder="false" :area="true" :showXGrid="false" :showYGrid="true" :showYAxis="true" :yLabelFormatter="yLabelFormatter" />
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
