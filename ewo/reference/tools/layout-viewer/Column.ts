// ~/constants/Column.ts
// Generated from templateee4/laravel/app/Enums/Column.php (App\Enums\Column)

export const Column = {
    ID: 'id',
    N_CAT: 'n_cat',
    U_CAT: 'u_cat',
    LINE_ID: 'line_id',
    PARENT_ID: 'parent_id',
    DEP_ID: 'dep_id',
    KEY: 'key',
    I_TYPE: 'i_type',
    F_TYPE: 'f_type',
    VALUE: 'value',
} as const

export type ColumnName = keyof typeof Column
export type ColumnValue = typeof Column[ColumnName]
