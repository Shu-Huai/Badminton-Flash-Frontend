<script lang="ts" setup>
import {computed, h, reactive, ref} from 'vue';
import {type DataTableColumns, NButton, NTag, useMessage} from 'naive-ui';
import type {UserAccountVO, UserRole} from '../../types/api';
import * as adminApi from '../../api/admin';
import AppEmptyState from '../common/AppEmptyState.vue';

const message = useMessage();

const loading = ref(false);
const users = ref<UserAccountVO[]>([]);

const detailId = ref<number | null>(null);
const detail = ref<UserAccountVO | null>(null);

const createForm = reactive({
    studentId: '',
    password: '',
    userRole: 'USER' as UserRole,
});

const updateForm = reactive({
    id: null as number | null,
    studentId: '',
    password: '',
    userRole: null as UserRole | null,
});

const detailRows = computed(() => {
    if (!detail.value) {
        return [];
    }
    return [
        ['用户编号', detail.value.id],
        ['账号', detail.value.studentId],
        ['角色', roleText(detail.value.userRole)],
        ['状态', detail.value.isActive ? '启用' : '停用'],
    ] as Array<[string, string | number]>;
});

function roleText(role: UserRole): string {
    return role === 'ADMIN' ? '管理员' : '普通用户';
}

async function loadUsers(): Promise<void> {
    loading.value = true;
    try {
        users.value = await adminApi.listUsers();
    } finally {
        loading.value = false;
    }
}

async function loadUserById(): Promise<void> {
    if (!detailId.value) {
        message.warning('请输入用户编号');
        return;
    }
    detail.value = await adminApi.getUser(detailId.value);
}

async function createUser(): Promise<void> {
    if (!createForm.studentId || !createForm.password) {
        message.warning('请填写账号和密码');
        return;
    }
    await adminApi.createUser({
        studentId: createForm.studentId,
        password: createForm.password,
        userRole: createForm.userRole,
    });
    message.success('创建用户成功');
    await loadUsers();
}

async function updateUser(): Promise<void> {
    if (!updateForm.id) {
        message.warning('请输入要更新的用户编号');
        return;
    }
    await adminApi.updateUser(updateForm.id, {
        studentId: updateForm.studentId || undefined,
        password: updateForm.password || undefined,
        userRole: updateForm.userRole || undefined,
    });
    message.success('更新用户成功');
    await loadUsers();
}

async function deleteUser(id: number): Promise<void> {
    await adminApi.deleteUser(id);
    message.success('删除用户成功');
    await loadUsers();
}

const columns: DataTableColumns<UserAccountVO> = [
    {title: '用户编号', key: 'id', width: 90},
    {title: '账号', key: 'studentId'},
    {
        title: '角色',
        key: 'userRole',
        width: 110,
        render: (row) => h(NTag, {
            size: 'small',
            type: row.userRole === 'ADMIN' ? 'warning' : 'default'
        }, {default: () => roleText(row.userRole)}),
    },
    {
        title: '状态',
        key: 'isActive',
        width: 100,
        render: (row) => (row.isActive ? '启用' : '停用'),
    },
    {
        title: '操作',
        key: 'actions',
        width: 260,
        render: (row) =>
            h('div', {class: 'flex flex-wrap gap-2'}, [
                h(
                    NButton,
                    {
                        size: 'small',
                        onClick: () => {
                            updateForm.id = row.id;
                            updateForm.studentId = row.studentId;
                            updateForm.userRole = row.userRole;
                            updateForm.password = '';
                        },
                    },
                    {default: () => '填入更新表单'},
                ),
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'error',
                        onClick: () => deleteUser(row.id),
                    },
                    {default: () => '删除用户'},
                ),
            ]),
    },
];

loadUsers();
</script>

<template>
    <div class="space-y-4">
        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">用户列表与详情</div>
                    <div class="text-xs text-slate-500">浏览全部用户并按编号查询详情</div>
                </div>
            </template>
            <div class="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center">
                <n-button :loading="loading" class="w-full lg:w-auto" @click="loadUsers">刷新用户列表</n-button>
                <n-input-number v-model:value="detailId" class="w-full" clearable placeholder="用户编号"/>
                <n-button class="w-full lg:w-auto" @click="loadUserById">查询用户</n-button>
            </div>
            <n-data-table
                :columns="columns"
                :data="users"
                :loading="loading"
                :pagination="{ pageSize: 8 }"
                :scroll-x="900"
                :single-line="false"
                class="mobile-table"
                style="--table-min-width: 900px"
            />

            <AppEmptyState v-if="!detail" description="请输入用户编号并点击“查询用户”"
                           hint="如需编辑，可先在列表点击“填入更新表单”"
                           title="还没有用户详情"/>
            <n-descriptions v-else :column="1" bordered class="mt-3" label-placement="left">
                <n-descriptions-item v-for="row in detailRows" :key="row[0]" :label="row[0]">{{
                        row[1]
                    }}
                </n-descriptions-item>
            </n-descriptions>
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">创建用户</div>
                    <div class="text-xs text-slate-500">新建普通用户或管理员账号</div>
                </div>
            </template>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <n-input v-model:value="createForm.studentId" placeholder="账号"/>
                <n-input v-model:value="createForm.password" placeholder="密码" show-password-on="click"
                         type="password"/>
                <n-select
                    v-model:value="createForm.userRole"
                    :options="[
            { label: '普通用户', value: 'USER' },
            { label: '管理员', value: 'ADMIN' },
          ]"
                />
            </div>
            <div class="mt-3">
                <n-button class="w-full sm:w-auto" type="primary" @click="createUser">创建用户</n-button>
            </div>
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">更新用户</div>
                    <div class="text-xs text-slate-500">按用户编号更新账号信息</div>
                </div>
            </template>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <n-input-number v-model:value="updateForm.id" class="w-full" clearable placeholder="用户编号"/>
                <n-input v-model:value="updateForm.studentId" placeholder="账号（可选）"/>
                <n-input v-model:value="updateForm.password" placeholder="密码（可选）" show-password-on="click"
                         type="password"/>
                <n-select
                    v-model:value="updateForm.userRole"
                    :options="[
            { label: '普通用户', value: 'USER' },
            { label: '管理员', value: 'ADMIN' },
          ]"
                    clearable
                />
            </div>
            <div class="mt-3">
                <n-button class="w-full sm:w-auto" type="primary" @click="updateUser">更新用户</n-button>
            </div>
        </n-card>
    </div>
</template>


