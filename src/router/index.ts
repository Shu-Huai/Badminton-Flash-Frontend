import {createRouter, createWebHistory} from 'vue-router';
import {useAuthStore} from '../stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/auth',
            name: 'auth',
            component: () => import('../views/AuthView.vue'),
        },
        {
            path: '/',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/',
        },
    ],
});

router.beforeEach((to) => {
    const authStore = useAuthStore();
    authStore.restoreToken();

    if (to.path === '/auth' && authStore.isAuthenticated) {
        return '/';
    }

    if (to.path !== '/auth' && !authStore.isAuthenticated) {
        return '/auth';
    }

    return true;
});

export default router;
