<script setup>
import AppConfig from '@/layout/AppConfig.vue';
import { useLayout } from '@/layout/composables/layout';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import NotificationsDropdown from '../components/layout/NotificationsDropdown.vue';
import ProfileDropdown from '../components/layout/ProfileDropdown.vue';
import AppRightMenu from './AppRightMenu.vue';

const route = useRoute();
const search = ref('');
const rightMenuRef = ref(null);
const rightMenuOpen = ref(false);
const pageTitle = computed(() => route.meta.title || 'Dashboard');

const { layoutConfig, toggleConfigSidebar, toggleMenu } = useLayout();

const toggleRightMenu = () => {
    rightMenuRef.value?.toggle();
};
</script>

<template>
    <header class="layout-topbar !z-40">
        <div class="topbar-left">
            <template v-if="layoutConfig.menuMode === 'overlay' || layoutConfig.menuMode === 'static'">
                <button type="button" @click="toggleMenu" class="menu-button">
                    <i class="pi pi-bars" />
                </button>
                <span class="topbar-separator" />
            </template>
            <div class="page-title">
                {{ pageTitle }}
            </div>
        </div>

        <div class="topbar-right">
            <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="search" placeholder="Search" />
            </IconField>

            <div class="topbar-actions">
                <button type="button" @click="toggleMenu" class="menu-button menu-button-mobile">
                    <i class="pi pi-bars" />
                </button>

                <button type="button" @click="toggleConfigSidebar" class="app-config-button">
                    <i class="pi pi-cog" />
                </button>

                <AppConfig />

                <div class="relative">
                    <a v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'p-anchored-overlay-enter-active', leaveActiveClass: 'p-anchored-overlay-leave-active', leaveToClass: 'hidden', hideOnOutsideClick: true }">
                        <Button icon="pi pi-bell" severity="secondary" outlined />
                    </a>
                    <div class="absolute hidden min-w-72 top-auto right-0 z-20 mt-2">
                        <NotificationsDropdown class="w-full sm:w-[22rem]" />
                    </div>
                </div>

                <div class="relative">
                    <a
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'p-anchored-overlay-enter-active', leaveActiveClass: 'p-anchored-overlay-leave-active', leaveToClass: 'hidden', hideOnOutsideClick: true }"
                        class="flex items-center"
                    >
                        <Avatar image="/demo/images/avatar/avatar-square-m-2.jpg" class="rounded-md! overflow-hidden w-9! h-9! cursor-pointer" />
                    </a>
                    <div class="absolute hidden top-full right-0 mt-2 z-20">
                        <ProfileDropdown class="w-52" />
                    </div>
                </div>

                <Button @click="toggleRightMenu" icon="pi pi-align-right" severity="secondary" outlined />
                <AppRightMenu ref="rightMenuRef" :open="rightMenuOpen" @toggle="(value) => (rightMenuOpen = value)" />
            </div>
        </div>
    </header>
</template>
