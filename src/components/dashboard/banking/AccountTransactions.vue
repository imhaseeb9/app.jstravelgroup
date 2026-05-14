<script setup>
import { CustomCard } from '@/components/ui/custom-card';
import { formatCurrency } from '@/utils';
import { ref } from 'vue';

const selectedTransactions = ref([]);
const transactions = ref([
    {
        id: 1,
        user: {
            name: 'Onyama Limba',
            avatar: {
                fallback: 'OL',
                class: '!bg-rose-200 !text-rose-950'
            }
        },
        date: 'May 24th, 2024',
        amount: {
            value: 7627.9,
            increase: true,
            currency: 'USD'
        },
        status: 'success',
        account: '**** **** 2534'
    },
    {
        id: 2,
        user: {
            name: 'Sarah Wilson',
            avatar: {
                fallback: 'SW',
                class: '!bg-blue-200 !text-blue-950'
            }
        },
        date: 'May 23rd, 2024',
        amount: {
            value: 3450.5,
            increase: false,
            currency: 'USD'
        },
        status: 'pending',
        account: '**** **** 8721'
    },
    {
        id: 3,
        user: {
            name: 'Michael Chen',
            avatar: {
                fallback: 'MC',
                class: '!bg-green-200 !text-green-950'
            }
        },
        date: 'May 23rd, 2024',
        amount: {
            value: 5890.75,
            increase: true,
            currency: 'USD'
        },
        status: 'success',
        account: '**** **** 1459'
    },
    {
        id: 4,
        user: {
            name: 'Emma Thompson',
            avatar: {
                fallback: 'ET',
                class: '!bg-purple-200 !text-purple-950'
            }
        },
        date: 'May 22nd, 2024',
        amount: {
            value: 2175.25,
            increase: false,
            currency: 'USD'
        },
        status: 'failed',
        account: '**** **** 9632'
    },
    {
        id: 5,
        user: {
            name: 'David Rodriguez',
            avatar: {
                fallback: 'DR',
                class: '!bg-amber-200 !text-amber-950'
            }
        },
        date: 'May 22nd, 2024',
        amount: {
            value: 4325.6,
            increase: true,
            currency: 'USD'
        },
        status: 'review',
        account: '**** **** 7845'
    },
    {
        id: 6,
        user: {
            name: 'Lisa Anderson',
            avatar: {
                fallback: 'LA',
                class: '!bg-indigo-200 !text-indigo-950'
            }
        },
        date: 'May 21st, 2024',
        amount: {
            value: 6780.3,
            increase: true,
            currency: 'USD'
        },
        status: 'success',
        account: '**** **** 3698'
    },
    {
        id: 7,
        user: {
            name: 'James Parker',
            avatar: {
                fallback: 'JP',
                class: '!bg-teal-200 !text-teal-950'
            }
        },
        date: 'May 21st, 2024',
        amount: {
            value: 1950.45,
            increase: false,
            currency: 'USD'
        },
        status: 'pending',
        account: '**** **** 4127'
    }
]);

const statusMap = {
    success: 'success',
    pending: 'warn',
    failed: 'danger',
    review: 'secondary'
};
</script>
<template>
    <CustomCard class="col-span-12">
        <CustomCard.Header>
            <CustomCard.Title>Account Transactions</CustomCard.Title>
        </CustomCard.Header>
        <CustomCard.Content class="px-4 py-3">
            <DataTable ref="dt" v-model:selection="selectedTransactions" :value="transactions" dataKey="id" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
                <Column selectionMode="multiple" headerStyle="width: 3rem" />
                <Column field="user" header="Name">
                    <template #body="slotProps">
                        <div class="flex items-center gap-2">
                            <Avatar :image="slotProps.data.user.avatar?.image" :label="slotProps.data.user.avatar?.fallback" size="large" :class="[slotProps.data.user.avatar?.class, '!font-medium !text-base !w-10 !h-10 !rounded-xl']" />
                            <span class="text-lg line-clamp-1">{{ slotProps.data.user.name }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="date" header="Date">
                    <template #body="slotProps">
                        <span class="text-sm text-surface-500">{{ slotProps.data.date }}</span>
                    </template>
                </Column>
                <Column field="amount" header="Amount">
                    <template #body="slotProps">
                        <div class="flex items-center gap-2">
                            <span class="text-lg line-clamp-1 font-semibold">{{ slotProps.data.amount.increase ? '+' : '-' }}{{ formatCurrency(slotProps.data.amount.value, slotProps.data.amount.currency) }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="account" header="Account" />
                <Column field="status" header="Status">
                    <template #body="slotProps">
                        <Tag :severity="statusMap[slotProps.data.status]" :value="slotProps.data.status.charAt(0).toUpperCase() + slotProps.data.status.slice(1)" />
                    </template>
                </Column>
                <Column field="select" headerStyle="width: 3rem">
                    <template #body>
                        <Button icon="pi pi-ellipsis-h" severity="secondary" text />
                    </template>
                </Column>
                <template #paginatorcontainer="{ first, last, page, pageCount, prevPageCallback, nextPageCallback, totalRecords }">
                    <div class="w-full flex items-center justify-between gap-4">
                        <div class="text-sm text-surface-500 font-medium">Shows {{ last - first + 1 }} results of {{ totalRecords }}</div>
                        <div class="flex items-center gap-2">
                            <Button icon="pi pi-chevron-left" rounded text severity="secondary" @click="prevPageCallback" :disabled="page === 0" />

                            <Button icon="pi pi-chevron-right" rounded text severity="secondary" @click="nextPageCallback" :disabled="page === pageCount - 1" />
                        </div>
                    </div>
                </template>
            </DataTable>
        </CustomCard.Content>
    </CustomCard>
</template>
