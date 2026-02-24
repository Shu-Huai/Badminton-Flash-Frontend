<script lang="ts" setup>
import {computed, ref} from 'vue';
import {useRouter} from 'vue-router';
import {type MenuOption, useMessage} from 'naive-ui';
import type {UserAccountVO} from '../types/api';
import SessionBrowser from '../components/user/SessionBrowser.vue';
import CourtBrowser from '../components/user/CourtBrowser.vue';
import SlotReservePanel from '../components/user/SlotReservePanel.vue';
import ReservationPanel from '../components/user/ReservationPanel.vue';
import ProfilePanel from '../components/user/ProfilePanel.vue';
import SystemConfigPanel from '../components/admin/SystemConfigPanel.vue';
import SessionAdminPanel from '../components/admin/SessionAdminPanel.vue';
import UserAdminPanel from '../components/admin/UserAdminPanel.vue';
import {useAuthStore} from '../stores/auth';
import * as userApi from '../api/user';

const router = useRouter();
const message = useMessage();
const authStore = useAuthStore();

const activeTab = ref('session');
const selectedSessionId = ref<number | null>(null);
const me = ref<UserAccountVO | null>(null);
const meLoading = ref(false);

const userTabs = [
    {name: 'session', label: '场次浏览', desc: '先查看可预约的场次，再进入时间槽选择'},
    {name: 'court', label: '球场浏览', desc: '按名称筛选和查看球场信息'},
    {name: 'slot', label: '时间槽预约', desc: '按场次筛选时间槽并发起预约'},
    {name: 'reservation', label: '我的订单', desc: '管理预约、支付、退款与支付状态'},
    {name: 'profile', label: '账户设置', desc: '查看和更新当前账户信息'},
];

const adminTabs = [
    {name: 'admin-config', label: '系统配置', desc: '配置支付超时、球场数量等系统参数'},
    {name: 'admin-session', label: '场次管理', desc: '维护场次并执行预热、开闸、生成时间槽'},
    {name: 'admin-user', label: '用户管理', desc: '创建、更新和删除用户账号'},
];

const allTabs = computed(() => [...userTabs, ...(authStore.isAdmin ? adminTabs : [])]);
const mobileTabOptions = computed(() =>
    allTabs.value.map((item) => ({
        label: item.label,
        value: item.name,
    })),
);

const menuOptions = computed<MenuOption[]>(() => {
    const options: MenuOption[] = userTabs.map((item) => ({
        key: item.name,
        label: item.label,
    }));

    if (authStore.isAdmin) {
        options.push({
            key: 'admin-group',
            type: 'group',
            label: '管理后台',
            children: adminTabs.map((item) => ({
                key: item.name,
                label: item.label,
            })),
        });
    }

    return options;
});

const currentTab = computed(() => allTabs.value.find((item) => item.name === activeTab.value) ?? allTabs.value[0]);

function roleText(role?: 'USER' | 'ADMIN' | ''): string {
    if (role === 'ADMIN') {
        return '管理员';
    }
    if (role === 'USER') {
        return '普通用户';
    }
    return '-';
}

async function refreshMe(): Promise<void> {
    meLoading.value = true;
    try {
        const user = await userApi.getMe();
        authStore.syncRole(user.userRole);
        me.value = user;
    } finally {
        meLoading.value = false;
    }
}

async function logout(): Promise<void> {
    authStore.logout();
    await router.push('/auth');
}

function onSessionSelected(sessionId: number): void {
    selectedSessionId.value = sessionId;
    activeTab.value = 'slot';
}

async function onUserDeleted(): Promise<void> {
    authStore.logout();
    await router.push('/auth');
}

refreshMe().catch((error: Error) => {
    message.warning(`读取用户信息失败：${error.message}`);
});
</script>

