import { inject, ref, watch } from 'vue';

export default function useEditorHint(emit) {
    const isInSelect = inject('_wwSelectIsInSelect', ref(false));

    watch(
        isInSelect,
        isInSelect => {
            emit('update:sidepanel-content', { path: 'isInSelect', value: isInSelect });
        },
        { immediate: true }
    );

    return { isInSelect };
}
