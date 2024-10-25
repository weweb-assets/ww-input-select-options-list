<template>
    <DynamicScroller
        v-if="useVirtualScroll && filteredOptions.length > 0"
        class="ww-options-list"
        :items="filteredOptions"
        :min-item-size="virtualScrollMinItemSize"
        :buffer="virtualScrollBuffer"
    >
        <template v-slot="{ item, index, active }">
            <DynamicScrollerItem
                :item="item"
                :active="active"
                :size-dependencies="[item ? item[virtualScrollSizeDependencies] : JSON.stringify(item)]"
                :data-index="index"
            >
                <wwLayoutItemContext :key="index" is-repeat :index="index" :data="item">
                    <wwElement v-bind="content.optionItem" />
                </wwLayoutItemContext>
            </DynamicScrollerItem>
        </template>
    </DynamicScroller>

    <div v-else-if="filteredOptions.length > 0" class="ww-options-list" :style="$attrs.style" v-bind="$attrs">
        <wwLayoutItemContext
            v-for="(item, index) in filteredOptions"
            :key="index"
            is-repeat
            :index="index"
            :data="item"
        >
            <wwElement v-bind="content.optionItem" />
        </wwLayoutItemContext>
    </div>

    <!-- TODO: Empty state -->
    <wwLayout v-else class="ww-options-list-empty" path="emptyState" />
</template>

<script>
import { ref, inject, computed, watch } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { useMemoize } from '@vueuse/core';

export default {
    components: {
        DynamicScroller,
        DynamicScrollerItem,
    },
    props: {
        content: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
        wwElementState: { type: Object, required: true },
    },
    emits: ['update:sidepanel-content'],
    setup(props, { emit }) {
        const rawData = inject('_wwRawData', ref([]));
        const optionsFilter = inject('_wwSelectOptionsFilter', ref(null));
        const registerOptionProperties = inject('_wwRegisterOptionProperties', () => {});
        const overwrittenItems = computed(() => props.content.overwrittenItems);
        const useVirtualScroll = computed(() => props.content.virtualScroll || true);
        const virtualScrollSizeDependencies = computed(() => props.content.virtualScrollSizeDependencies);
        const virtualScrollMinItemSize = computed(() => props.content.virtualScrollMinItemSize || 40);
        const virtualScrollBuffer = computed(() => props.content.virtualScrollBuffer || 400);

        const options = computed(() => {
            const items = (overwrittenItems.value || []).length > 0 ? overwrittenItems.value : rawData.value;
            return Array.isArray(items) ? items : [];
        });

        const optionProperties = computed(() => {
            if (!options.value || options.value.length === 0) return {};
            return options.value[0];
        });

        const memoizedFilter = useMemoize((options, filterValue) => {
            const searchBy = optionsFilter.value?.searchBy || ['label', 'value'];
            return options.filter(option => {
                return searchBy.some(key => {
                    const optionValue = option[key];
                    return optionValue && optionValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                });
            });
        });

        const filteredOptions = computed(() => {
            if (!optionsFilter.value || !optionsFilter.value.value) return options.value;
            return memoizedFilter(options.value, optionsFilter.value.value);
        });

        watch(
            optionProperties,
            value => {
                emit('update:sidepanel-content', {
                    path: 'optionProperties',
                    value,
                });

                if (registerOptionProperties) registerOptionProperties(value);
            },
            { immediate: true }
        );

        return {
            filteredOptions,
            useVirtualScroll,
            virtualScrollSizeDependencies,
            virtualScrollMinItemSize,
            virtualScrollBuffer,
        };
    },
};
</script>

<style>
@import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
</style>

<style scoped>
.ww-options-list {
    height: 100%;
}
</style>
