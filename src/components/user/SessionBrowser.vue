<script lang="ts" setup>
import {computed, h, reactive, ref} from 'vue';
import {type DataTableColumns, NButton, NTag, useMessage} from 'naive-ui';
import type {FlashSession} from '../../types/api';
import * as browseApi from '../../api/browse';
import AppEmptyState from '../common/AppEmptyState.vue';

const emit = defineEmits<{
    (e: 'select-session', sessionId: number): void;
}>();

const message = useMessage();

const listLoading = ref(false);
const sessions = ref<FlashSession[]>([]);
const sessionOpenMap = ref<Record<number, boolean>>({});

const query = reactive({
    flashTimeLowerBound: '',
    flashTimeUpperBound: '',
    beginTimeLowerBound: '',
    beginTimeUpperBound: '',
    endTimeLowerBound: '',
    endTimeUpperBound: '',
    slotIntervalLowerBound: undefined as number | undefined,
    slotIntervalUpperBound: undefined as number | undefined,
});

const detailId = ref<number | null>(null);
const detail = ref<FlashSession | null>(null);

const detailRows = computed(() => {
    if (!detail.value) {
        return [];
    }
    return [
        ['场次ID', detail.value.id],
        ['开闸时间', detail.value.flashTime],
        ['营业开始', detail.value.beginTime],
        ['营业结束', detail.value.endTime],
        ['间隔分钟', detail.value.slotInterval],
    ] as Array<[string, string | number]>;
});

const columns: DataTableColumns<FlashSession> = [
    {title: '场次ID', key: 'id', width: 80},
    {title: '开闸时间', key: 'flashTime'},
    {title: '营业开始', key: 'beginTime'},
    {title: '营业结束', key: 'endTime'},
    {title: '间隔(分钟)', key: 'slotInterval', width: 120},
    {
        title: '状态',
        key: 'openState',
        width: 110,
        render: (row) => {
            const open = sessionOpenMap.value[row.id];
            if (open === undefined) {
                return h(NTag, {size: 'small'}, {default: () => '未查询'});
            }
            return h(
                NTag,
                {
                    size: 'small',
                    type: open ? 'success' : 'error',
                },
                {default: () => (open ? '已开闸' : '未开闸')},
            );
        },
    },
    {
        title: '操作',
        key: 'actions',
        width: 220,
        render: (row) =>
            h('div', {class: 'flex gap-2'}, [
                h(
                    NButton,
                    {
                        size: 'small',
                        onClick: () => checkOpen(row.id),
                    },
                    {default: () => '刷新状态'},
                ),
                h(
                    NButton,
                    {
                        type: 'primary',
                        size: 'small',
                        onClick: () => emit('select-session', row.id),
                    },
                    {default: () => '去预约'},
                ),
            ]),
    },
];

async function loadSessions(): Promise<void> {
    listLoading.value = true;
    try {
        sessions.value = await browseApi.getSessions({
            flashTimeLowerBound: query.flashTimeLowerBound || undefined,
            flashTimeUpperBound: query.flashTimeUpperBound || undefined,
            beginTimeLowerBound: query.beginTimeLowerBound || undefined,
            beginTimeUpperBound: query.beginTimeUpperBound || undefined,
            endTimeLowerBound: query.endTimeLowerBound || undefined,
            endTimeUpperBound: query.endTimeUpperBound || undefined,
            slotIntervalLowerBound: query.slotIntervalLowerBound,
            slotIntervalUpperBound: query.slotIntervalUpperBound,
        });
    } finally {
        listLoading.value = false;
    }
}

async function loadSessionById(): Promise<void> {
    if (!detailId.value) {
        message.warning('请输入场次编号');
        return;
    }
    detail.value = await browseApi.getSession(detailId.value);
}

async function checkOpen(sessionId: number): Promise<void> {
    const opened = await browseApi.isSessionOpen(sessionId);
    sessionOpenMap.value = {...sessionOpenMap.value, [sessionId]: opened};
}

loadSessions();
</script>

<template>
    <div class="space-y-4">
        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">场次列表</div>
                    <div class="text-xs text-slate-500">找到适合的开闸时间后可直接进入预约</div>
                </div>
            </template>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                <n-input v-model:value="query.flashTimeLowerBound" placeholder="开闸时间下限 08:00:00"/>
                <n-input v-model:value="query.flashTimeUpperBound" placeholder="开闸时间上限"/>
                <n-input v-model:value="query.beginTimeLowerBound" placeholder="营业开始下限"/>
                <n-input v-model:value="query.beginTimeUpperBound" placeholder="营业开始上限"/>
                <n-input v-model:value="query.endTimeLowerBound" placeholder="营业结束下限"/>
                <n-input v-model:value="query.endTimeUpperBound" placeholder="营业结束上限"/>
                <n-input-number v-model:value="query.slotIntervalLowerBound" class="w-full" clearable
                                placeholder="间隔下限"/>
                <n-input-number v-model:value="query.slotIntervalUpperBound" class="w-full" clearable
                                placeholder="间隔上限"/>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
                <n-button :loading="listLoading" class="w-full sm:w-auto" type="primary" @click="loadSessions">
                    查询场次
                </n-button>
            </div>
            <n-data-table
                :columns="columns"
                :data="sessions"
                :loading="listLoading"
                :pagination="{ pageSize: 8 }"
                :scroll-x="920"
                :single-line="false"
                class="mobile-table mt-4"
                style="--table-min-width: 920px"
            />
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">查看场次详情</div>
                    <div class="text-xs text-slate-500">输入场次编号后展示详细信息</div>
                </div>
            </template>
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                <n-input-number v-model:value="detailId" class="w-full" clearable placeholder="场次ID"/>
                <n-button class="w-full lg:w-auto" @click="loadSessionById">查询详情</n-button>
            </div>

            <AppEmptyState v-if="!detail" description="请输入场次编号并点击“查询详情”"
                           hint="你也可以在上方列表直接点击“去预约”"
                           title="还没有场次详情"/>
            <n-descriptions v-else :column="1" bordered class="mt-3" label-placement="left">
                <n-descriptions-item v-for="row in detailRows" :key="row[0]" :label="row[0]">{{
                        row[1]
                    }}
                </n-descriptions-item>
            </n-descriptions>
        </n-card>
    </div>
</template>


