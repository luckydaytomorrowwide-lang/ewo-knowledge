/**
 * Activity関連の型定義
 */

/**
 * Activity関数の型
 */
export type ActivityFunction = (payload: any) => Promise<any>

/**
 * Activity Map
 */
export type ActivityMap = Record<string, ActivityFunction>

/**
 * Activityカテゴリ
 */
export type ActivityCategory = 
  | 'data'        // データ取得・検索
  | 'processing'  // データ処理・変換
  | 'ui'          // UI描画
  | 'business'    // ビジネスロジック
  | 'integration' // 外部連携
  | 'workflow'    // Workflow制御

/**
 * Activity定義
 */
export interface ActivityDefinition {
  /** Activity名（Workflow定義で参照される名前） */
  name: string
  
  /** カテゴリ */
  category: ActivityCategory
  
  /** 説明 */
  description: string
  
  /** 入力スキーマ（JSON Schema形式） */
  inputSchema?: Record<string, any>
  
  /** 出力スキーマ（JSON Schema形式） */
  outputSchema?: Record<string, any>
  
  /** メタデータ（タグ、バージョン等） */
  metadata?: {
    version?: string
    tags?: string[]
    author?: string
    deprecated?: boolean
    [key: string]: any
  }
}

/**
 * Activity実行結果
 */
export interface ActivityResult<T = any> {
  status: 'success' | 'error'
  result?: T
  error?: string
  executionTime?: number
}

/**
 * Activity実行コンテキスト
 */
export interface ActivityContext {
  /** Workflow Instance ID */
  workflowInstanceId: string
  
  /** State名 */
  stateName: string
  
  /** Action名 */
  actionName?: string
  
  /** 実行開始時刻 */
  startedAt: string
  
  /** リトライ回数 */
  retryCount?: number
}

