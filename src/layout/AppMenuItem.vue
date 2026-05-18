<script setup>
import { useLayout } from '@/layout/composables/layout'
import { computed } from 'vue'

const { layoutState, isDesktop, isCompact, hasOverlaySubmenu } = useLayout()

const props = defineProps({
    item: {
        type: Object,
        default: () => ({})
    },
    root: {
        type: Boolean,
        default: true
    },
    index: {
        type: Number,
        default: 0
    },
    parentPath: {
        type: String,
        default: null
    }
})

const fullPath = computed(() =>
    props.item.path
        ? (props.parentPath ? props.parentPath + props.item.path : props.item.path)
        : null
)

const isActive = computed(() => {
    // Leaf item with direct route
    if (props.item.to) {
        return layoutState.activePath === props.item.to
    }
    // Parent item with path
    if (props.item.path) {
        return layoutState.activePath?.startsWith(fullPath.value)
    }
    // Parent item with children — active if any child matches
    if (props.item.items) {
        return props.item.items.some(child =>
            child.to && layoutState.activePath === child.to
        )
    }
    return false
})

const itemClick = (event, item) => {
    if (item.disabled) {
        event.preventDefault()
        return
    }

    if (item.command) {
        item.command({ originalEvent: event, item })
    }

    if (item.items) {
        if (isActive.value) {
            layoutState.activePath = layoutState.activePath?.replace(item.path, '')
        } else {
            layoutState.activePath = fullPath.value
            layoutState.menuHoverActive = true
        }
    } else {
        layoutState.overlayMenuActive = false
        layoutState.mobileMenuActive = false
        layoutState.menuHoverActive = false

        if (hasOverlaySubmenu.value && isDesktop()) {
            layoutState.activePath = null
        }
    }
}

const onMouseEnter = () => {
    if (isDesktop() && props.root && props.item.items && layoutState.menuHoverActive && !isActive.value) {
        layoutState.activePath = fullPath.value
    }
}
</script>

<template>
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActive }">
        <!-- Section label -->
        <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">
            {{ item.label }}
        </div>

        <!-- Item with submenu -->
        
        <a v-if="(!item.to || item.items) && item.visible !== false"
            :href="item.url"
            @click="itemClick($event, item)"
            :class="item.class"
            :target="item.target"
            tabindex="0"
            @mouseenter="onMouseEnter"
            v-tooltip.hover="isCompact && root && !isActive ? item.label : null"
        >
            <i :class="item.icon" class="layout-menuitem-icon" />
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items" />
        </a>

        <!-- Leaf item with route -->
        <router-link
            v-if="item.to && !item.items && item.visible !== false"
            @click="itemClick($event, item)"
            exactActiveClass="active-route"
            :class="item.class"
            tabindex="0"
            :to="item.to"
            @mouseenter="onMouseEnter"
            v-tooltip.hover="isCompact && root && !isActive ? item.label : null"
        >
            <i :class="item.icon" class="layout-menuitem-icon" />
            <span class="layout-menuitem-text">{{ item.label }}</span>
        </router-link>

        <!-- Children -->
        <ul
            v-if="item.items && item.visible !== false"
            :class="{ 'layout-root-submenulist': root }"
        >
            <app-menu-item
                v-for="(child, i) in item.items"
                :key="child.label + '_' + (child.to || child.path)"
                :item="child"
                :index="i"
                :root="false"
                :parentPath="fullPath"
            />
        </ul>
    </li>
</template>