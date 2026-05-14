<script setup>
import Email from '@/components/icons/Email.vue';
import EmailNotification from '@/components/icons/EmailNotification.vue';
import LineChart from '@/components/ui/charts/line-chart.vue';
import { CustomCard } from '@/components/ui/custom-card';
import { markRaw, ref } from 'vue';

const chartData = ref([
    {
        label: 'Click Through Rate',
        data: [
            { x: '2024-01-01', y: 345670 },
            { x: '2024-02-01', y: 287890 },
            { x: '2024-03-01', y: 189450 },
            { x: '2024-04-01', y: 212340 },
            { x: '2024-05-01', y: 234560 },
            { x: '2024-06-01', y: 256780 },
            { x: '2024-07-01', y: 298450 },
            { x: '2024-08-01', y: 423670 },
            { x: '2024-09-01', y: 487890 },
            { x: '2024-10-01', y: 465430 },
            { x: '2024-11-01', y: 398760 },
            { x: '2024-12-01', y: 334560 }
        ],
        borderColor: 'primary-active',
        backgroundColor: [
            { color: 'primary-active', opacity: 0.12 },
            { color: 'primary-active', opacity: 0 }
        ]
    },
    {
        label: 'Open Rate',
        data: [
            { x: '2024-01-01', y: 189450 },
            { x: '2024-02-01', y: 312340 },
            { x: '2024-03-01', y: 434560 },
            { x: '2024-04-01', y: 456780 },
            { x: '2024-05-01', y: 478900 },
            { x: '2024-06-01', y: 491230 },
            { x: '2024-07-01', y: 467890 },
            { x: '2024-08-01', y: 345670 },
            { x: '2024-09-01', y: 289450 },
            { x: '2024-10-01', y: 312340 },
            { x: '2024-11-01', y: 389760 },
            { x: '2024-12-01', y: 401230 }
        ],
        borderColor: 'emerald-500',
        backgroundColor: [
            { color: 'emerald-500', opacity: 0.12 },
            { color: 'emerald-500', opacity: 0 }
        ]
    }
]);

const chartLegend = ref([
    {
        label: 'Click Through Rate',
        color: 'primary-active',
        value: 24923,
        percent: 3,
        increase: true,
        icon: markRaw(Email),
        iconClass: '[&_svg]:fill-primary-active'
    },
    {
        label: 'Open Rate',
        color: 'emerald-500',
        value: 19581,
        percent: 5,
        increase: true,
        icon: markRaw(EmailNotification),
        iconClass: '[&_svg]:fill-emerald-500'
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
        <CustomCard.Header>
            <CustomCard.Title>Email Marketing</CustomCard.Title>
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
                <LineChart class="h-72" :datasets="chartData" :tension="0.3" :maxY="500000" :yStepSize="100000" :showXBorder="true" :area="true" :showXGrid="true" :showYGrid="false" :showYAxis="false" />
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
