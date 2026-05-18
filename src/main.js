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
            50:  '#fffde7',
            100: '#fff9c4',
            200: '#fff59d',
            300: '#fff176',
            400: '#ffee58',
            500: '#f6cb03',   // ← Brand gold
            600: '#d4a800',
            700: '#a07800',
            800: '#6d5000',
            900: '#3d2d00',
            950: '#1a1200'
        },
        colorScheme: {
            light: {
                primary: {
                    color:          '#f6cb03',
                    contrastColor:  '#0a0a0a',
                    hoverColor:     '#d4a800',
                    activeColor:    '#a07800',
                },
                highlight: {
                    background:     '#f6cb03',
                    focusBackground:'#d4a800',
                    color:          '#0a0a0a',
                    focusColor:     '#0a0a0a',
                },
                surface: {
                    0:   '#ffffff',
                    50:  '#f9f9f9',
                    100: '#f0f0f0',
                    200: '#e4e4e4',
                    300: '#d1d1d1',
                    400: '#a8a8a8',
                    500: '#737373',
                    600: '#525252',
                    700: '#3d3d3d',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a'
                },
                text: {
                    color:          '#0a0a0a',
                    hoverColor:     '#262626',
                    mutedColor:     '#737373',
                    hoverMutedColor:'#525252',
                },
                content: {
                    background:         '#ffffff',
                    hoverBackground:    '#f9f9f9',
                    borderColor:        '#e4e4e4',
                    color:              '#0a0a0a',
                    hoverColor:         '#262626',
                },
                overlay: {
                    select: {
                        background:     '#ffffff',
                        borderColor:    '#e4e4e4',
                        color:          '#0a0a0a',
                    },
                    popover: {
                        background:     '#ffffff',
                        borderColor:    '#e4e4e4',
                        color:          '#0a0a0a',
                    },
                    modal: {
                        background:     '#ffffff',
                        borderColor:    '#e4e4e4',
                        color:          '#0a0a0a',
                    },
                },
                list: {
                    option: {
                        focusBackground:    '#fff9c4',
                        selectedBackground: '#f6cb03',
                        selectedFocusBackground: '#d4a800',
                        color:              '#0a0a0a',
                        focusColor:         '#0a0a0a',
                        selectedColor:      '#0a0a0a',
                        selectedFocusColor: '#0a0a0a',
                    },
                    optionGroup: {
                        background:         'transparent',
                        color:              '#737373',
                    },
                },
                navigation: {
                    item: {
                        focusBackground:    '#fff9c4',
                        activeBackground:   '#f6cb03',
                        color:              '#262626',
                        focusColor:         '#0a0a0a',
                        activeColor:        '#0a0a0a',
                    },
                    submenuLabel: {
                        background:         'transparent',
                        color:              '#737373',
                    },
                    submenuIcon: {
                        color:              '#737373',
                        focusColor:         '#0a0a0a',
                        activeColor:        '#0a0a0a',
                    },
                },
            },
            dark: {
                primary: {
                    color:          '#f6cb03',
                    contrastColor:  '#0a0a0a',
                    hoverColor:     '#ffee58',
                    activeColor:    '#fff176',
                },
                highlight: {
                    background:     '#f6cb03',
                    focusBackground:'#ffee58',
                    color:          '#0a0a0a',
                    focusColor:     '#0a0a0a',
                },
                surface: {
                    0:   '#ffffff',
                    50:  '#1a1a1a',
                    100: '#222222',
                    200: '#2a2a2a',
                    300: '#333333',
                    400: '#555555',
                    500: '#777777',
                    600: '#999999',
                    700: '#bbbbbb',
                    800: '#d4d4d4',
                    900: '#ebebeb',
                    950: '#f5f5f5'
                },
                text: {
                    color:          '#f5f5f5',
                    hoverColor:     '#ffffff',
                    mutedColor:     '#999999',
                    hoverMutedColor:'#bbbbbb',
                },
                content: {
                    background:         '#222222',
                    hoverBackground:    '#2a2a2a',
                    borderColor:        '#333333',
                    color:              '#f5f5f5',
                    hoverColor:         '#ffffff',
                },
                overlay: {
                    select: {
                        background:     '#222222',
                        borderColor:    '#333333',
                        color:          '#f5f5f5',
                    },
                    popover: {
                        background:     '#222222',
                        borderColor:    '#333333',
                        color:          '#f5f5f5',
                    },
                    modal: {
                        background:     '#1a1a1a',
                        borderColor:    '#333333',
                        color:          '#f5f5f5',
                    },
                },
                list: {
                    option: {
                        focusBackground:        '#3d2d00',
                        selectedBackground:     '#f6cb03',
                        selectedFocusBackground:'#d4a800',
                        color:                  '#f5f5f5',
                        focusColor:             '#f5f5f5',
                        selectedColor:          '#0a0a0a',
                        selectedFocusColor:     '#0a0a0a',
                    },
                    optionGroup: {
                        background:             'transparent',
                        color:                  '#999999',
                    },
                },
                navigation: {
                    item: {
                        focusBackground:    '#3d2d00',
                        activeBackground:   '#f6cb03',
                        color:              '#d4d4d4',
                        focusColor:         '#f5f5f5',
                        activeColor:        '#0a0a0a',
                    },
                    submenuLabel: {
                        background:         'transparent',
                        color:              '#999999',
                    },
                    submenuIcon: {
                        color:              '#999999',
                        focusColor:         '#f5f5f5',
                        activeColor:        '#0a0a0a',
                    },
                },
            }
        }
    }
})

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