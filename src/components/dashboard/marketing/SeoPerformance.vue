<script setup>
import Key from '@/components/icons/Key.vue';
import Payment from '@/components/icons/Payment.vue';
import LineChart from '@/components/ui/charts/line-chart.vue';
import { CustomCard } from '@/components/ui/custom-card';
import { markRaw, ref } from 'vue';

const chartData = ref([
    {
        label: 'Traffic sources',
        data: [
            { x: '2024-01-01', y: 245670 },
            { x: '2024-02-01', y: 197890 },
            { x: '2024-03-01', y: 289450 },
            { x: '2024-04-01', y: 312340 },
            { x: '2024-05-01', y: 274560 },
            { x: '2024-06-01', y: 456780 }
        ],
        borderColor: 'primary-active',
        backgroundColor: [
            { color: 'primary-active', opacity: 0.15 },
            { color: 'primary-active', opacity: 0 }
        ]
    },
    {
        label: 'Keyword rankings',
        data: [
            { x: '2024-01-01', y: 89450 },
            { x: '2024-02-01', y: 112340 },
            { x: '2024-03-01', y: 234560 },
            { x: '2024-04-01', y: 156780 },
            { x: '2024-05-01', y: 378900 },
            { x: '2024-06-01', y: 291230 }
        ],
        borderColor: 'red-600',
        backgroundColor: [
            { color: 'red-600', opacity: 0.15 },
            { color: 'red-600', opacity: 0 }
        ]
    }
]);

const chartLegend = ref([
    {
        label: 'Traffic sources',
        color: 'primary-active',
        value: 327812,
        percent: 32,
        increase: true,
        icon: markRaw(Payment),
        iconClass: '[&_svg]:fill-primary-active'
    },
    {
        label: 'Keyword rankings',
        color: 'red-600',
        value: 384162,
        percent: 5,
        increase: true,
        icon: markRaw(Key),
        iconClass: '[&_svg]:fill-red-600'
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
            <CustomCard.Title>SEO Performance</CustomCard.Title>
            <CustomCard.Action>
                <Select v-model="selectedPeriod" :options="periods" optionLabel="name" placeholder="Select a Period" class="w-full md:w-40" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="flex flex-col">
            <div class="p-5 flex gap-10 border-b md:flex-row flex-col">
                <template v-for="(item, index) of chartLegend" :key="index">
                    <div class="flex-1 flex items-center gap-3">
                        <div class="w-12 h-12 flex items-center justify-center rounded-xl shadow-stroke" :class="item.iconClass">
                            <component :is="item.icon" />
                        </div>
                        <div class="flex-1 flex flex-col">
                            <span class="text-surface-500 text-sm">{{ item.label }}</span>
                            <div class="mt-1 flex items-center gap-1">
                                <span class="text-xl font-medium">{{ item.value.toLocaleString() }}</span>
                                <Tag :severity="item.increase ? 'success' : 'danger'" :value="item.percent + '%'" />
                            </div>
                        </div>
                    </div>
                    <div v-if="index !== chartLegend.length - 1" class="md:w-px w-full md:h-full h-px bg-surface-200 dark:bg-surface-800" />
                </template>
            </div>
            <div class="flex-1 p-4">
                <LineChart
                    class="min-h-72"
                    :datasets="chartData"
                    :tension="0.4"
                    :maxY="500000"
                    :yStepSize="100000"
                    :showXBorder="false"
                    :minY="2000"
                    :area="true"
                    :showXGrid="true"
                    :showYGrid="true"
                    :showYAxis="true"
                    :yLabelFormatter="yLabelFormatter"
                />
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
