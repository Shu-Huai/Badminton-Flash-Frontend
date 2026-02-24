<script lang="ts" setup>
import {reactive, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useMessage} from 'naive-ui';
import {login, register} from '../api/auth';
import {useAuthStore} from '../stores/auth';

const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();

const tab = ref<'login' | 'register'>('login');
const loading = ref(false);

const loginForm = reactive({
    studentId: '',
    password: '',
});

const registerForm = reactive({
    studentId: '',
    password: '',
});

async function submitLogin(): Promise<void> {
    if (!loginForm.studentId || !loginForm.password) {
        message.warning('请填写账号和密码');
        return;
    }
    loading.value = true;
    try {
        const token = await login({...loginForm});
        authStore.saveToken(token);
        message.success('欢迎回来');
        await router.push('/');
    } finally {
        loading.value = false;
    }
}

async function submitRegister(): Promise<void> {
    if (!registerForm.studentId || !registerForm.password) {
        message.warning('请填写账号和密码');
        return;
    }
    loading.value = true;
    try {
        const token = await register({...registerForm});
        authStore.saveToken(token);
        message.success('注册成功');
        await router.push('/');
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <main class="page-wrap flex min-h-screen items-center py-4 sm:py-6 lg:py-10">
        <section class="grid w-full gap-4 sm:gap-5 lg:grid-cols-[1.05fr_1fr]">
            <n-card :bordered="false" class="panel-card panel-switch overflow-hidden !rounded-2xl">
                <div
                    class="relative min-h-[300px] overflow-hidden rounded-xl bg-slate-900 p-5 text-slate-100 sm:min-h-[340px] sm:p-6 lg:min-h-[380px]">
                    <div class="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl"></div>
                    <div class="absolute -bottom-20 -left-8 h-56 w-56 rounded-full bg-emerald-300/25 blur-3xl"></div>
                    <div class="relative z-10 space-y-4 sm:space-y-5">
                        <n-tag :bordered="false" size="small" type="success">Badminton Flash</n-tag>
                        <div class="space-y-2">
                            <h1 class="text-2xl font-semibold leading-tight sm:text-3xl">羽毛球约场平台</h1>
                            <p class="max-w-md text-xs text-slate-300 sm:text-sm">
                                快速查看场次、选择时间槽、完成预约与支付。管理员可统一维护场次与系统参数。</p>
                        </div>
                        <div class="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2 lg:grid-cols-2">
                            <div class="rounded-lg border border-slate-700/70 bg-slate-800/60 p-3">实时查看可预约时段
                            </div>
                            <div class="rounded-lg border border-slate-700/70 bg-slate-800/60 p-3">支付状态一站式管理
                            </div>
                            <div class="rounded-lg border border-slate-700/70 bg-slate-800/60 p-3">移动端/桌面端自适应
                            </div>
                            <div class="rounded-lg border border-slate-700/70 bg-slate-800/60 p-3">角色权限清晰分离
                            </div>
                        </div>
                    </div>
                </div>
            </n-card>

            <n-card :bordered="false" class="panel-card panel-switch !rounded-2xl">
                <template #header>
                    <div class="space-y-1">
                        <h2 class="text-lg font-semibold text-slate-800 sm:text-xl">账号访问</h2>
                        <p class="text-xs text-slate-500 sm:text-sm">登录已有账号，或快速注册新账号</p>
                    </div>
                </template>

                <n-tabs v-model:value="tab" animated type="segment">
                    <n-tab-pane name="login" tab="登录">
                        <n-form :model="loginForm" label-placement="top">
                            <n-form-item label="账号">
                                <n-input v-model:value="loginForm.studentId" placeholder="请输入学号/账号"
                                         size="large"/>
                            </n-form-item>
                            <n-form-item label="密码">
                                <n-input
                                    v-model:value="loginForm.password"
                                    placeholder="请输入密码"
                                    show-password-on="click"
                                    size="large"
                                    type="password"
                                />
                            </n-form-item>
                            <n-button :loading="loading" block size="large" type="primary" @click="submitLogin">登录
                            </n-button>
                        </n-form>
                    </n-tab-pane>

                    <n-tab-pane name="register" tab="注册">
                        <n-form :model="registerForm" label-placement="top">
                            <n-form-item label="账号">
                                <n-input v-model:value="registerForm.studentId" placeholder="请输入新账号"
                                         size="large"/>
                            </n-form-item>
                            <n-form-item label="密码">
                                <n-input
                                    v-model:value="registerForm.password"
                                    placeholder="请设置密码"
                                    show-password-on="click"
                                    size="large"
                                    type="password"
                                />
                            </n-form-item>
                            <n-button :loading="loading" block size="large" type="primary" @click="submitRegister">
                                注册并进入
                            </n-button>
                        </n-form>
                    </n-tab-pane>
                </n-tabs>
            </n-card>
        </section>
    </main>
</template>


