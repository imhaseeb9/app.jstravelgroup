<script setup>
import { CustomCard } from '@/components/ui/custom-card';
import { FilterMatchMode } from '@primevue/core/api';
import { ref } from 'vue';

const lastOrders = ref([
    {
        id: '1',
        order: {
            id: '#12546',
            productName: 'Macbook M2 Pro 14inch 16GB Ram 512 GB',
            productImage: '/demo/images/dashboard/macbook-1.png'
        },
        customer: {
            name: 'Jerome Bell',
            avatar: '',
            fallback: 'JB',
            class: '!bg-lime-200 !text-lime-950'
        },
        date: 'Mar 17th, 2024',
        account: '**** **** 8288',
        email: 'jeromebell@gmail.com',
        total: '$1.699,99'
    },
    {
        id: '2',
        order: {
            id: '#12545',
            productName: 'Macbook Air 14inch 8GB Ram 256 GB',
            productImage: '/demo/images/dashboard/macbook-1.png'
        },
        customer: {
            name: 'Annette Black',
            avatar: '',
            fallback: 'AB',
            class: '!bg-lime-200 !text-lime-950'
        },
        date: 'Mar 17th, 2024',
        account: '**** **** 8288',
        email: 'annetteblack@gmail.com',
        total: '$1.699,99'
    },
    {
        id: '3',
        order: {
            id: '#12544',
            productName: 'Macbook M3 Pro 16inch 16GB Ram 512 GB',
            productImage: '/demo/images/dashboard/macbook-1.png'
        },
        customer: {
            name: 'Jenny Wilson',
            avatar: '',
            fallback: 'JW',
            class: '!bg-lime-200 !text-lime-950'
        },
        date: 'Mar 17th, 2024',
        account: '**** **** 8288',
        email: 'jennywilson@gmail.com',
        total: '$1.699,99'
    },
    {
        id: '4',
        order: {
            id: '#12543',
            productName: 'Macbook Air 14inch 16GB Ram 256 GB',
            productImage: '/demo/images/dashboard/macbook-2.png'
        },
        customer: {
            name: 'Leslie Alexander',
            avatar: '',
            fallback: 'LA',
            class: '!bg-rose-200 !text-rose-950'
        },
        date: 'Mar 17th, 2024',
        account: '**** **** 8288',
        email: 'lesliealexander@gmail.com',
        total: '$1.699,99'
    },
    {
        id: '5',
        order: {
            id: '#12542',
            productName: 'Macbook M3 Max 14inch 32GB Ram 1T GB',
            productImage: '/demo/images/dashboard/macbook-2.png'
        },
        customer: {
            name: 'Jenny Wilson',
            avatar: '',
            fallback: 'JW',
            class: '!bg-lime-200 !text-lime-950'
        },
        date: 'Mar 17th, 2024',
        account: '**** **** 8288',
        email: 'jennywilson@gmail.com',
        total: '$1.699,99'
    }
]);

const selectedOrders = ref([]);

const filters = ref();

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

initFilters();
</script>
<template>
    <CustomCard class="col-span-12 overflow-hidden">
        <CustomCard.Header class="pr-2 md:flex-row flex-col max-h-none !items-start">
            <CustomCard.Title>Last Orders</CustomCard.Title>
            <CustomCard.Action class="flex-wrap !justify-normal">
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="filters['global'].value" placeholder="Search" />
                </IconField>
                <Button label="Filter" icon="pi pi-filter" severity="secondary" outlined />
                <Button label="Download" icon="pi pi-download" />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content>
            <DataTable
                v-model:filters="filters"
                v-model:selection="selectedOrders"
                :value="lastOrders"
                dataKey="id"
                tableStyle="min-width: 50rem"
                :globalFilterFields="['order.productName', 'order.id', 'customer.name', 'date', 'account', 'email', 'total']"
            >
                <Column selectionMode="multiple" headerStyle="width: 3rem" />
                <Column field="order" header="Order">
                    <template #body="slotProps">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 overflow-hidden flex items-center justify-center shadow-sm border rounded-xl">
                                <img :src="slotProps.data.order.productImage" :alt="slotProps.data.order.productName" class="w-full h-full object-cover" />
                            </div>
                            <div class="flex-1">
                                <div class="font-medium line-clamp-1">{{ slotProps.data.order.productName }}</div>
                                <div class="mt-1 text-sm text-surface-500">{{ slotProps.data.order.id }}</div>
                            </div>
                        </div>
                    </template>
                </Column>
                <Column field="customer" header="Customer">
                    <template #body="slotProps">
                        <div class="flex items-center gap-2">
                            <Avatar :image="slotProps.data.customer.avatar" :label="slotProps.data.customer.fallback" size="large" :class="[slotProps.data.customer.class, '!font-medium !text-base !w-10 !h-10 !rounded-xl']" />
                            <span class="font-medium line-clamp-1">{{ slotProps.data.customer.name }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="date" header="Date" />
                <Column field="account" header="Account" />
                <Column field="email" header="Email Address" />
                <Column field="total" header="Total" />
                <Column field="select">
                    <template #body>
                        <Button severity="secondary" icon="pi pi-ellipsis-h" text />
                    </template>
                </Column>
            </DataTable>
        </CustomCard.Content>
    </CustomCard>
</template>
