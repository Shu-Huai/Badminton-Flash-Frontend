<script lang="ts" setup>
import {reactive, ref} from 'vue';
import {useDialog, useMessage} from 'naive-ui';
import type {UserAccountVO} from '../../types/api';
import * as userApi from '../../api/user';
import AppEmptyState from '../common/AppEmptyState.vue';

const emit = defineEmits<{
    (e: 'deleted'): void;
}>();

const message = useMessage();
const dialog = useDialog();

const me = ref<UserAccountVO | null>(null);
const loading = ref(false);

const updateForm = reactive({
    studentId: '',
    oldPassword: '',
    newPassword: '',
});

function roleText(role: UserAccountVO['userRole']): string {
    return role === 'ADMIN' ? '管理员' : '普通用户';
}

async function loadMe(): Promise<void> {
    loading.value = true;
    try {
        me.value = await userApi.getMe();
    } finally {
        loading.value = false;
    }
}

async function submitUpdate(): Promise<void> {
    await userApi.updateMe({
        studentId: updateForm.studentId || undefined,
        oldPassword: updateForm.oldPassword || undefined,
        newPassword: updateForm.newPassword || undefined,
    });
    message.success('更新成功');
    updateForm.studentId = '';
    updateForm.oldPassword = '';
    updateForm.newPassword = '';
    await loadMe();
}

function confirmDelete(): void {
    dialog.warning({
        title: '确认删除当前账号？',
        content: '该操作不可恢复',
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: async () => {
            await userApi.deleteMe();
            message.success('账号已删除');
            emit('deleted');
        },
    });
}

loadMe();
</script>

<template>
    <div class="space-y-4">
        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">我的账户信息</div>
                    <div class="text-xs text-slate-500">查看当前账户信息</div>
                </div>
            </template>
            <div class="mb-3">
                <n-button :loading="loading" class="w-full sm:w-auto" @click="loadMe">刷新我的信息</n-button>
            </div>

            <AppEmptyState v-if="!me" description="点击“刷新我的信息”即可加载" hint="加载成功后可在下方修改账号或密码"
                           title="还没有账户信息"/>
            <n-descriptions v-else :column="1" bordered label-placement="left">
                <n-descriptions-item label="用户编号">{{ me.id }}</n-descriptions-item>
                <n-descriptions-item label="账号">{{ me.studentId }}</n-descriptions-item>
                <n-descriptions-item label="角色">{{ roleText(me.userRole) }}</n-descriptions-item>
                <n-descriptions-item label="状态">{{ me.isActive ? '启用' : '停用' }}</n-descriptions-item>
            </n-descriptions>
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">更新我的账户</div>
                    <div class="text-xs text-slate-500">更新登录账号与密码</div>
                </div>
            </template>
            <n-form :model="updateForm" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    label-placement="top">
                <n-form-item label="账号（可选）">
                    <n-input v-model:value="updateForm.studentId" placeholder="新的账号"/>
                </n-form-item>
                <n-form-item label="旧密码（与新密码成对）">
                    <n-input v-model:value="updateForm.oldPassword" show-password-on="click" type="password"/>
                </n-form-item>
                <n-form-item label="新密码（与旧密码成对）">
                    <n-input v-model:value="updateForm.newPassword" show-password-on="click" type="password"/>
                </n-form-item>
            </n-form>
            <n-button class="w-full sm:w-auto" type="primary" @click="submitUpdate">提交更新</n-button>
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-rose-700">删除我的账户</div>
                    <div class="text-xs text-slate-500">执行账号注销操作</div>
                </div>
            </template>
            <n-button class="w-full sm:w-auto" type="error" @click="confirmDelete">删除当前用户</n-button>
        </n-card>
    </div>
</template>


