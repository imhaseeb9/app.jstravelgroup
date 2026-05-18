<script setup>
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'
import AppMenuItem from './AppMenuItem.vue'

const authStore = useAuthStore()

const model = computed(() => {
    const user = authStore.user
    if (!user) return []

    const isSuperAdmin = authStore.isSuperAdmin
    const isAgent      = authStore.isAgent
    const isSubAgent   = authStore.isSubAgent
    const isAgentLevel = authStore.isAgentLevel
    const hasPermission = (perm) => authStore.hasPermission(perm)

    const menu = []

    // ─── MAIN ─────────────────────────────────
    menu.push({
        label: 'MAIN',
        items: [
            { label: 'Dashboard', icon: 'pi pi-home', to: '/' }
        ]
    })

    // ─── FLIGHT SEARCH ────────────────────────
    if (hasPermission('flight.search')) {
        menu.push({ separator: true })
        menu.push({
            label: 'FLIGHTS',
            items: [
                { label: 'Search Flights', icon: 'pi pi-search', to: '/flights/search' },
            ]
        })
    }

    // ─── BOOKINGS ─────────────────────────────
    if (hasPermission('booking.create') || hasPermission('booking.view_own') || hasPermission('booking.view_all')) {
        const bookingItems = [
            { label: 'Flight Bookings', icon: 'pi pi-ticket', to: '/bookings/flights' },
            { label: 'Hotel Bookings', icon: 'pi pi-building', to: '/bookings/hotels' },
            { label: 'Umrah Bookings', icon: 'pi pi-star', to: '/bookings/umrah' },
            { label: 'Visa Applications', icon: 'pi pi-id-card', to: '/bookings/visas' },
        ]
        menu.push({ separator: true })
        menu.push({ label: 'BOOKINGS', items: bookingItems })
    }

    // ─── GROUP TICKETS ────────────────────────
    if (hasPermission('group_ticket.view') || hasPermission('group_ticket.book')) {
        menu.push({ separator: true })
        menu.push({
            label: 'GROUP TICKETS',
            items: [
                { label: 'Available Tickets', icon: 'pi pi-tags', to: '/group-tickets' },
            ]
        })
    }

    // ─── CRM / PACKAGES ───────────────────────
    if (hasPermission('cms.view')) {
        menu.push({ separator: true })
        menu.push({
            label: 'CRM & PACKAGES',
            items: [
                { label: 'Hotels', icon: 'pi pi-building', to: '/crm/hotels' },
                { label: 'Umrah Packages', icon: 'pi pi-star-fill', to: '/crm/umrah' },
                { label: 'Hajj Packages', icon: 'pi pi-compass', to: '/crm/hajj' },
                { label: 'Visa Packages', icon: 'pi pi-id-card', to: '/crm/visas' },
                { label: 'Group Tickets', icon: 'pi pi-tags', to: '/crm/group-tickets' },
            ]
        })
    }

    // ─── USER MANAGEMENT ──────────────────────
    if (hasPermission('user.view') || hasPermission('user.agent_management')) {
        menu.push({ separator: true })
        menu.push({
            label: 'USER MANAGEMENT',
            items: [
                { label: 'Users', icon: 'pi pi-users', to: '/users' },
            ]
        })
    }

    // ─── FINANCE ──────────────────────────────
    const financeItems = []

    if (hasPermission('finance.set_credit_limit')) {
        financeItems.push({ label: 'Credit Management', icon: 'pi pi-wallet', to: '/finance/credits' })
    }

    if (hasPermission('finance.approve_payment')) {
        financeItems.push({ label: 'Payment Requests', icon: 'pi pi-credit-card', to: '/payment-requests' })
    }

    if (hasPermission('finance.set_credit_limit')) {
        financeItems.push({ label: 'Credit Requests', icon: 'pi pi-plus-circle', to: '/credit-requests' })
    }

    if (hasPermission('finance.view_invoices')) {
        financeItems.push({ label: 'Invoices', icon: 'pi pi-file', to: '/finance/invoices' })
    }

    if (financeItems.length > 0) {
        menu.push({ separator: true })
        menu.push({ label: 'FINANCE', items: financeItems })
    }

    // ─── TICKETING ────────────────────────────
    const ticketingItems = []

    if (
        hasPermission('ticketing.sabre.issue') ||
        hasPermission('ticketing.galileo.issue') ||
        hasPermission('ticketing.pia.issue') ||
        hasPermission('ticketing.airarabia.issue') ||
        hasPermission('ticketing.slamair.issue')
    ) {
        ticketingItems.push({ label: 'Issue Ticket', icon: 'pi pi-send', to: '/ticketing/issue' })
    }

    if (hasPermission('ticketing.void_request')) {
        ticketingItems.push({ label: 'Void Requests', icon: 'pi pi-times-circle', to: '/ticketing/void' })
    }

    if (hasPermission('ticketing.refund_request')) {
        ticketingItems.push({ label: 'Refund Requests', icon: 'pi pi-replay', to: '/ticketing/refund' })
    }

    if (hasPermission('ticketing.reissue_request')) {
        ticketingItems.push({ label: 'Reissue Requests', icon: 'pi pi-refresh', to: '/ticketing/reissue' })
    }

    if (ticketingItems.length > 0) {
        menu.push({ separator: true })
        menu.push({ label: 'TICKETING', items: ticketingItems })
    }

    // ─── PRICING & MARKUP ─────────────────────
    if (hasPermission('pricing.view')) {
        menu.push({ separator: true })
        menu.push({
            label: 'PRICING & MARKUP',
            items: [
                { label: 'Pricing Rules', icon: 'pi pi-percentage', to: '/pricing' },
            ]
        })
    }

    // ─── REPORTS ──────────────────────────────
    const reportItems = []

    if (hasPermission('reports.sales')) {
        reportItems.push({ label: 'Sales Reports', icon: 'pi pi-chart-bar', to: '/reports/sales' })
    }

    if (hasPermission('reports.booking')) {
        reportItems.push({ label: 'Booking Reports', icon: 'pi pi-chart-line', to: '/reports/bookings' })
    }

    if (hasPermission('reports.financial')) {
        reportItems.push({ label: 'Financial Reports', icon: 'pi pi-chart-pie', to: '/reports/financial' })
    }

    if (hasPermission('reports.agent')) {
        reportItems.push({ label: 'Agent Reports', icon: 'pi pi-users', to: '/reports/agents' })
    }

    if (reportItems.length > 0) {
        menu.push({ separator: true })
        menu.push({ label: 'REPORTS', items: reportItems })
    }

    // ─── SETTINGS ─────────────────────────────
    if (hasPermission('settings.view')) {
        const settingsItems = [
            { label: 'General Settings', icon: 'pi pi-cog', to: '/settings' },
        ]

        if (hasPermission('settings.gds')) {
            settingsItems.push({ label: 'GDS Settings', icon: 'pi pi-server', to: '/settings/gds' })
        }

        if (hasPermission('settings.airline')) {
            settingsItems.push({ label: 'Airline Settings', icon: 'pi pi-send', to: '/settings/airlines' })
        }

        if (hasPermission('settings.email')) {
            settingsItems.push({ label: 'Email Templates', icon: 'pi pi-envelope', to: '/settings/email' })
        }

        if (hasPermission('settings.payment')) {
            settingsItems.push({ label: 'Payment Settings', icon: 'pi pi-credit-card', to: '/settings/payment' })
        }
        menu.push({ separator: true })
        menu.push({ label: 'SETTINGS', items: settingsItems })
    }

    // ─── INQUIRIES ────────────────────────────
    if (hasPermission('inquiry.view') || hasPermission('inquiry.respond') || hasPermission('inquiry.create')) {
        const inquiryItems = []

        if (hasPermission('inquiry.view') || hasPermission('inquiry.respond')) {
            inquiryItems.push({ label: 'All Inquiries', icon: 'pi pi-inbox', to: '/inquiries' })
        }

        if (hasPermission('inquiry.create')) {
            inquiryItems.push({ label: 'New Inquiry', icon: 'pi pi-plus', to: '/inquiries/create' })
        }
        menu.push({ separator: true })
        menu.push({ label: 'INQUIRIES', items: inquiryItems })
    }

    // ─── MY ACCOUNT ───────────────────────────
    const accountItems = [
        { label: 'My Profile', icon: 'pi pi-user', to: '/profile' },
        { label: 'Active Sessions', icon: 'pi pi-desktop', to: '/profile/sessions' },
    ]

    // Balance only for users with booking.create (agents/sub-agents)
    // NOT for super_admin or agency staff
    if (hasPermission('booking.create') && !isSuperAdmin) {
        accountItems.push({ label: 'My Balance', icon: 'pi pi-dollar', to: '/profile/balance' })
        accountItems.push({ label: 'My Ledger', icon: 'pi pi-list', to: '/profile/ledger' })
        accountItems.push({ label: 'My Payments', icon: 'pi pi-send', to: '/profile/payment-requests' })
        accountItems.push({ label: 'Credit Requests', icon: 'pi pi-plus-circle', to: '/profile/credit-requests' })
    }
    menu.push({ separator: true })
    menu.push({ label: 'MY ACCOUNT', items: accountItems })

    return menu
})
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, index) in model" :key="item.label + '_' + index">
            <AppMenuItem v-if="!item.separator" :item="item" :index="index" root />
            <li v-else class="menu-separator" />
        </template>
    </ul>
</template>