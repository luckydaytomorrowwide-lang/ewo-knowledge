// stores/tableStruct.ts
import { defineStore } from 'pinia'
import { useAppConfig } from '#app'
import { TtlTableCore } from '@/utils/TtlTableCore'
import {useOptionStore} from "~/stores/option";

export type StructRow = {
    line_id: string
    n_cat?: string
    u_cat?: string
    parent_id?: string
    dep_id?: string[]
    key?: string
    i_type?: string
    f_type?: string
    value?: string
}

type ExpMap = Record<string, number>
type TableExpIndex = Record<string, ExpMap>

export const useTableStructStore = defineStore('tableStruct', {
    state: () => ({
        rows: {} as Record<string, StructRow[]>, // table -> rows
        _exp: {}  as TableExpIndex,              // table -> (lineId -> expiresAt)
        _core: null as TtlTableCore<StructRow> | null,
    }),

    getters: {
        // 参照時に必要なら期限延長(touchOnRead)
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
            this._core = new TtlTableCore<StructRow>(
                () => this.rows,
                (next) => { this.rows = next },
                () => this._exp,
                (next) => { this._exp = next },
                (r) => r.line_id, // 主キー
                () => ({
                    ttlMs: app.piniaTTL?.structTtlMs ?? 0,
                    sweepIntervalMs: app.piniaTTL?.sweepIntervalMs ?? 60000,
                    touchOnRead: !!app.piniaTTL?.touchOnRead,
                }),
                () => process.server
            )
            this._core.ensureSweeper()
        },

        // upsert的insert（TTL付与）
        insert(table: string, json: StructRow | StructRow[], opts?: { ttlMs?: number }) {
            this._ensureCore()
            this._core!.insert(table.toLowerCase(), json, opts?.ttlMs)
        },

        // AlaSQLで更新/削除した後はこれを呼ぶ（描画更新）
        commit(table: string) {
            this._ensureCore()
            this._core!.commit('table_struct_' + table.toLowerCase())
        },

        // 明示的な期限延長
        touch(table: string, ulids: string | string[], opts?: { ttlMs?: number }) {
            this._ensureCore()
            this._core!.touch('table_struct_' + table.toLowerCase(), ulids, opts?.ttlMs)
        },

        // 手動で全テーブルをスイープしたい場合（任意）
        sweepAll() {
            this._ensureCore()
            this._core!.sweepAll()
        },
    },
})


/**
 * 使い方例（どこかのVue/TSファイル）
 *
 * const tableStruct = useTableStruct()
 *
 * const list = alasql('SELECT * FROM ? WHERE value = ?', [tableStruct.rows['user'], '東京'])
 *
 * tableStruct.insert('user', { lineId: '01...', value: '東京' })
 *
 * // UPDATE（AlaSQLで直接）
 * alasql('UPDATE ? SET value = ? WHERE lineId = ?', [tableStruct.rows['user'], '大阪', '01...'])
 * tableStruct.commit('user')  // ← UI反映
 *
 * // DELETE（AlaSQLで直接）
 * alasql('DELETE FROM ? WHERE lineId = ?', [tableStruct.rows['user'], '01...'])
 * tableStruct.commit('user')  // ← UI反映
 */
