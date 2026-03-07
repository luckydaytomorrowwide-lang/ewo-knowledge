// utils/TtlTableCore.ts
// 目的: Piniaの「テーブル名→配列」データにTTL(期限)を付けて自動削除する共通クラス
// - rowsMap: { [tableName]: Array<Row> } を保持するPiniaのstateを外から渡す
// - key抽出関数(getKey)だけ指定すればOK（例: r => r.lineId / r.id）
// - AlaSQLは別で、UPDATE/DELETE後にcommit(table)で再描画

export type TtlConfig = {
    ttlMs: number;           // 既定TTL(ミリ秒)。0なら無期限
    sweepIntervalMs: number; // スイープ周期(ミリ秒)
    touchOnRead: boolean;    // 参照(byTable)で期限を延長するか
};

type ExpMap = Record<string, number>;      // 主キー -> 期限
type TableExpIndex = Record<string, ExpMap>; // table -> (主キー -> 期限)

export class TtlTableCore<T extends Record<string, any>> {
    private sweeperId: number | null = null;
    private sweeperStarted = false;

    constructor(
        private getRowsMap: () => Record<string, T[]>,
        private setRowsMap: (next: Record<string, T[]>) => void,
        private getExpMap:  () => TableExpIndex,
        private setExpMap:  (next: TableExpIndex) => void,
        private getKey: (row: T) => string,
        private getConfig: () => TtlConfig,
        private isServer: () => boolean
    ) {}

    // ---- 内部の小さなユーティリティ（ttl.tsを内蔵） ----
    private now() { return Date.now(); }
    private computeExpiresAt(ttlMs: number) {
        return this.now() + Math.max(0, ttlMs);
    }
    private isExpired(expiresAt?: number) {
        return typeof expiresAt === 'number' ? expiresAt <= this.now() : false;
    }

    // ---- スイーパー起動（クライアントのみ） ----
    ensureSweeper() {
        if (this.sweeperStarted || this.isServer()) return;
        const cfg = this.getConfig();
        const interval = Math.max(1000, cfg.sweepIntervalMs || 60000);
        this.sweeperId = window.setInterval(() => this.sweepAll(), interval);
        this.sweeperStarted = true;
    }

    // ---- 追加(既存キーはマージ) + TTL付与 ----
    insert(table: string, json: T | T[], ttlOverrideMs?: number) {
        this.ensureSweeper();

        const cfg = this.getConfig();
        const ttl = typeof ttlOverrideMs === 'number' ? ttlOverrideMs : (cfg.ttlMs || 0);

        // 現在のマップをコピー（Piniaに依存しない純粋なオブジェクト操作）
        const rowsMap = { ...this.getRowsMap() };
        const expMap  = { ...this.getExpMap() };

        const items = Array.isArray(json) ? json : [json];
        const arr = rowsMap[table] ? [...rowsMap[table]] : [];
        const exp = { ...(expMap[table] ?? {}) };
        const idx = new Map(arr.map((r, i) => [this.getKey(r), i]));
        const expiresAt = ttl > 0 ? this.computeExpiresAt(ttl) : Number.POSITIVE_INFINITY;

        for (const r of items) {
            const k = this.getKey(r);
            const i = idx.get(k);
            if (i != null) arr[i] = { ...arr[i], ...r };
            else arr.push(r);
            exp[k] = expiresAt; // 期限設定
        }

        rowsMap[table] = arr;
        expMap[table]  = exp;
        this.setRowsMap(rowsMap);
        this.setExpMap(expMap);
    }

    // ---- 読み取り時の期限延長（必要なら） ----
    onReadTable(table: string) {
        const cfg = this.getConfig();
        if (!cfg.touchOnRead) return;

        const rows = this.getRowsMap()[table] ?? [];
        if (!rows.length) return;

        const ttl = cfg.ttlMs || 0;
        if (!ttl) return;

        const expMap = { ...this.getExpMap() };
        const tableExp = { ...(expMap[table] ?? {}) };
        let changed = false;
        const extendThreshold = this.now() + ttl * 0.5; // 半分切ったら延長

        for (const r of rows) {
            const k = this.getKey(r);
            const cur = tableExp[k];
            if (!cur || cur < extendThreshold) {
                tableExp[k] = this.computeExpiresAt(ttl);
                changed = true;
            }
        }
        if (changed) {
            expMap[table] = tableExp;
            this.setExpMap(expMap);
        }
    }

    // ---- 期限切れ削除（テーブル単位） ----
    sweepTable(table: string) {
        const rows = this.getRowsMap()[table];
        const exp  = this.getExpMap()[table];
        if (!rows || !exp) return;

        let changed = false;
        const kept: T[] = [];
        const newExp: Record<string, number> = {};

        for (const r of rows) {
            const k = this.getKey(r);
            const e = exp[k];
            if (!this.isExpired(e)) {
                kept.push(r);
                if (e != null) newExp[k] = e;
            } else {
                changed = true;
            }
        }

        if (changed) {
            const rowsMap = { ...this.getRowsMap() };
            const expMap  = { ...this.getExpMap() };
            rowsMap[table] = kept;
            expMap[table]  = newExp;
            this.setRowsMap(rowsMap);
            this.setExpMap(expMap);
            this.commit(table); // 再描画
        }
    }

    // ---- 全テーブルをスイープ ----
    sweepAll() {
        const rowsMap = this.getRowsMap();
        for (const t of Object.keys(rowsMap)) this.sweepTable(t);
    }

    // ---- 再描画（AlaSQL後に必ず呼ぶ） ----
    commit(table: string) {
        const rowsMap = { ...this.getRowsMap() };
        rowsMap[table] = [...(rowsMap[table] ?? [])]; // 配列を再代入してリアクティブに
        this.setRowsMap(rowsMap);
    }

    // ---- 明示的な期限延長（キー指定） ----
    touch(table: string, keys: string | string[], ttlOverrideMs?: number) {
        const cfg = this.getConfig();
        const ttl = typeof ttlOverrideMs === 'number' ? ttlOverrideMs : (cfg.ttlMs || 0);
        if (!ttl) return;

        const list = Array.isArray(keys) ? keys : [keys];
        const expMap = { ...this.getExpMap() };
        const tableExp = { ...(expMap[table] ?? {}) };
        const ea = this.computeExpiresAt(ttl);

        for (const k of list) tableExp[k] = ea;

        expMap[table] = tableExp;
        this.setExpMap(expMap);
    }
}
