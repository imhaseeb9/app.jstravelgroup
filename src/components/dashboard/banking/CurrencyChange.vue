<script setup>
import { CustomCard } from '@/components/ui/custom-card';
import { formatCurrency } from '@/utils';
import { Menu } from 'primevue';
import { ref } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    class: {
        type: String,
        default: ''
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
    <CustomCard :class="props.class">
        <CustomCard.Header>
            <CustomCard.Title>{{ data.currency }}</CustomCard.Title>
            <CustomCard.Action>
                <Button type="button" icon="pi pi-ellipsis-h" @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" severity="secondary" text />
                <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="p-5">
            <div class="flex items-center gap-4">
                <div class="text-2xl font-semibold">{{ formatCurrency(data.value, data.currency) }}</div>
                <Tag :severity="data.increase ? 'success' : 'danger'" :value="data.change + '%'" />
            </div>
            <div class="mt-2 flex items-center gap-1 text-sm">
                <div class="text-surface-500">Compared to last month</div>
                <div :class="data.increase ? 'text-green-600' : 'text-red-600'">{{ formatCurrency(data.comparedToLastMonth, data.currency, 2) }}</div>
            </div>
        </CustomCard.Content>
    </CustomCard>
</template>
