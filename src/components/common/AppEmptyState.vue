<script lang="ts" setup>
withDefaults(
    defineProps<{
        title: string;
        description?: string;
        hint?: string;
    }>(),
    {
        description: '',
        hint: '',
    },
);
</script>

<template>
    <div class="empty-state-panel mt-4">
        <div aria-hidden="true" class="empty-state-icon">◎</div>
        <div class="empty-state-title">{{ title }}</div>
        <div v-if="description" class="empty-state-desc">{{ description }}</div>
        <div v-if="hint" class="empty-state-hint">{{ hint }}</div>
        <slot/>
    </div>
</template>
