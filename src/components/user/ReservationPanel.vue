<script lang="ts" setup>
import {computed, h, reactive, ref} from 'vue';
import {type DataTableColumns, NButton, NTag, useMessage} from 'naive-ui';
import type {PayOrderResultVO, Reservation, ReservationStatus, WechatPayCreateVO} from '../../types/api';
import * as browseApi from '../../api/browse';
import * as reserveApi from '../../api/reserve';
import * as payApi from '../../api/pay';
import AppEmptyState from '../common/AppEmptyState.vue';

const props = defineProps<{
    isAdmin: boolean;
}>();

const message = useMessage();

const query = reactive({
    sessionId: null as number | null,
    slotId: null as number | null,
    statuses: [] as ReservationStatus[],
    dateLowerBound: '',
    dateUpperBound: '',
});

const statusOptions = [
    {label: '待处理', value: 'PENDING'},
    {label: '待支付', value: 'PENDING_PAYMENT'},
    {label: '已确认', value: 'CONFIRMED'},
    {label: '已取消', value: 'CANCELLED'},
] as const;

const loading = ref(false);
const reservations = ref<Reservation[]>([]);
const latestPayCreate = ref<WechatPayCreateVO | null>(null);
const payResultMap = ref<Record<number, PayOrderResultVO>>({});

const adminMockOutTradeNo = ref('');

const latestPayResult = computed(() => {
    const values = Object.values(payResultMap.value);
    if (values.length === 0) {
        return null;
    }
    return values[values.length - 1] ?? null;
});

function statusText(status: ReservationStatus): string {
    if (status === 'PENDING_PAYMENT') {
        return '待支付';
    }
    if (status === 'CONFIRMED') {
        return '已确认';
    }
    if (status === 'CANCELLED') {
        return '已取消';
    }
    return '处理中';
}

function statusType(status: ReservationStatus): 'default' | 'warning' | 'success' | 'error' {
    if (status === 'PENDING_PAYMENT') {
        return 'warning';
    }
    if (status === 'CONFIRMED') {
        return 'success';
    }
    if (status === 'CANCELLED') {
        return 'error';
    }
    return 'default';
}

async function loadReservations(): Promise<void> {
    loading.value = true;
    try {
        reservations.value = await browseApi.getReservations({
            sessionId: query.sessionId || undefined,
            slotId: query.slotId || undefined,
            statuses: query.statuses.length > 0 ? query.statuses : undefined,
            dateLowerBound: query.dateLowerBound || undefined,
            dateUpperBound: query.dateUpperBound || undefined,
        });
    } finally {
        loading.value = false;
    }
}

async function cancelReservation(reservationId: number): Promise<void> {
    await reserveApi.cancelReservation(reservationId);
    message.success('订单已取消');
    await loadReservations();
}

async function createWechatPay(reservationId: number): Promise<void> {
    latestPayCreate.value = await payApi.createWechatPay(reservationId);
    message.success('支付单已创建');
}

async function queryPayResult(reservationId: number): Promise<void> {
    const result = await payApi.getPayResult(reservationId);
    payResultMap.value = {...payResultMap.value, [reservationId]: result};
}

async function refundReservation(reservationId: number): Promise<void> {
    await payApi.refund(reservationId);
    message.success('退款已提交');
    await loadReservations();
}

async function runMockSuccess(): Promise<void> {
    if (!adminMockOutTradeNo.value.trim()) {
        message.warning('请输入支付单号');
        return;
    }
    await payApi.mockWechatPaySuccess(adminMockOutTradeNo.value.trim());
    message.success('模拟支付成功已执行');
}

