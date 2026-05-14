<script setup>
import { CustomCard } from '@/components/ui/custom-card';
import { Menu } from 'primevue';
import { onMounted, ref } from 'vue';

const satisfactionData = ref([
    { color: 'bg-primary-active', label: 'Total Customers', value: 0.56 },
    { color: 'bg-orange-600', label: 'Paid Customers', value: 0.38 },
    { color: 'bg-surface-200 dark:bg-surface-800', label: 'Excellent', value: 0.06 }
]);

const weeklyGoal = ref(5000);
const legendData = ref();

const numberOfColumns = ref(48);
const columnData = ref([]);

onMounted(() => {
    const width = document.documentElement.clientWidth;
    if (width < 768) {
        numberOfColumns.value = 24;
    }
    prepareColumnData();
    prepareLegendData();
});

function prepareColumnData() {
    let remaining = numberOfColumns.value;
    columnData.value = satisfactionData.value.map((item, index) => {
        if (index < satisfactionData.value.length - 1) {
            const cols = Math.floor(item.value * numberOfColumns.value);
            remaining -= cols;
            return { ...item, numberOfColumns: Math.max(cols, 5) };
        }
        return { ...item, numberOfColumns: Math.max(remaining, 5) };
    });
}

function prepareLegendData() {
    legendData.value = satisfactionData.value.map((item) => {
        return {
            ...item,
            count: Math.floor(weeklyGoal.value * item.value).toLocaleString()
        };
    });
}

const menu = ref();
const items = ref([
    {
        label: 'Options',
        items: [
            { label: 'Refresh', icon: 'pi pi-refresh' },
            { label: 'Export', icon: 'pi pi-upload' }
        ]
    }
]);

const toggle = (event) => {
    menu.value.toggle(event);
};
</script>

<template>
    <CustomCard class="col-span-12 xl:col-span-5">
        <CustomCard.Header>
            <CustomCard.Title>Customer Satisfaction</CustomCard.Title>
            <CustomCard.Action>
                <Button type="button" icon="pi pi-ellipsis-h" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" severity="secondary" text />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="p-5 flex flex-col">
            <div class="flex items-start gap-6">
                <template v-for="(item, index) of legendData" :key="index">
                    <div v-if="index < satisfactionData.length - 1" class="flex gap-1">
                        <span class="w-[3px] rounded-full" :class="item.color" />
                        <div class="flex-1">
                            <div class="font-semibold leading-none">{{ item?.count }}</div>
                            <div class="text-sm text-surface-500 mt-2 leading-none">{{ item.label }}</div>
                        </div>
                    </div>
                </template>
            </div>
            <div class="mt-6">
                <div class="text-surface-500 text-sm">Weekly Goal</div>
                <div class="flex items-center gap-2">
                    <span class="text-3xl font-semibold">{{ weeklyGoal }}</span>
                    <Tag severity="success" value="12%" />
                </div>
            </div>
            <div class="flex-1 min-h-48 w-full flex items-end gap-1">
                <template v-for="column in columnData" :key="column.label">
                    <div v-for="n in column.numberOfColumns" :key="n" :class="['h-16 hover:h-20 flex-1 w-2 rounded-[1px] transition-all duration-[0.05s] ease-in', column.color]" />
                    <div :class="['h-48 w-px relative', column.color]">
                        <span class="absolute top-0 right-2 font-medium text-surface-500">{{ Number(column.value * 100).toFixed(0) }}%</span>
                    </div>
                </template>
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
