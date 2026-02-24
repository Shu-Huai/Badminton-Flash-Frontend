<script lang="ts" setup>
import {computed, ref} from 'vue';
import type {Court} from '../../types/api';
import * as browseApi from '../../api/browse';
import {useMessage} from 'naive-ui';
import AppEmptyState from '../common/AppEmptyState.vue';

const message = useMessage();

const courtNameLike = ref('');
const loading = ref(false);
const courts = ref<Court[]>([]);

const detailId = ref<number | null>(null);
const detail = ref<Court | null>(null);

const detailRows = computed(() => {
    if (!detail.value) {
        return [];
    }
    return [
        ['球场编号', detail.value.id],
        ['球场名称', detail.value.courtName],
        ['是否启用', detail.value.isActive ? '是' : '否'],
    ];
});

async function loadCourts(): Promise<void> {
    loading.value = true;
    try {
        courts.value = await browseApi.getCourts(courtNameLike.value || undefined);
    } finally {
        loading.value = false;
    }
}

async function loadCourtById(): Promise<void> {
    if (!detailId.value) {
        message.warning('请输入球场编号');
        return;
    }
    detail.value = await browseApi.getCourt(detailId.value);
}

loadCourts();
</script>

<template>
    <div class="space-y-4">
        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">球场列表</div>
                    <div class="text-xs text-slate-500">可按名称搜索球场</div>
                </div>
            </template>
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                <n-input v-model:value="courtNameLike" clearable placeholder="输入球场名关键词"/>
                <n-button :loading="loading" class="w-full lg:w-auto" type="primary" @click="loadCourts">搜索</n-button>
            </div>
            <n-data-table
                :columns="[
          { title: '编号', key: 'id', width: 80 },
          { title: '名称', key: 'courtName' },
          { title: '启用', key: 'isActive', width: 80 },
        ]"
                :data="courts"
                :loading="loading"
                :pagination="{ pageSize: 10 }"
                :scroll-x="680"
                :single-line="false"
                class="mobile-table mt-4"
                style="--table-min-width: 680px"
            />
        </n-card>

        <n-card :bordered="false" class="panel-card panel-switch">
            <template #header>
                <div>
                    <div class="text-base font-semibold text-slate-800">球场详情</div>
                    <div class="text-xs text-slate-500">输入球场编号查看详情</div>
                </div>
            </template>
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
                <n-input-number v-model:value="detailId" class="w-full" clearable placeholder="球场编号"/>
                <n-button class="w-full lg:w-auto" @click="loadCourtById">查看详情</n-button>
            </div>

            <AppEmptyState v-if="!detail" description="请输入球场编号并点击“查看详情”"
                           hint="可以先用关键词在上方快速搜索"
                           title="还没有球场详情"/>
            <n-descriptions v-else :column="1" bordered class="mt-3" label-placement="left">
                <n-descriptions-item v-for="row in detailRows" :key="row[0]" :label="row[0]">{{
                        row[1]
                    }}
                </n-descriptions-item>
            </n-descriptions>
        </n-card>
    </div>
</template>


