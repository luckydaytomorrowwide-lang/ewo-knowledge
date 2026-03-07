// stores/tableData.ts
import { defineStore } from 'pinia'
import { useAppConfig } from '#app'
import { TtlTableCore } from '@/utils/TtlTableCore'
import {useOptionStore} from "~/stores/option";

export type DataRow = {
    id?: string
    line_id?: string
    key?: string
    actual?: string
}

type ExpMap = Record<string, number>
type TableExpIndex = Record<string, ExpMap>

export const useTableDataStore = defineStore('tableData', {
    state: () => ({
        rows: {} as Record<string, DataRow[]>, // table -> rows
        _exp: {}  as TableExpIndex,            // table -> (id -> expiresAt)
        _core: null as TtlTableCore<DataRow> | null,
    }),

    getters: {
        byTable: (s) => (ulid: string) => {
            const table = ulid.toLowerCase()
            s._core?.onReadTable(table)
            return s.rows[table] ?? []
        },
    },

    actions: {
        _ensureCore() {
            if (this._core) return
            const app = useAppConfig()
            this._core = new TtlTableCore<DataRow>(
                () => this.rows,
                (next) => { this.rows = next },
                () => this._exp,
                (next) => { this._exp = next },
                (r) => r.id, // 主キー
                () => ({
                    ttlMs: app.piniaTTL?.dataTtlMs ?? 0,
                    sweepIntervalMs: app.piniaTTL?.sweepIntervalMs ?? 60000,
                    touchOnRead: !!app.piniaTTL?.touchOnRead,
                }),
                () => process.server
            )
            this._core.ensureSweeper()
        },

        insert(table: string, json: DataRow | DataRow[], opts?: { ttlMs?: number }) {
            this._ensureCore()
// Todo
            if (!json.id) {
                json.id = this.byTable(table.toLowerCase()).length + 1;
            }
            // this.byTable('node_' + table + '_data').length
            this._core!.insert(table.toLowerCase(), json, opts?.ttlMs)
        },

        commit(table: string) {
            this._ensureCore()
            this._core!.commit('table_data_' + table.toLowerCase())
        },

        touch(table: string, ids: string | string[], opts?: { ttlMs?: number }) {
            this._ensureCore()
            this._core!.touch('table_data_' + table.toLowerCase(), ids, opts?.ttlMs)
        },

        sweepAll() {
            this._ensureCore()
            this._core!.sweepAll()
        },
    },
})


/**
 * 使い方例
 *
 * const tableData = useTableData()
 * tableData.insert('user', { id: '1', lineId: '01...', key: 'value', actual: '東京' })
 *
 * // UPDATE
 * alasql('UPDATE ? SET actual = ? WHERE lineId = ?', [tableData.rows['user'], '大阪', '01...'])
 * tableData.commit('user')
 *
 * // DELETE
 * alasql('DELETE FROM ? WHERE id = ?', [tableData.rows['user'], '1'])
 * tableData.commit('user')
 */
