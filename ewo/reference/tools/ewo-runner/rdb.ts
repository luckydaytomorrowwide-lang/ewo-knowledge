// stores/rdb.ts
import { defineStore } from 'pinia'
import { useAppConfig } from '#app'
import { TtlTableCore } from '@/utils/TtlTableCore'

type ExpMap = Record<string, number>
type TableExpIndex = Record<string, ExpMap>

// --- localStorage 永続化 ---
const RDB_STORAGE_KEY = 'rdb-store-v1'

function _loadStorage(): { rows: Record<string, any[]>, _exp: TableExpIndex } {
    if (typeof window === 'undefined') return { rows: {}, _exp: {} }
    try {
        const raw = localStorage.getItem(RDB_STORAGE_KEY)
        if (!raw) return { rows: {}, _exp: {} }
        const parsed = JSON.parse(raw)
        return { rows: parsed.rows ?? {}, _exp: parsed._exp ?? {} }
    } catch { return { rows: {}, _exp: {} } }
}

function _saveStorage(rows: Record<string, any[]>, _exp: TableExpIndex) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(RDB_STORAGE_KEY, JSON.stringify({ rows, _exp }))
    } catch (e) {
        console.warn('[rdb] localStorage save failed:', e)
    }
}

/** _custom ラッパー付きデータにも対応する主キー抽出 */
function _extractLineId(r: any): string {
    return r.line_id ?? r._custom?.value?.line_id ?? ''
}

export const useRdbStore = defineStore('rdb', {
    state: () => {
        const saved = _loadStorage()
        return {
            rows: saved.rows as Record<string, any[]>,
            _exp: saved._exp as TableExpIndex,
            _core: null as TtlTableCore<any> | null,
        }
    },

    getters: {
        byTable: (s) => (ulid: string) => {
            const table = ulid.toLowerCase()
            s._core?.onReadTable(table)
            return s.rows[table] ?? []
        },

        tableNames: (s) => Object.keys(s.rows),

        tableStats: (s) => Object.entries(s.rows).map(([name, arr]) => ({
            name,
            rowCount: arr.length,
        })),
    },

    actions: {
        _ensureCore() {
            if (this._core) return
            const app = useAppConfig()
            this._core = new TtlTableCore<any>(
                () => this.rows,
                (next) => { this.rows = next },
                () => this._exp,
                (next) => { this._exp = next },
                _extractLineId,
                () => ({
                    ttlMs: app.piniaTTL?.ttlMs ?? 0,
                    sweepIntervalMs: app.piniaTTL?.sweepIntervalMs ?? 60000,
                    touchOnRead: !!app.piniaTTL?.touchOnRead,
                }),
                () => process.server
            )
            this._core.ensureSweeper()
        },

        _persist() {
            _saveStorage(this.rows, this._exp)
        },

        insert(table: string, json: any | any[], opts?: { ttlMs?: number }) {
            this._ensureCore()
            this._core!.insert(table.toLowerCase(), json, opts?.ttlMs)
            this._persist()
        },

        commit(table: string) {
            this._ensureCore()
            this._core!.commit(table.toLowerCase())
            this._persist()
        },

        touch(table: string, ulids: string | string[], opts?: { ttlMs?: number }) {
            this._ensureCore()
            this._core!.touch(table.toLowerCase(), ulids, opts?.ttlMs)
            this._persist()
        },

        sweepAll() {
            this._ensureCore()
            this._core!.sweepAll()
            this._persist()
        },

        dropTable(table: string) {
            const t = table.toLowerCase()
            const rows = { ...this.rows }
            const exp = { ...this._exp }
            delete rows[t]
            delete exp[t]
            this.rows = rows
            this._exp = exp
            this._persist()
        },

        dropTables(tables: string[]) {
            const rows = { ...this.rows }
            const exp = { ...this._exp }
            for (const t of tables) {
                const key = t.toLowerCase()
                delete rows[key]
                delete exp[key]
            }
            this.rows = rows
            this._exp = exp
            this._persist()
        },

        clearAll() {
            this.rows = {}
            this._exp = {}
            this._persist()
        },

        rehydrate() {
            if (typeof window === 'undefined') return
            const saved = _loadStorage()
            if (Object.keys(saved.rows).length > 0 && Object.keys(this.rows).length === 0) {
                this.rows = saved.rows
                this._exp = saved._exp
                console.log(`[rdb] Rehydrated ${Object.keys(saved.rows).length} table(s) from localStorage`)
            }
        },
    },
})
