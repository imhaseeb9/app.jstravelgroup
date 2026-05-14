<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';
import AppBreadcrumb from './AppBreadcrumb.vue';
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';

const { layoutConfig, layoutState, hideMobileMenu } = useLayout();

const containerClass = computed(() => {
    return [
        `layout-sidebar-${layoutConfig.darkTheme ? 'dark' : 'light'}`,
        {
            'layout-overlay': layoutConfig.menuMode === 'overlay',
            'layout-static': layoutConfig.menuMode === 'static',
            'layout-slim': layoutConfig.menuMode === 'slim',
            'layout-horizontal': layoutConfig.menuMode === 'horizontal',
            'layout-compact': layoutConfig.menuMode === 'compact',
            'layout-reveal': layoutConfig.menuMode === 'reveal',
            'layout-drawer': layoutConfig.menuMode === 'drawer',
            'layout-overlay-active': layoutState.overlayMenuActive,
            'layout-mobile-active': layoutState.mobileMenuActive,
            'layout-static-inactive': layoutState.staticMenuInactive,
            'layout-sidebar-expanded': layoutState.sidebarExpanded,
            'layout-sidebar-anchored': layoutState.anchored
        }
    ];
});
</script>

<template>
    <div class="layout-wrapper h-dvh bg-primary-50 dark:bg-surface-950 relative p-2 flex overflow-hidden" :class="containerClass">
        <AppSidebar />
        <main class="layout-content-wrapper flex-1 max-w-[1720px] w-full mx-auto flex flex-col transition-all duration-300 h-full bg-background rounded-3xl shadow-stroke overflow-hidden">
            <AppHeader />
            <AppBreadcrumb />
            <div class="p-6 flex-1 overflow-auto scrollable-content">
                <router-view />
            </div>
        </main>
        <Toast />
        <div v-if="layoutState.overlayMenuActive || layoutState.mobileMenuActive" class="layout-mask" @click="hideMobileMenu" />
    </div>
</template>
