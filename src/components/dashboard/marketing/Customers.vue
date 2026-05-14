<script setup>
import { CustomCard } from '@/components/ui/custom-card';
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
        email: 'hi@onyamalimba.co',
        date: 'May 5th, 2024',
        platform: 'Facebook',
        company: 'NovaVista'
    },
    {
        id: 2,
        user: {
            name: 'Courtney Henry',
            avatar: {
                fallback: 'CH',
                class: '!bg-blue-200 !text-blue-950'
            }
        },
        email: 'hi@courtneyhenry.com',
        date: 'May 7th, 2024',
        platform: 'Facebook',
        company: 'ZenithWorks'
    },
    {
        id: 3,
        user: {
            name: 'Jerome Bell',
            avatar: {
                fallback: 'JB',
                class: '!bg-green-200 !text-green-950'
            }
        },
        email: 'jeromebell@gmail.com',
        date: 'May 14th, 2024',
        platform: 'Twitter',
        company: 'BlueLeaf Solutions'
    },
    {
        id: 4,
        user: {
            name: 'Annette Black',
            avatar: {
                fallback: 'AB',
                class: '!bg-purple-200 !text-purple-950'
            }
        },
        email: 'hi@annetteblack.com',
        date: 'May 17th, 2024',
        platform: 'Facebook',
        company: 'VirtuoCreat'
    },
    {
        id: 5,
        user: {
            name: 'Dennis Russell',
            avatar: {
                fallback: 'DR',
                class: '!bg-amber-200 !text-amber-950'
            }
        },
        email: 'hi@dennisrussell.com',
        date: 'May 25th, 2024',
        platform: 'Instagram',
        company: 'LuminaTech'
    },
    {
        id: 6,
        user: {
            name: 'Amy Elsner',
            avatar: {
                fallback: 'AE',
                class: '!bg-indigo-200 !text-indigo-950'
            }
        },
        email: 'hi@amyelsner.com',
        date: 'Apr 5th, 2024',
        platform: 'Twitter',
        company: 'TerraFusion'
    },
    {
        id: 7,
        user: {
            name: 'Arlene McCoy',
            avatar: {
                fallback: 'AM',
                class: '!bg-teal-200 !text-teal-950'
            }
        },
        email: 'hi@arlenemccoy.com',
        date: 'Apr 5th, 2024',
        platform: 'Instagram',
        company: 'CrystalForge'
    }
]);

const platformMap = {
    Facebook: 'warn',
    Twitter: 'secondary',
    Instagram: 'success',
    LinkedIn: 'info'
};
</script>
<template>
    <CustomCard class="col-span-12">
        <CustomCard.Header>
            <CustomCard.Title>Customers</CustomCard.Title>
            <CustomCard.Action>
                <Button label="View All" text />
            </CustomCard.Action>
        </CustomCard.Header>
        <CustomCard.Content class="px-4 py-3">
            <DataTable ref="dt" v-model:selection="selectedTransactions" :value="transactions" dataKey="id" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem">
                <Column selectionMode="multiple" headerStyle="width: 3rem" />
                <Column field="user" header="Name">
                    <template #body="slotProps">
                        <div class="flex items-center gap-2">
                            <Avatar :image="slotProps.data.user.avatar?.image" :label="slotProps.data.user.avatar?.fallback" size="large" :class="[slotProps.data.user.avatar?.class, '!font-medium !text-base !w-10 !h-10 !rounded-xl']" />
                            <span class="flex-1 line-clamp-1 font-medium">{{ slotProps.data.user.name }}</span>
                        </div>
                    </template>
                </Column>
                <Column field="email" header="Email" />
                <Column field="date" header="Date" />
                <Column field="platform" header="Platform">
                    <template #body="slotProps">
                        <Tag :severity="platformMap[slotProps.data.platform]" :value="slotProps.data.platform" />
                    </template>
                </Column>
                <Column field="company" header="Company" />
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
