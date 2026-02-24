import {ref} from 'vue';

const THEME_KEY = 'bf_theme_mode';
const isDark = ref(false);
let initialized = false;

function applyThemeClass(dark: boolean): void {
    document.documentElement.classList.toggle('dark-mode', dark);
}

function detectInitialDark(): boolean {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') {
        return true;
    }
    if (saved === 'light') {
        return false;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function ensureInit(): void {
    if (initialized) {
        return;
    }
    isDark.value = detectInitialDark();
    applyThemeClass(isDark.value);
    initialized = true;
}

export function useThemeMode() {
    ensureInit();

    function setDark(nextDark: boolean): void {
        isDark.value = nextDark;
        localStorage.setItem(THEME_KEY, nextDark ? 'dark' : 'light');
        applyThemeClass(nextDark);
    }

    function toggleDark(): void {
        setDark(!isDark.value);
    }

    return {
        isDark,
        setDark,
        toggleDark,
    };
}
