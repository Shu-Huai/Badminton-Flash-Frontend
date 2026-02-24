<script lang="ts" setup>
import {computed, h, onBeforeUnmount, reactive, ref, watch} from 'vue';
import {type DataTableColumns, NButton, useMessage} from 'naive-ui';
import type {ReserveResultVO, TimeSlot} from '../../types/api';
import * as browseApi from '../../api/browse';
import * as reserveApi from '../../api/reserve';
import AppEmptyState from '../common/AppEmptyState.vue';

const props = defineProps<{
    sessionIdFromOutside?: number | null;
}>();

const message = useMessage();

const query = reactive({
    sessionId: null as number | null,
    dateLowerBound: '',
    dateUpperBound: '',
    courtIdsText: '',
    startTimeLowerBound: '',
    startTimeUpperBound: '',
    endTimeLowerBound: '',
    endTimeUpperBound: '',
});

watch(
    () => props.sessionIdFromOutside,
    (value) => {
        if (value) {
            query.sessionId = value;
        }
    },
    {immediate: true},
);

const loading = ref(false);
const slots = ref<TimeSlot[]>([]);

const detailId = ref<number | null>(null);
const detail = ref<TimeSlot | null>(null);

const currentTraceId = ref('');
const reserveResult = ref<ReserveResultVO | null>(null);
const polling = ref(false);
let timer: number | undefined;

const reserveResultType = computed<'default' | 'warning' | 'success' | 'error'>(() => {
    if (!reserveResult.value) {
        return 'default';
    }
    if (reserveResult.value.status === 'PENDING') {
        return 'warning';
    }
    if (reserveResult.value.status === 'SUCCESS') {
        return 'success';
    }
    return 'error';
});

const reserveResultText = computed(() => {
    if (!reserveResult.value) {
        return '暂未发起预约';
    }
    if (reserveResult.value.status === 'PENDING') {
        return '预约处理中，请稍后刷新';
    }
    if (reserveResult.value.status === 'SUCCESS') {
        return `预约成功，订单号：${reserveResult.value.reservationId ?? '-'}`;
    }
    return '预约失败，请更换时间槽重试';
});

const columns: DataTableColumns<TimeSlot> = [
    {title: '槽位ID', key: 'id', width: 90},
    {title: '日期', key: 'slotDate', width: 130},
    {title: '开始', key: 'startTime', width: 110},
    {title: '结束', key: 'endTime', width: 110},
    {title: '球场', key: 'courtId', width: 90},
    {title: '场次', key: 'sessionId', width: 90},
    {
        title: '操作',
        key: 'actions',
        width: 120,
        render: (row) =>
            h(
                NButton,
                {
                    size: 'small',
                    type: 'primary',
                    onClick: () => startReserve(row),
                },
                {default: () => '预约'},
            ),
    },
];

function parseCourtIds(): number[] | undefined {
    if (!query.courtIdsText.trim()) {
        return undefined;
    }
    const parsed = query.courtIdsText
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((value) => Number.isInteger(value) && value > 0);
    return parsed.length > 0 ? parsed : undefined;
}

async function loadSlots(): Promise<void> {
    if (!query.sessionId) {
        message.warning('请先选择场次');
        return;
    }
    loading.value = true;
    try {
        slots.value = await browseApi.getSlots({
            sessionId: query.sessionId,
            dateLowerBound: query.dateLowerBound || undefined,
            dateUpperBound: query.dateUpperBound || undefined,
            courtIds: parseCourtIds(),
            startTimeLowerBound: query.startTimeLowerBound || undefined,
            startTimeUpperBound: query.startTimeUpperBound || undefined,
            endTimeLowerBound: query.endTimeLowerBound || undefined,
            endTimeUpperBound: query.endTimeUpperBound || undefined,
        });
    } finally {
        loading.value = false;
    }
}

async function loadSlotById(): Promise<void> {
    if (!detailId.value) {
        message.warning('请输入槽位 ID');
        return;
    }
    detail.value = await browseApi.getSlot(detailId.value);
}

async function startReserve(slot: TimeSlot): Promise<void> {
    const traceId = await reserveApi.reserve({
        slotId: slot.id,
        sessionId: slot.sessionId,
    });
    currentTraceId.value = traceId;
    message.success('预约请求已提交');
    await queryReserveResult();
}

async function queryReserveResult(): Promise<void> {
    if (!currentTraceId.value) {
        message.warning('暂无预约追踪号');
        return;
    }
    reserveResult.value = await reserveApi.getReserveResult(currentTraceId.value);
}

function startPolling(): void {
    if (polling.value || !currentTraceId.value) {
        return;
    }
    polling.value = true;
    timer = window.setInterval(async () => {
        try {
            await queryReserveResult();
            if (reserveResult.value && reserveResult.value.status !== 'PENDING') {
                stopPolling();
            }
        } catch {
            stopPolling();
        }
    }, 1200);
}

function stopPolling(): void {
    polling.value = false;
    if (timer) {
        window.clearInterval(timer);
        timer = undefined;
    }
}

onBeforeUnmount(() => {
    stopPolling();
});
</script>

<template>
    <div class="space-y-4">
        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">选择时间槽</div>
                    <div class="text-xs text-slate-500">先筛选时间槽，再点击“预约”提交请求</div>
                </div>
            </template>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                <n-input-number v-model:value="query.sessionId" class="w-full" clearable placeholder="场次ID（必填）"/>
                <n-input v-model:value="query.dateLowerBound" placeholder="日期下限 2026-02-24"/>
                <n-input v-model:value="query.dateUpperBound" placeholder="日期上限"/>
                <n-input v-model:value="query.courtIdsText" placeholder="球场ID：1,2,3"/>
                <n-input v-model:value="query.startTimeLowerBound" placeholder="开始时间下限"/>
                <n-input v-model:value="query.startTimeUpperBound" placeholder="开始时间上限"/>
                <n-input v-model:value="query.endTimeLowerBound" placeholder="结束时间下限"/>
                <n-input v-model:value="query.endTimeUpperBound" placeholder="结束时间上限"/>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
                <n-button :loading="loading" class="w-full sm:w-auto" type="primary" @click="loadSlots">查询时间槽
                </n-button>
            </div>
            <n-data-table
                :columns="columns"
                :data="slots"
                :loading="loading"
                :pagination="{ pageSize: 8 }"
                :scroll-x="860"
                :single-line="false"
                class="mobile-table mt-4"
                style="--table-min-width: 860px"
            />
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">时间槽详情</div>
                    <div class="text-xs text-slate-500">输入槽位编号查看详细信息</div>
                </div>
            </template>
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                <n-input-number v-model:value="detailId" class="w-full" clearable placeholder="槽位ID"/>
                <n-button class="w-full lg:w-auto" @click="loadSlotById">查询详情</n-button>
            </div>

            <AppEmptyState v-if="!detail" description="请输入槽位编号并点击“查询详情”" hint="建议先在上方筛选到目标场次"
                           title="还没有时间槽详情"/>
            <n-descriptions v-else :column="1" bordered class="mt-3" label-placement="left">
                <n-descriptions-item label="槽位ID">{{ detail.id }}</n-descriptions-item>
                <n-descriptions-item label="日期">{{ detail.slotDate }}</n-descriptions-item>
                <n-descriptions-item label="开始时间">{{ detail.startTime }}</n-descriptions-item>
                <n-descriptions-item label="结束时间">{{ detail.endTime }}</n-descriptions-item>
                <n-descriptions-item label="球场ID">{{ detail.courtId }}</n-descriptions-item>
            </n-descriptions>
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold t