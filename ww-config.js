const virtualScrollHelp =
    'Virtual scrolling optimizes performance by only rendering visible options and a small buffer around them. When enabled, this feature can significantly improve loading and scrolling performance for large lists.</br></br>Important notes:</br>- The layout will be forced to a vertical list format</br>- Option items must be positioned at the root level of the Options List';

const bufferHelp =
    'The buffer is the amount of pixel to add to edges of the scrolling visible area to start rendering items further away.';

const minItemSizeHelp = 'The minimum height of an item in the virtual scroll.';

const sizeDependenciesHelp =
    'The main property that can affect the size of the item. This prop will be watched and if it changes, the size will be recomputed.';

export default {
    editor: {
        label: 'Select Options List',
        icon: 'select',
        hint: (_, sidepanelContent) => {
            const warning = {
                section: 'style',
                type: 'warning',
                text: 'Options List must be placed inside a Select element.',
            };

            return [
                ...(sidepanelContent.isInSelect === false ? [warning] : []),
                {
                    section: 'settings',
                    header: 'Options overwriting',
                    text: 'By default, the options list mirrors your selected data. However, you can customize the items by adjusting the Overwritten items property to fit your needs.',
                },
                {
                    section: 'settings',
                    header: 'Virtual scroll',
                    text: virtualScrollHelp,
                },
            ];
        },
        customStylePropertiesOrder: 'showEmptyStateInEditor',
        customSettingsPropertiesOrder: [
            'overwrittenItems',
            ['virtualScroll', 'virtualScrollBuffer', 'virtualScrollMinItemSize', 'virtualScrollSizeDependencies'],
        ],
    },
    inherit: {
        type: 'ww-layout',
    },
    options: {
        displayAllowedValues: ['flex', 'grid', 'inline-flex', 'inline-grid'],
    },
    properties: {
        overwrittenItems: {
            label: { en: 'Overwritten items' },
            type: 'ObjectList',
            options: {
                useSchema: true,
            },
            bindable: true,
            defaultValue: [],
            section: 'settings',
            /* wwEditor:start */
            bindingValidation: {
                validations: [
                    {
                        type: 'array',
                    },
                    {
                        type: 'object',
                    },
                ],
                tooltip:
                    'Overwrite the items from the `Choices` property. Can be used for filtering or custom search. A collection or an array of data: \n\n`myCollection` or `[{}, {}, ...]`',
            },
            /* wwEditor:end */
            section: 'settings',
        },
        virtualScroll: {
            label: { en: 'Virtual scroll' },
            type: 'OnOff',
            defaultValue: true,
            bindable: true,
            section: 'settings',
            /* wwEditor:start */
            bindingValidation: {
                validations: [{ type: 'boolean' }],
                tooltip: virtualScrollHelp,
            },
            propertyHelp: {
                tooltip: virtualScrollHelp,
            },
            /* wwEditor:end */
        },
        virtualScrollBuffer: {
            label: { en: 'Buffer' },
            type: 'Number',
            defaultValue: 600,
            bindable: true,
            section: 'settings',
            /* wwEditor:start */
            bindingValidation: {
                validations: [{ type: 'number' }],
                tooltip: bufferHelp,
            },
            propertyHelp: {
                tooltip: bufferHelp,
            },
            /* wwEditor:end */
            hidden: content => !content.virtualScroll,
        },
        virtualScrollMinItemSize: {
            label: { en: 'Min item size' },
            type: 'Number',
            defaultValue: 40,
            bindable: true,
            section: 'settings',
            /* wwEditor:start */
            bindingValidation: {
                validations: [{ type: 'number' }],
                tooltip: minItemSizeHelp,
            },
            propertyHelp: {
                tooltip: minItemSizeHelp,
            },
            /* wwEditor:end */
            hidden: content => !content.virtualScroll,
        },
        virtualScrollSizeDependencies: {
            label: { en: 'Size dependencies' },
            type: 'TextSelect',
            section: 'settings',
            options: (_, sidepanelContent) => {
                return {
                    options: Object.keys(sidepanelContent.optionProperties).map(property => ({
                        value: property,
                        label: property,
                    })),
                };
            },
            hidden: content => !content.virtualScroll,
            /* wwEditor:start */
            bindingValidation: {
                validations: [{ type: 'string' }],
                tooltip: sizeDependenciesHelp,
            },
            propertyHelp: {
                tooltip: sizeDependenciesHelp,
            },
            /* wwEditor:end */
        },
        showEmptyStateInEditor: {
            label: { en: 'Show empty state in editor' },
            type: 'OnOff',
            defaultValue: false,
            editorOnly: true,
        },
        optionProperties: {
            hidden: true,
            editorOnly: true,
            defaultValue: [],
        },
        optionItem: {
            hidden: true,
            defaultValue: {
                isWwObject: true,
                type: 'fcc8a26b-a742-4823-a2c2-7384f2e5d547',
            },
        },
        emptyStateContainer: {
            hidden: true,
            defaultValue: {
                isWwObject: true,
                type: 'ww-flexbox',
                name: 'Empty state',
            },
        },
        isInSelect: {
            hidden: true,
            editorOnly: true,
            defaultValue: false,
        },
    },
};
