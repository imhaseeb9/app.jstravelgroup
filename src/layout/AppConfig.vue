<script setup>
import { useLayout } from '@/layout/composables/layout'
import { updatePreset, updateSurfacePalette } from '@primeuix/themes'
import { onMounted } from 'vue'

const { layoutConfig } = useLayout()

// ─── Hardcode brand color on mount ───────────────
onMounted(() => {
    updatePreset({
        semantic: {
            primary: {
                50:  '#fffde7',
                100: '#fff9c4',
                200: '#fff59d',
                300: '#fff176',
                400: '#ffee58',
                500: '#f6cb03',
                600: '#d4a800',
                700: '#a07800',
                800: '#6d5000',
                900: '#3d2d00',
                950: '#1a1200'
            },
            colorScheme: {
                light: {
                    primary: {
                        color:         '{primary.500}',
                        contrastColor: '#0a0a0a',
                        hoverColor:    '{primary.600}',
                        activeColor:   '{primary.700}'
                    },
                    highlight: {
                        background:      '{primary.500}',
                        focusBackground: '{primary.600}',
                        color:           '#0a0a0a',
                        focusColor:      '#0a0a0a'
                    }
                },
                dark: {
                    primary: {
                        color:         '{primary.400}',
                        contrastColor: '#0a0a0a',
                        hoverColor:    '{primary.300}',
                        activeColor:   '{primary.200}'
                    },
                    highlight: {
                        background:      'color-mix(in srgb, {primary.400}, transparent 20%)',
                        focusBackground: '{primary.400}',
                        color:           '#0a0a0a',
                        focusColor:      '#0a0a0a'
                    }
                }
            }
        }
    })

    updateSurfacePalette({
        0:   '#ffffff',
        50:  '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a'
    })
})
</script>

<template></template>