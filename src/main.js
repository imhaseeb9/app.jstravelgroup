import router from '@/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import App from './App.vue';

import '@/assets/styles.scss';
import '@/assets/tailwind.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50:  '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#C9A84C',  // gold
            600: '#a67c00',
            700: '#854d0e',
            800: '#713f12',
            900: '#422006',
            950: '#1a0a00'
        },
        colorScheme: {
            light: {
                surface: {
                    0:   '#ffffff',
                    50:  '#f8f8f8',
                    100: '#f0f0f0',
                    200: '#e0e0e0',
                    300: '#cccccc',
                    400: '#aaaaaa',
                    500: '#888888',
                    600: '#555555',
                    700: '#333333',
                    800: '#1a1a1a',
                    900: '#0d0d0d',
                    950: '#000000'
                }
            },
            dark: {
                surface: {
                    0:   '#ffffff',
                    50:  '#1a1a1a',
                    100: '#222222',
                    200: '#2a2a2a',
                    300: '#333333',
                    400: '#444444',
                    500: '#666666',
                    600: '#888888',
                    700: '#aaaaaa',
                    800: '#cccccc',
                    900: '#e0e0e0',
                    950: '#f8f8f8'
                }
            }
        }
    }
});

app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');