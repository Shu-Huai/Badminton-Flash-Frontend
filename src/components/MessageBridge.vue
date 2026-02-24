<script lang="ts" setup>
import {onBeforeUnmount, onMounted} from 'vue';
import {useMessage} from 'naive-ui';
import {clearMessageApi, setMessageApi} from '../utils/message';

const message = useMessage();

onMounted(() => {
    setMessageApi(message);
});

onBeforeUnmount(() => {
    clearMessageApi();
});
</script>

<template>
    <span class="hidden"/>
</template>
