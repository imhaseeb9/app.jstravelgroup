<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'MAIN',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-home',
                to: '/'
            },
        ]
    },
    {
        label: 'USER MANAGEMENT',
        items: [
            {
                label: 'Users',
                icon: 'pi pi-users',
                to: '/users'
            },
        ]
    },
    {
        label: 'FINANCE',
        items: [
            {
                label: 'Payment Requests',
                icon: 'pi pi-credit-card',
                to: '/payment-requests'
            },
            {
                label: 'Credit Requests',
                icon: 'pi pi-wallet',
                to: '/credit-requests'
            },
        ]
    },
    {
        label: 'ACCOUNT',
        items: [
            {
                label: 'My Profile',
                icon: 'pi pi-user',
                to: '/profile'
            },
            {
                label: 'My Balance',
                icon: 'pi pi-dollar',
                to: '/profile/balance'
            },
        ]
    },
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, index) in model" :key="item.label + '_' + (item.to || item.path || index)">
            <AppMenuItem v-if="!item.separator" :item="item" :index="index" root />

            <li v-else class="menu-separator" />
        </template>
    </ul>
</template>
