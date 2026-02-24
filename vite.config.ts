import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const proxyTargets = ['auth', 'user', 'browse', 'reserve', 'pay', 'admin'];

export default defineConfig({
    plugins: [vue(), tailwindcss()],
    server: {
        port: 10096,
        proxy: Object.fromEntries(
            proxyTargets.map((name) => [
                `/${name}`,
                {
                    target: 'http://lvshuhuai.cn:25001',
                    changeOrigin: true,
                },
            ]),
        ),
    },
});