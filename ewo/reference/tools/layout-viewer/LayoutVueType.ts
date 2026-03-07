// ~/constants/LayoutVueType.ts
// Generated from templateee4/laravel/app/Enums/LayoutVueType.php (App\Enums\LayoutVueType)

export const LayoutVueType = {
    ACTION_BUTTON: 'actionButton',
    ANCHOR: 'anchor',
    AVATAR: 'avatar',
    CARD: 'card',
    CHECKBOX: 'checkbox',
    FIELD_LABEL: 'fieldLabel',
    HEADER: 'header',
    INFO_ROW: 'infoRow',
    INPUT_TEXT: 'inputText',
    INPUT_TEXTAREA: 'inputTextarea',
    INPUT_NUMBER: 'inputNumber',
    INPUT_BOOLEAN: 'inputBoolean',
    INPUT_SELECT: 'inputSelect',
    INPUT_RADIO: 'inputRadio',
    INPUT_CHECKBOX: 'inputCheckbox',
    INPUT_FILE: 'inputFile',
    INPUT_FIELD: 'inputField',
    INPUT: 'input',
    CALENDAR: 'calendar',
    JOINT_CONTAINER: 'jointContainer',
    SELECT_FIELD: 'selectField',
    TAB_GROUP: 'tabGroup',
    ACTION_TAB: 'actionTab',
    ACTION_AUTO: 'actionAuto',
    TEXT_LABEL: 'textLabel',
    TEXT_VALUE: 'textValue',
    
    HIDDEN: 'hidden',
} as const

export type LayoutVueTypeName = keyof typeof LayoutVueType
export type LayoutVueTypeValue = typeof LayoutVueType[LayoutVueTypeName]
