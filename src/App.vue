<script lang="ts" setup>
import {computed} from 'vue';
import {darkTheme, dateZhCN, NConfigProvider, NDialogProvider, NMessageProvider, zhCN} from 'naive-ui';
import MessageBridge from './components/MessageBridge.vue';
import {useThemeMode} from './utils/theme';

const {isDark, toggleDark} = useThemeMode();

const theme = computed(() => (isDark.value ? darkTheme : null));
const themeButtonText = computed(() => (isDark.value ? '浅色模式' : '深色模式'));
const themeButtonCompactText = computed(() => (isDark.value ? '浅色' : '深色'));

const themeOverrides = computed(() => {
    if (isDark.value) {
        return {
            common: {
                primaryColor: '#22c55e',
                primaryColorHover: '#34d399',
                primaryColorPressed: '#16a34a',
            },
            Card: {
                borderRadius: '16px',
            },
            Input: {
                borderRadius: '10px',
            },
            Button: {
                borderRadiusTiny: '10px',
                borderRadiusSmall: '10px',
                borderRadiusMedium: '10px',
            },
        };
    }
    return {
        common: {
            primaryColor: '#0a7f6f',
            primaryColorHover: '#08917f',
            primaryColorPressed: '#07685b',
        },
        Card: {
            borderRadius: '16px',
        },
        Input: {
            borderRadius: '10px',
        },
        Button: {
            borderRadiusTiny: '10px',
            borderRadiusSmall: '10px',
            borderRadiusMedium: '10px',
        },
    };
});
</script>

<template>
    <n-config-provider :date-locale="dateZhCN" :locale="zhCN" :theme="theme" :theme-overrides="themeOverrides">
        <n-dialog-provider>
            <n-message-provider :max="4" placement="top">
                <MessageBridge/>
                <div class="app-shell">
                    <div class="app-mesh"></div>

                    <div class="fixed bottom-4 right-4 z-50 lg:bottom-auto lg:top-4">
                        <n-button class="theme-toggle-btn" round secondary strong @click="toggleDark">
                            <span class="text-xs font-medium lg:hidden">{{ themeButtonCompactText }}</span>
                            <span class="hidden lg:inline">{{ themeButtonText }}</span>
                        </n-button>
                    </div>

                    <router-view/>
                </div>
            </n-message-provider>
        </n-dialog-provider>
    </n-config-provider>
</template>
