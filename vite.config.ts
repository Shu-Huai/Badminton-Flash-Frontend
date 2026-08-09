import {defineConfig, loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const proxyTargets = ['auth', 'user', 'browse', 'reserve', 'pay', 'admin'];

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), '');
    const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:25001';

    return {
        plugins: [vue(), tailwindcss()],
        server: {
            port: 10096,
            proxy: Object.fromEntries(
                proxyTargets.map((name) => [
                    `/${name}`,
                    {
                        target: proxyTarget,
                        changeOrigin: true,
                    },
                ]),
            ),
            allowedHosts: true
        },
    };
});