<template>
    <main class="page-wrap min-w-0 space-y-4">
        <section class="grid min-w-0 gap-4 lg:grid-cols-[1fr_auto]">
            <n-card :bordered="false" class="panel-card panel-switch">
                <div class="flex flex-wrap items-start gap-3 sm:gap-4">
                    <div>
                        <h1 class="text-lg font-semibold text-slate-800 sm:text-xl">羽毛球约场控制台</h1>
                        <p class="text-xs text-slate-500 sm:text-sm">{{ currentTab?.label }} · {{
                                currentTab?.desc
                            }}</p>
                    </div>
                    <div class="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
                        <n-tag round type="success">{{ roleText(authStore.role || '') }}</n-tag>
                        <n-button :loading="meLoading" class="w-full sm:w-auto" @click="refreshMe">刷新信息</n-button>
                        <n-button class="w-full sm:w-auto" type="error" @click="logout">退出登录</n-button>
                    </div>
                </div>
            </n-card>

            <n-card :bordered="false" class="panel-card panel-switch w-full lg:w-[380px]">
                <div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div class="rounded-lg bg-emerald-50 p-3">
                        <div class="text-slate-500">角色</div>
                        <div class="text-xl font-semibold text-emerald-700">{{ roleText(me?.userRole || '') }}</div>
                    </div>
                    <div class="rounded-lg bg-cyan-50 p-3">
                        <div class="text-slate-500">已选场次</div>
                        <div class="text-xl font-semibold text-cyan-700">{{ selectedSessionId || '-' }}</div>
                    </div>
                    <div class="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                        <div class="text-slate-500">账号</div>
                        <div class="text-base font-semibold text-slate-700">{{ me?.studentId || '-' }}</div>
                    </div>
                </div>
            </n-card>
        </section>

        <section class="grid min-w-0 gap-4 lg:grid-cols-[240px_1fr]">
            <div class="hidden lg:block">
                <n-card :bordered="false" class="panel-card h-fit" title="功能导航">
                    <n-menu v-model:value="activeTab" :options="menuOptions"/>
                </n-card>
            </div>

            <div class="min-w-0 space-y-4">
                <div class="lg:hidden">
                    <n-card :bordered="false" class="panel-card" size="small">
                        <div class="space-y-3">
                            <div class="text-xs text-slate-500">手机导航</div>
                            <n-select v-model:value="activeTab" :options="mobileTabOptions"/>
                            <div class="mobile-chip-scroll">
                                <n-button
                                    v-for="item in allTabs"
                                    :key="item.name"
                                    :type="activeTab === item.name ? 'primary' : 'default'"
                                    class="shrink-0"
                                    round
                                    size="small"
                                    strong
                                    @click="activeTab = item.name"
                                >
                                    {{ item.label }}
                                </n-button>
                            </div>
                        </div>
                    </n-card>
                </div>

                <n-card :bordered="false" class="panel-card panel-switch" size="small">
                    <div class="text-xs text-slate-500">当前工作区</div>
                    <div class="text-lg font-semibold text-slate-800">{{ currentTab?.label }}</div>
                    <div class="text-sm text-slate-500">{{ currentTab?.desc }}</div>
                </n-card>

                <transition mode="out-in" name="panel-switch">
                    <SessionBrowser v-if="activeTab === 'session'" key="session" @select-session="onSessionSelected"/>
                    <CourtBrowser v-else-if="activeTab === 'court'" key="court"/>
                    <SlotReservePanel v-else-if="activeTab === 'slot'" key="slot"
                                      :session-id-from-outside="selectedSessionId"/>
                    <ReservationPanel v-else-if="activeTab === 'reservation'" key="reservation"
                                      :is-admin="authStore.isAdmin"/>
                    <ProfilePanel v-else-if="activeTab === 'profile'" key="profile" @deleted="onUserDeleted"/>
                    <SystemConfigPanel v-else-if="activeTab === 'admin-config'" key="admin-config"/>
                    <SessionAdminPanel v-else-if="activeTab === 'admin-session'" key="admin-session"/>
                    <UserAdminPanel v-else-if="activeTab === 'admin-user'" key="admin-user"/>
                </transition>
            </div>
        </section>
    </main>
</template>


