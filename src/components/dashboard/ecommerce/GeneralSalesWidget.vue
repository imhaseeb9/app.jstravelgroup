<script setup>
import BarChart from '@/components/ui/charts/bar-chart.vue';
import { CustomCard } from '@/components/ui/custom-card';
import { Menu } from 'primevue';
import { ref } from 'vue';

const datasets = ref([
    {
        label: 'Sales',
        data: [
            { x: '2023-01', y: 52000 },
            { x: '2023-02', y: 20000 },
            { x: '2023-03', y: 30000 },
            { x: '2023-04', y: 40000 },
            { x: '2023-05', y: 50000 },
            { x: '2023-06', y: 20000 },
            { x: '2023-07', y: 70000 },
            { x: '2023-08', y: 50000 },
            { x: '2023-09', y: 20000 },
            { x: '2023-10', y: 30000 },
            { x: '2023-11', y: 90000 },
            { x: '2023-12', y: 60000 }
        ],
        borderRadius: 8
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
    <CustomCard class="col-span-12 xl:col-span-7 flex flex-col">
        <CustomCard.Header>
            <CustomCard.Title> General Sales </CustomCard.Title>
            <CustomCard.Action>
                <Button type="button" icon="pi pi-ellipsis-h" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" severity="secondary" text />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="p-5 flex-1 flex flex-col gap-8">
            <div class="flex items-start justify-between">
                <div>
                    <div class="flex items-center gap-4">
                        <span class="text-4xl font-semibold">$278,942.12</span>
                        <Tag severity="success" value="12%" />
                    </div>
                    <div class="mt-2 text-surface-500">From <span class="text-green-600 font-medium">$48,157.94 </span></div>
                </div>
            </div>
            <div class="flex-1">
                <BarChart :datasets="datasets" :value-formatter="valueFormatter" :y-label-formatter="yLabelFormatter" class="!min-h-60" />
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
