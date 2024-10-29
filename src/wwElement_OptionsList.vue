<template>
    <DynamicScroller
        v-if="virtualScroll && filteredOptions.length > 0"
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

    <wwSimpleLayout v-else-if="!virtualScroll && filteredOptions.length > 0">
        <wwLayoutItemContext
            v-for="(item, index) in filteredOptions"
            :key="index"
            is-repeat
            :index="index"
            :data="item"
        >
            <wwElement v-bind="content.optionItem" />
        </wwLayoutItemContext>
    </wwSimpleLayout>

    <wwLayout
        v-show="filteredOptions.length === 0 || wwEditorState.sidepanelContent.showEmptyStateInEditor"
        path="emptyList"
    />
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
        const isEditing = computed(() => {
            /* wwEditor:start */
            return props.wwEditorState.isEditing;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        });

        const rawData = inject('_wwRawData', ref([]));
        const searchState = inject('_wwSelectSearchState', ref(null));
        const { updateSearch } = inject('_wwSelectUseSearch', {});
        const registerOptionProperties = inject('_wwRegisterOptionProperties', () => {});
        const overwrittenItems = computed(() => props.content.overwrittenItems);
        const virtualScroll = computed(() => props.content.virtualScroll);
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
            const searchBy = searchState.value?.searchBy || ['label', 'value'];
            return options.filter(option => {
                return searchBy.some(key => {
                    const optionValue = option[key];
                    return optionValue && optionValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                });
            });
        });

        const filteredOptions = computed(() => {
            if (!searchState.value || !searchState.value.value) return options.value;
            return memoizedFilter(options.value, searchState.value.value);
        });

        watch(filteredOptions, () => {
            if (updateSearch) {
                const searchMatches = searchState.value && searchState.value.value ? filteredOptions.value : [];
                updateSearch({ ...searchState.value, searchMatches });
            }
        });

        watch(
            optionProperties,
            value => {
                emit('update:sidepanel-content', { path: 'optionProperties', value });
                if (registerOptionProperties) registerOptionProperties(value);
            },
            { immediate: true }
        );

        /* wwEditor:start */
        watch(
            isEditing,
            () => {
                emit('update:sidepanel-content', { path: 'showEmptyStateInEditor', value: false });
            },
            { immediate: true, deep: true }
        );
        /* wwEditor:end */

        return {
            filteredOptions,
            virtualScroll,
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