const columns: DataTableColumns<Reservation> = [
    {title: '订单号', key: 'id', width: 90},
    {title: '场次', key: 'slotId', width: 90},
    {
        title: '状态',
        key: 'status',
        width: 130,
        render: (row) => h(NTag, {
            type: statusType(row.status),
            size: 'small'
        }, {default: () => statusText(row.status)}),
    },
    {
        title: '操作',
        key: 'actions',
        width: 360,
        render: (row) => {
            const actions = [];
            if (row.status === 'PENDING_PAYMENT') {
                actions.push(
                    h(
                        NButton,
                        {size: 'small', onClick: () => cancelReservation(row.id)},
                        {default: () => '取消订单'},
                    ),
                    h(
                        NButton,
                        {size: 'small', type: 'primary', onClick: () => createWechatPay(row.id)},
                        {default: () => '立即支付'},
                    ),
                );
            }
            actions.push(
                h(
                    NButton,
                    {size: 'small', onClick: () => queryPayResult(row.id)},
                    {default: () => '查看支付状态'},
                ),
            );
            if (row.status === 'CONFIRMED') {
                actions.push(
                    h(
                        NButton,
                        {size: 'small', type: 'warning', onClick: () => refundReservation(row.id)},
                        {default: () => '申请退款'},
                    ),
                );
            }
            return h('div', {class: 'flex flex-wrap gap-2'}, actions);
        },
    },
];

loadReservations();
</script>

<template>
    <div class="space-y-4">
        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">我的订单</div>
                    <div class="text-xs text-slate-500">按条件筛选并完成支付、取消、退款</div>
                </div>
            </template>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5">
                <n-input-number v-model:value="query.sessionId" class="w-full" clearable placeholder="按场次ID筛选"/>
                <n-input-number v-model:value="query.slotId" class="w-full" clearable placeholder="按时间槽ID筛选"/>
                <n-select v-model:value="query.statuses" :options="statusOptions" clearable multiple
                          placeholder="订单状态"/>
                <n-input v-model:value="query.dateLowerBound" placeholder="开始日期 2026-02-24"/>
                <n-input v-model:value="query.dateUpperBound" placeholder="结束日期"/>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
                <n-button :loading="loading" class="w-full sm:w-auto" type="primary" @click="loadReservations">
                    查询订单
                </n-button>
            </div>
            <n-data-table
                :columns="columns"
                :data="reservations"
                :loading="loading"
                :pagination="{ pageSize: 8 }"
                :scroll-x="920"
                :single-line="false"
                class="mobile-table mt-4"
                style="--table-min-width: 920px"
            />
        </n-card>

        <div class="grid gap-4 xl:grid-cols-2">
            <n-card :bordered="false" class="panel-card panel-switch" title="最近一次支付创建结果">
                <AppEmptyState
                    v-if="!latestPayCreate"
                    description="点击订单右侧的“立即支付”后，会在这里显示支付凭据"
                    hint="先筛选到“待支付”订单更快"
                    title="还没有支付单"
                />
                <n-descriptions v-else :column="1" bordered label-placement="left">
                    <n-descriptions-item label="订单号">{{ latestPayCreate.reservationId }}</n-descriptions-item>
                    <n-descriptions-item label="支付单号">{{ latestPayCreate.outTradeNo }}</n-descriptions-item>
                    <n-descriptions-item label="支付票据">{{ latestPayCreate.prepayId }}</n-descriptions-item>
                </n-descriptions>
            </n-card>

            <n-card :bordered="false" class="panel-card panel-switch" title="最近一次支付状态">
                <AppEmptyState v-if="!latestPayResult" description="点击订单中的“查看支付状态”后会显示"
                               hint="支付后可及时查看状态变化" title="还没有支付状态"/>
                <n-descriptions v-else :column="1" bordered label-placement="left">
                    <n-descriptions-item label="订单号">{{ latestPayResult.reservationId }}</n-descriptions-item>
                    <n-descriptions-item label="支付单号">{{ latestPayResult.outTradeNo || '-' }}</n-descriptions-item>
                    <n-descriptions-item label="支付状态">{{ latestPayResult.payStatus || '-' }}</n-descriptions-item>
                    <n-descriptions-item label="订单状态">{{
                            statusText(latestPayResult.reservationStatus)
                        }}
                    </n-descriptions-item>
                    <n-descriptions-item label="金额">{{ latestPayResult.amount || '-' }}</n-descriptions-item>
                </n-descriptions>
            </n-card>
        </div>

        <n-card v-if="props.isAdmin" :bordered="false" class="panel-card panel-switch"
                title="管理员工具：手动标记支付成功">
            <div class="flex flex-col gap-3 lg:flex-row">
                <n-input v-model:value="adminMockOutTradeNo" placeholder="输入支付单号 outTradeNo"/>
                <n-button class="w-full lg:w-auto" type="warning" @click="runMockSuccess">执行模拟成功</n-button>
            </div>
        </n-card>
    </div>
</template>


