<script setup>
import { CustomCard } from '@/components/ui/custom-card';
import { Menu } from 'primevue';
import { ref, watch } from 'vue';

const inputCurrency = ref('EUR');
const outputCurrency = ref('USD');
const inputAmount = ref(0);
const outputAmount = ref(0);
const currentRate = ref(0.9235);
const transferFee = ref(1.32);

watch(inputAmount, (newValue) => {
    if (inputCurrency.value === 'EUR' && outputCurrency.value === 'USD') {
        outputAmount.value = newValue / currentRate.value;
    } else if (inputCurrency.value === 'USD' && outputCurrency.value === 'EUR') {
        outputAmount.value = newValue * currentRate.value;
    }
});

watch(outputAmount, (newValue) => {
    if (inputCurrency.value === 'EUR' && outputCurrency.value === 'USD') {
        inputAmount.value = newValue * currentRate.value;
    } else if (inputCurrency.value === 'USD' && outputCurrency.value === 'EUR') {
        inputAmount.value = newValue / currentRate.value;
    }
});

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
    <CustomCard class="col-span-12 xl:col-span-4 row-span-1">
        <CustomCard.Header>
            <CustomCard.Title>Global Transfer</CustomCard.Title>
            <CustomCard.Action>
                <Button type="button" icon="pi pi-ellipsis-h" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" severity="secondary" text />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content>
            <div class="p-4">
                <div class="text-sm font-medium mb-2">Input Amount</div>
                <InputNumber v-model="inputAmount" mode="currency" :currency="inputCurrency" locale="en-US" fluid />
                <div class="my-4 flex items-center gap-2">
                    <Divider class="!flex-1" />
                    <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-stroke">
                        <i class="pi pi-arrow-right-arrow-left !text-xs" />
                    </div>
                    <Divider class="!flex-1" />
                </div>
                <InputNumber v-model="outputAmount" mode="currency" :currency="outputCurrency" locale="en-US" fluid />
                <div class="mt-8 space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="text-surface-500">Current Rate</div>
                        <div class="font-medium">1 {{ inputCurrency }} = {{ currentRate.toFixed(4) }} {{ outputCurrency }}</div>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="text-surface-500">Transfer Fee</div>
                        <div class="font-medium">{{ transferFee.toFixed(2) }} {{ inputCurrency }}</div>
                    </div>
                </div>
            </div>
            <div class="border-t p-4 flex items-center justify-between">
                <div>
                    <div class="text-surface-500">Total you pay</div>
                    <div class="font-medium mt-1">{{ (inputAmount + transferFee).toFixed(2) }} {{ inputCurrency }}</div>
                </div>
                <Button label="Convert" icon="pi pi-replay" />
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
