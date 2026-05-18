<script setup>
import AppConfig from '@/layout/AppConfig.vue'
import { useLayout } from '@/layout/composables/layout'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NotificationsDropdown from '../components/layout/NotificationsDropdown.vue'
import ProfileDropdown from '../components/layout/ProfileDropdown.vue'

const notificationsStore = useNotificationsStore()
const route = useRoute()
const authStore = useAuthStore()
const { layoutConfig, toggleMenu, isDarkTheme } = useLayout()

const pageTitle = computed(() => {
    const titles = {
        'dashboard':                'Dashboard',
        'users':                    'User Management',
        'users.create':             'Create User',
        'users.edit':               'Edit User',
        'flights.search':           'Search Flights',
        'bookings.flights':         'Flight Bookings',
        'bookings.hotels':          'Hotel Bookings',
        'bookings.umrah':           'Umrah Bookings',
        'bookings.visas':           'Visa Applications',
        'group-tickets':            'Group Tickets',
        'crm.hotels':               'Hotels',
        'crm.umrah':                'Umrah Packages',
        'crm.hajj':                 'Hajj Packages',
        'crm.visas':                'Visa Packages',
        'crm.group-tickets':        'Group Tickets',
        'payment-requests':         'Payment Requests',
        'credit-requests':          'Credit Requests',
        'credits':                  'Credit Management',
        'finance.credits':          'Credit Management',
        'finance.invoices':         'Invoices',
        'ticketing.issue':          'Issue Ticket',
        'ticketing.void':           'Void Requests',
        'ticketing.refund':         'Refund Requests',
        'ticketing.reissue':        'Reissue Requests',
        'pricing':                  'Pricing & Markup',
        'reports.sales':            'Sales Reports',
        'reports.bookings':         'Booking Reports',
        'reports.financial':        'Financial Reports',
        'reports.agents':           'Agent Reports',
        'settings':                 'Settings',
        'settings.gds':             'GDS Settings',
        'settings.airlines':        'Airline Settings',
        'settings.email':           'Email Templates',
        'settings.payment':         'Payment Settings',
        'inquiries':                'Inquiries',
        'inquiries.create':         'New Inquiry',
        'profile':                  'My Profile',
        'profile.balance':          'My Balance',
        'profile.ledger':           'My Ledger',
        'profile.payment-requests': 'My Payment Requests',
        'profile.credit-requests':  'My Credit Requests',
        'profile.sessions':         'Active Sessions',
    }
    return titles[route.name] || 'Dashboard'
})

const userInitials = computed(() => {
    const name = authStore.user?.name || 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

// ─── Dark mode toggle ─────────────────────────────
function executeDarkModeToggle() {
    layoutConfig.darkTheme = !layoutConfig.darkTheme
    document.documentElement.classList.toggle('app-dark')
}

function handleToggleDarkMode() {
    if (!document.startViewTransition) {
        executeDarkModeToggle()
        return
    }
    document.startViewTransition(() => executeDarkModeToggle())
}
</script>

<template>
    <header class="layout-topbar !z-40">

        <!-- Left side -->
        <div class="topbar-left">
            <button type="button" @click="toggleMenu" class="menu-button">
                <i class="pi pi-bars" />
            </button>
            <span class="topbar-separator" />
            <div class="page-title">{{ pageTitle }}</div>
        </div>

        <!-- Right side -->
        <div class="topbar-right">
            <div class="topbar-actions">

                <!-- Dark/Light toggle directly in header -->
                <Button
                    :icon="isDarkTheme ? 'pi pi-sun' : 'pi pi-moon'"
                    severity="secondary"
                    outlined
                    rounded
                    v-tooltip.bottom="isDarkTheme ? 'Light Mode' : 'Dark Mode'"
                    @click="handleToggleDarkMode"
                />

                <!-- Notifications -->
                <div class="relative">
                    <a v-styleclass="{
                            selector: '@next',
                            enterFromClass: 'hidden',
                            enterActiveClass: 'p-anchored-overlay-enter-active',
                            leaveActiveClass: 'p-anchored-overlay-leave-active',
                            leaveToClass: 'hidden',
                            hideOnOutsideClick: true
                        }"
                        class="relative inline-flex cursor-pointer"
                        @click="notificationsStore.fetchNotifications()"
                    >
                        <Button icon="pi pi-bell" severity="secondary" outlined rounded />
                        <span
                            v-if="notificationsStore.unreadCount > 0"
                            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none"
                            style="color: white"
                        >
                            {{ notificationsStore.unreadCount > 9 ? '9+' : notificationsStore.unreadCount }}
                        </span>
                    </a>
                    <div class="absolute hidden min-w-72 top-auto right-0 z-20 mt-2">
                        <NotificationsDropdown class="w-full sm:w-[22rem]" />
                    </div>
                </div>

                <!-- User Avatar -->
                <div class="relative">
                    
                    <a v-styleclass="{
                            selector: '@next',
                            enterFromClass: 'hidden',
                            enterActiveClass: 'p-anchored-overlay-enter-active',
                            leaveActiveClass: 'p-anchored-overlay-leave-active',
                            leaveToClass: 'hidden',
                            hideOnOutsideClick: true
                        }"
                        class="flex items-center cursor-pointer"
                    >
                        <div class="w-9 h-9 rounded-md bg-primary-500 flex items-center justify-center text-white font-bold text-sm"
                            style="color: #0a0a0a">
                            {{ userInitials }}
                        </div>
                    </a>
                    <div class="absolute hidden top-full right-0 mt-2 z-20">
                        <ProfileDropdown class="w-52" />
                    </div>
                </div>

            </div>
        </div>

        <!-- AppConfig still needed for onMounted brand color setup -->
        <AppConfig />

    </header>
</template>