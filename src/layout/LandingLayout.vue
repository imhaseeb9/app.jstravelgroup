<script setup>
import Footer from '@/components/landing/shared/Footer.vue';
import Navbar from '@/components/landing/shared/Navbar.vue';
</script>

<template>
    <div class="bg-surface-50 dark:bg-surface-950 w-full min-h-screen overflow-hidden">
        <Navbar />
        <router-view />
        <Footer />
        <LandingConfigButton />
        <AppConfig location="landing" />
    </div>
</template>
