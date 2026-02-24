<script lang="ts" setup>
import {computed, ref} from 'vue';
import {useMessage} from 'naive-ui';
import type {ConfigDTO, ConfigKey} from '../../types/api';
import * as adminApi from '../../api/admin';

const message = useMessage();

const config = ref<ConfigDTO>({configItems: []});
const loading = ref(false);

const singleKey = ref<ConfigKey>('WARMUP_MINUTE');
const singleValue = ref('');
const singleQueryValue = ref<string | null>(null);

const configKeyLabelMap: Record<ConfigKey, string> = {
    WARMUP_MINUTE: '预热提前分钟',
    PAY_TIMEOUT_MINUTE: '支付超时分钟',
    PAY_AMOUNT: '支付金额（元）',
    GENERATE_TIME_SLOT_TIME: '时间槽生成时间',
    COURT_COUNT: '球场数量',
    COURT_NAME_FORMAT: '球场命名模板',
};

const keys = computed<ConfigKey[]>(() => [
    'WARMUP_MINUTE',
    'PAY_TIMEOUT_MINUTE',
    'PAY_AMOUNT',
    'GENERATE_TIME_SLOT_TIME',
    'COURT_COUNT',
    'COURT_NAME_FORMAT',
]);

const keyOptions = computed(() => keys.value.map((key) => ({label: configKeyLabelMap[key], value: key})));

function configLabel(key: ConfigKey): string {
    return configKeyLabelMap[key];
}

async function loadConfig(): Promise<void> {
    loading.value = true;
    try {
        config.value = await adminApi.getSystemConfig();
    } finally {
        loading.value = false;
    }
}

async function updateAll(): Promise<void> {
    const payload: ConfigDTO = {
        configItems: config.value.configItems.map((item) => ({
            configKey: item.configKey,
            value: item.value,
        })),
    };
    await adminApi.updateSystemConfig(payload);
    message.success('全部配置已保存');
    await loadConfig();
}

async function querySingle(): Promise<void> {
    singleQueryValue.value = await adminApi.getSystemConfigValue(singleKey.value);
}

async function updateSingle(): Promise<void> {
    await adminApi.updateSystemConfigValue(singleKey.value, singleValue.value);
    message.success('单项配置已保存');
    singleValue.value = '';
    await loadConfig();
}

loadConfig();
</script>

<template>
    <div class="space-y-4">
        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">系统配置项</div>
                    <div class="text-xs text-slate-500">配置项列表与批量保存</div>
                </div>
            </template>
            <div class="mb-3 flex flex-wrap gap-2">
                <n-button :loading="loading" class="w-full sm:w-auto" @click="loadConfig">刷新配置</n-button>
                <n-button class="w-full sm:w-auto" type="primary" @click="updateAll">提交全部配置</n-button>
            </div>

            <n-space vertical>
                <div
                    v-for="item in config.configItems"
                    :key="item.configKey"
                    class="grid grid-cols-1 gap-2 rounded border border-slate-200 p-3 sm:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr]"
                >
                    <n-tag class="xl:my-auto">{{ configLabel(item.configKey) }}</n-tag>
                    <n-input v-model:value="item.value"/>
                </div>
            </n-space>
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">单项配置查询与更新</div>
                    <div class="text-xs text-slate-500">按配置名称快速查询和修改</div>
                </div>
            </template>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <n-select v-model:value="singleKey" :options="keyOptions"/>
                <n-input v-model:value="singleValue" placeholder="请输入配置值"/>
                <div class="flex flex-wrap gap-2">
                    <n-button class="w-full sm:w-auto" @click="querySingle">查询当前值</n-button>
                    <n-button class="w-full sm:w-auto" type="primary" @click="updateSingle">更新单项</n-button>
                </div>
            </div>
            <div class="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <span class="font-medium">查询结果：</span>{{ singleQueryValue ?? '暂无' }}
            </div>
        </n-card>
    </div>
</template>


