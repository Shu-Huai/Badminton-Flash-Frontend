import {computed, ref} from 'vue';
import {defineStore} from 'pinia';
import {clearToken, getRoleFromToken, getToken, setToken} from '../utils/authToken';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(getToken());
    const role = ref<'USER' | 'ADMIN' | ''>(getRoleFromToken(token.value));

    function saveToken(nextToken: string): void {
        setToken(nextToken);
        token.value = nextToken;
        role.value = getRoleFromToken(nextToken);
    }

    function restoreToken(): void {
        token.value = getToken();
        role.value = getRoleFromToken(token.value);
    }

    function logout(): void {
        clearToken();
        token.value = '';
        role.value = '';
    }

    function syncRole(nextRole: 'USER' | 'ADMIN'): void {
        role.value = nextRole;
    }

    const isAuthenticated = computed(() => Boolean(token.value));
    const isAdmin = computed(() => role.value === 'ADMIN');

    return {
        token,
        role,
        isAuthenticated,
        isAdmin,
        saveToken,
        restoreToken,
        logout,
        syncRole,
    };
});
