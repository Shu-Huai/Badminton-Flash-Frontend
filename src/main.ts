import {createApp} from 'vue';
import {
    create,
    NButton,
    NCard,
    NCode,
    NDataTable,
    NDescriptions,
    NDescriptionsItem,
    NDivider,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NMenu,
    NResult,
    NSelect,
    NSpace,
    NTabPane,
    NTabs,
    NTag,
} from 'naive-ui';
import {createPinia} from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);
const naive = create({
    components: [
        NButton,
        NCard,
        NCode,
        NDataTable,
        NDescriptions,
        NDescriptionsItem,
        NDivider,
        NForm,
        NFormItem,
        NInput,
        NInputNumber,
        NMenu,
        NSelect,
        NSpace,
        NTabPane,
        NTabs,
        NTag,
        NResult,
    ],
});

app.use(createPinia());
app.use(naive);
app.use(router);
app.mount('#app');
