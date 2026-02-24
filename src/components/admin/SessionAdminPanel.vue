<script lang="ts" setup>
import {h, reactive, ref} from 'vue';
import {type DataTableColumns, NButton, useMessage} from 'naive-ui';
import type {FlashSession} from '../../types/api';
import * as browseApi from '../../api/browse';
import * as adminApi from '../../api/admin';

const message = useMessage();

const loading = ref(false);
const sessions = ref<FlashSession[]>([]);

const addForm = reactive({
    flashTime: '',
    beginTime: '',
    endTime: '',
    slotInterval: null as number | null,
});

const updateForm = reactive({
    id: null as number | null,
    flashTime: '',
    beginTime: '',
    endTime: '',
    slotInterval: null as number | null,
});

async function loadSessions(): Promise<void> {
    loading.value = true;
    try {
        sessions.value = await browseApi.getSessions();
    } finally {
        loading.value = false;
    }
}

async function addSession(): Promise<void> {
    if (!addForm.flashTime || !addForm.beginTime || !addForm.endTime || !addForm.slotInterval) {
        message.warning('请填写开闸时间、开始时间、结束时间和间隔分钟');
        return;
    }
    await adminApi.addSession({
        flashTime: addForm.flashTime,
        beginTime: addForm.beginTime,
        endTime: addForm.endTime,
        slotInterval: addForm.slotInterval,
    });
    message.success('新增场次成功');
    await loadSessions();
}

async function updateSession(): Promise<void> {
    if (!updateForm.id) {
        message.warning('请输入场次编号');
        return;
    }
    await adminApi.updateSession(updateForm.id, {
        flashTime: updateForm.flashTime || undefined,
        beginTime: updateForm.beginTime || undefined,
        endTime: updateForm.endTime || undefined,
        slotInterval: updateForm.slotInterval || undefined,
    });
    message.success('更新场次成功');
    await loadSessions();
}

async function removeSession(id: number): Promise<void> {
    await adminApi.deleteSession(id);
    message.success('删除场次成功');
    await loadSessions();
}

async function warmup(id: number): Promise<void> {
    await adminApi.warmupSession(id);
    message.success('预热已执行');
}

async function open(id: number): Promise<void> {
    await adminApi.openSession(id);
    message.success('开闸已执行');
}

async function slotGen(id: number): Promise<void> {
    await adminApi.generateSlot(id);
    message.success('时间槽生成已执行');
}

const columns: DataTableColumns<FlashSession> = [
    {title: '场次编号', key: 'id', width: 90},
    {title: '开闸时间', key: 'flashTime'},
    {title: '开始时间', key: 'beginTime'},
    {title: '结束时间', key: 'endTime'},
    {title: '间隔分钟', key: 'slotInterval', width: 100},
    {
        title: '操作',
        key: 'actions',
        width: 360,
        render: (row) =>
            h('div', {class: 'flex flex-wrap gap-2'}, [
                h(
                    NButton,
                    {
                        size: 'small',
                        onClick: () => {
                            updateForm.id = row.id;
                            updateForm.flashTime = row.flashTime;
                            updateForm.beginTime = row.beginTime;
                            updateForm.endTime = row.endTime;
                            updateForm.slotInterval = row.slotInterval;
                        },
                    },
                    {default: () => '填入更新表单'},
                ),
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'warning',
                        onClick: () => warmup(row.id),
                    },
                    {default: () => '预热'},
                ),
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'primary',
                        onClick: () => open(row.id),
                    },
                    {default: () => '开闸'},
                ),
                h(
                    NButton,
                    {
                        size: 'small',
                        onClick: () => slotGen(row.id),
                    },
                    {default: () => '生成时间槽'},
                ),
                h(
                    NButton,
                    {
                        size: 'small',
                        type: 'error',
                        onClick: () => removeSession(row.id),
                    },
                    {default: () => '删除场次'},
                ),
            ]),
    },
];

loadSessions();
</script>

<template>
    <div class="space-y-4">
        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">新增场次</div>
                    <div class="text-xs text-slate-500">创建新的预约场次</div>
                </div>
            </template>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <n-input v-model:value="addForm.flashTime" placeholder="开闸时间，例如 13:00:00"/>
                <n-input v-model:value="addForm.beginTime" placeholder="开始时间"/>
                <n-input v-model:value="addForm.endTime" placeholder="结束时间"/>
                <n-input-number v-model:value="addForm.slotInterval" class="w-full" clearable placeholder="间隔分钟"/>
            </div>
            <div class="mt-3">
                <n-button class="w-full sm:w-auto" type="primary" @click="addSession">新增场次</n-button>
            </div>
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">更新场次</div>
                    <div class="text-xs text-slate-500">按场次编号更新信息</div>
                </div>
            </template>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <n-input-number v-model:value="updateForm.id" class="w-full" clearable placeholder="场次编号"/>
                <n-input v-model:value="updateForm.flashTime" placeholder="开闸时间（可选）"/>
                <n-input v-model:value="updateForm.beginTime" placeholder="开始时间（可选）"/>
                <n-input v-model:value="updateForm.endTime" placeholder="结束时间（可选）"/>
                <n-input-number v-model:value="updateForm.slotInterval" class="w-full" clearable
                                placeholder="间隔分钟（可选）"/>
            </div>
            <div class="mt-3">
                <n-button class="w-full sm:w-auto" type="primary" @click="updateSession">更新场次</n-button>
            </div>
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">场次列表与动作</div>
                    <div class="text-xs text-slate-500">支持预热、开闸、生成时间槽和删除</div>
                </div>
            </template>
            <div class="mb-3">
                <n-button :loading="loading" class="w-full sm:w-auto" @click="loadSessions">刷新场次列表</n-button>
            </div>
            <n-data-table
                :columns="columns"
                :data="sessions"
                :loading="loading"
                :pagination="{ pageSize: 8 }"
                :scroll-x="960"
                :single-line="false"
                class="mobile-table"
                style="--table-min-width: 960px"
            />
        </n-card>
    </div>
</template>


