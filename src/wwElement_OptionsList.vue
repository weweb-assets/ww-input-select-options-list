<template>
    <DynamicScroller
        v-if="useVirtualScroll"
        class="ww-options-list"
        :items="filteredOptions"
        :min-item-size="virtualScrollMinItemSize"
        :buffer="virtualScrollBuffer"
    >
        <template v-slot="{ item, index, active }">
            <DynamicScrollerItem
                :item="item"
                :active="active"
                :size-dependencies="[item[virtualScrollSizeDependencies] || JSON.stringify(item)]"
                :data-index="index"
            >
                <wwLayoutItemContext :key="index" is-repeat :index="index" :data="item">
                    <wwElement v-bind="content.optionItem" />
                </wwLayoutItemContext>
            </DynamicScrollerItem>
        </template>
    </DynamicScroller>

    <div v-else class="ww-options-list">
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
</template>

<script>
import { ref, inject, computed, watch } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

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
        const selectRawData = inject('_wwSelectRawData', ref([]));
        const selectOptions = inject('_wwSelectOptions', ref([]));
        const optionsFilter = inject('_wwSelectOptionsFilter', ref(null));
        const overwrittenItems = computed(() => props.content.overwrittenItems);
        const useVirtualScroll = computed(() => props.content.virtualScroll);
        const virtualScrollSizeDependencies = computed(() => props.content.virtualScrollSizeDependencies);
        const virtualScrollMinItemSize = computed(() => props.content.virtualScrollMinItemSize || 40);
        const virtualScrollBuffer = computed(() => props.content.virtualScrollBuffer || 400);

        const options = computed(() => {
            const items = (overwrittenItems.value || []).length > 0 ? overwrittenItems.value : selectRawData;
            return (items.value || []).map((item, index) => {
                return { ...item, wewebOption: selectOptions.value[index] };
            });
        });

        // watch(
        //     options,
        //     () => {
        //         if (options.value && options.value.length > 0) {
        //             emit('update:sidepanel-content', {
        //                 path: 'optionProperties',
        //                 value: Object.keys(options.value[0]),
        //             });
        //         }
        //     },
        //     { immediate: true, deep: true }
        // );

        const filteredOptions = computed(() => {
            if (!optionsFilter.value || !optionsFilter.value.value) return options.value;
            const filterValue = optionsFilter.value.value.toLowerCase();
            const filterBy = optionsFilter.value.filterBy || 'label';
            return options.value.filter(option => {
                const optionValue = `${option?.wewebOption?.[filterBy]}`.toLowerCase();
                return optionValue.includes(filterValue);
            });
        });

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
