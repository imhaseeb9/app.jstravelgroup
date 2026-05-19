<script setup>
import Logo from '@/components/icons/Logo.vue';
import { useLayout } from '@/layout/composables/layout';
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppMenu from './AppMenu.vue';

const BREAKPOINT = 992;
const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
const { layoutConfig, layoutState, isDesktop, isHorizontal, isCompact, isSlim, hasOpenOverlay, hasOverlaySubmenu, hasOpenOverlaySubmenu } = useLayout();
const route = useRoute();
const menuContainerRef = ref(null);
const sidebarRef = ref(null);

let timeout = null;
let observer = null;
let outsideClickListener = null;

watch(
    () => route.path,
    (newPath) => {
        if (hasOverlaySubmenu.value && isDesktop()) layoutState.activePath = null;
        else layoutState.activePath = newPath;

        layoutState.overlayMenuActive = false;
        layoutState.mobileMenuActive = false;
        layoutState.menuHoverActive = false;
    },
    { immediate: true }
);

watch(hasOpenOverlay, (newVal) => {
    if (isDesktop()) {
        if (newVal) bindOutsideClickListener();
        else unbindOutsideClickListener();
    }
});

watch(hasOpenOverlaySubmenu, (newValue) => {
    if (isDesktop()) {
        if (newValue) nextTick(setupIntersectionObserver);
        else unbindObserver();
    }
});

const screenChangeListener = () => {
    if (hasOverlaySubmenu.value) {
        layoutState.activePath = isDesktop() ? null : route.path;
        layoutState.menuHoverActive = false;
        unbindOutsideClickListener();
        unbindObserver();
    }
};

const bindOutsideClickListener = () => {
    if (!outsideClickListener) {
        outsideClickListener = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive = false;

                if (hasOverlaySubmenu.value) {
                    layoutState.activePath = null;
                    layoutState.menuHoverActive = false;
                }
            }
        };

        document.addEventListener('click', outsideClickListener);
    }
};

const unbindOutsideClickListener = () => {
    if (outsideClickListener) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener = null;
    }
};

const isOutsideClicked = (event) => {
    const topbarButtonEl = document.querySelector('.menu-button');

    return !(sidebarRef.value.isSameNode(event.target) || sidebarRef.value.contains(event.target) || topbarButtonEl?.isSameNode(event.target) || topbarButtonEl?.contains(event.target));
};

const onMouseEnter = () => {
    if (!layoutState.anchored) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        layoutState.sidebarExpanded = true;
    }
};

const onMouseLeave = () => {
    if (!layoutState.anchored && !timeout) {
        timeout = setTimeout(() => (layoutState.sidebarExpanded = false), 300);
    }
};

const onAnchorToggle = () => {
    layoutState.anchored = !layoutState.anchored;
};

const onMenuScroll = () => {
    if (menuContainerRef.value) {
        if (isHorizontal.value) {
            menuContainerRef.value.style.setProperty('--menu-scroll-x', `-${menuContainerRef.value.scrollLeft}px`);
        } else if (isSlim.value || isCompact.value) {
            menuContainerRef.value.style.setProperty('--menu-scroll-y', `-${menuContainerRef.value.scrollTop}px`);
        }
    }

    if (hasOverlaySubmenu.value && isDesktop()) {
        layoutState.activePath = null;
    }
};

const setupIntersectionObserver = () => {
    if (!menuContainerRef.value) return;

    if (observer) {
        observer.disconnect();
    }

    const activeMenuItem = menuContainerRef.value.querySelector('.layout-root-menuitem.active-menuitem');
    if (!activeMenuItem) return;

    observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (isDesktop() && !entry.isIntersecting && hasOverlaySubmenu.value && layoutState.activePath) {
                    layoutState.activePath = null;
                }
            });
        },
        {
            root: menuContainerRef.value,
            threshold: 0
        }
    );

    observer.observe(activeMenuItem);
};

const unbindObserver = () => {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
};

mediaQuery.addEventListener('change', screenChangeListener);

onBeforeUnmount(() => {
    unbindOutsideClickListener();
    unbindObserver();
    mediaQuery.removeEventListener('change', screenChangeListener);
});
</script>

<template>
    <div ref="sidebarRef" class="layout-sidebar" :class="{ 'layout-sidebar-light': !layoutConfig.darkTheme, 'layout-sidebar-dark': layoutConfig.darkTheme }" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <div class="sidebar-header">
            <router-link to="/" class="logo">
                <Logo class="logo-image" />
            </router-link>
            <button class="layout-sidebar-anchor" type="button" @click="onAnchorToggle" />
        </div>
        <div ref="menuContainerRef" class="layout-menu-container" @scroll="onMenuScroll">
            <AppMenu />
        </div>
    </div>
</template>
