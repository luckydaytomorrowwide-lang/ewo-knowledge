/**
 * イベントバス用Composable
 * 
 * Provide/Injectパターンで深い階層のコンポーネントから
 * 親でイベントを一括受け取るための仕組み
 */

import { ref, readonly, type Ref } from 'vue'

export interface EventMessage {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  duration?: number
}

export interface EventBusHandlers {
  onSearch: (searchKey: string) => void
  onInterest: (jinzaiId: string, jinzaiName: string) => void
  onCandidate: (jinzaiId: string, jinzaiName: string) => void
  onMatching: (jinzaiId: string, jinzaiName: string) => void
  onBatchProcess: (selectedIds: string[]) => void
  onAutoExecute: () => void
  onSuccess: (title: string, message: string, duration?: number) => void
  onError: (message: string) => void
  onInfo: (message: string) => void
  onWarning: (message: string) => void
  onAction: (actionKey: string, payload?: any) => void
  onInput: (payload: any) => void
}

/**
 * イベントバスを作成（親コンポーネント側で使用）
 */
export function useEventBus() {
  const messages = ref<EventMessage[]>([])

  // メッセージを追加
  const addMessage = (
    type: EventMessage['type'],
    title: string,
    message: string,
    duration: number = 3000
  ) => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newMessage: EventMessage = {
      id,
      type,
      title,
      message,
      timestamp: Date.now(),
      duration
    }

    messages.value.push(newMessage)

    // 自動削除
    if (duration > 0) {
      setTimeout(() => {
        removeMessage(id)
      }, duration)
    }
  }

  // メッセージを削除
  const removeMessage = (id: string) => {
    const index = messages.value.findIndex(msg => msg.id === id)
    if (index > -1) {
      messages.value.splice(index, 1)
    }
  }

  // イベントハンドラーを定義
  const handlers: EventBusHandlers = {
    onSearch: (searchKey: string) => {
      console.log('[EventBus] 検索実行:', searchKey)
      addMessage(
        'info',
        '検索実行',
        `検索キー「${searchKey}」で検索しました`,
        3000
      )
    },

    onInterest: (jinzaiId: string, jinzaiName: string) => {
      console.log('[EventBus] 気になる:', jinzaiId, jinzaiName)
      addMessage(
        'success',
        '気になるリストに追加',
        `${jinzaiName}さんを気になるリストに追加しました`,
        3000
      )
    },

    onCandidate: (jinzaiId: string, jinzaiName: string) => {
      console.log('[EventBus] 候補:', jinzaiId, jinzaiName)
      addMessage(
        'success',
        '候補リストに追加',
        `${jinzaiName}さんを候補リストに追加しました`,
        3000
      )
    },

    onMatching: (jinzaiId: string, jinzaiName: string) => {
      console.log('[EventBus] マッチング:', jinzaiId, jinzaiName)
      addMessage(
        'warning',
        'マッチング処理中',
        `${jinzaiName}さんとのマッチング処理を開始しました`,
        4000
      )
    },

    onBatchProcess: (selectedIds: string[]) => {
      console.log('[EventBus] 一括処理:', selectedIds)
      if (selectedIds.length === 0) {
        addMessage(
          'warning',
          '選択なし',
          '処理する人材を選択してください',
          3000
        )
      } else {
        addMessage(
          'info',
          '一括処理実行',
          `${selectedIds.length}件の人材を一括処理しました`,
          3000
        )
      }
    },

    onAutoExecute: () => {
      console.log('[EventBus] 自動実行')
      addMessage(
        'info',
        '自動実行開始',
        'ワークフローの自動実行を開始しました',
        4000
      )
    },

    onSuccess: (title: string, message: string, duration: number = 3000) => {
      console.log('[EventBus] Success:', title, message)
      addMessage('success', title, message, duration)
    },

    onError: (message: string) => {
      console.log('[EventBus] Error:', message)
      addMessage('error', 'エラー', message, 4000)
    },

    onInfo: (message: string) => {
      console.log('[EventBus] Info:', message)
      addMessage('info', '情報', message, 3000)
    },

    onWarning: (message: string) => {
      console.log('[EventBus] Warning:', message)
      addMessage('warning', '警告', message, 3000)
    },

    onAction: (actionKey: string, payload?: any) => {
      console.log('[EventBus] Action:', actionKey, payload)
      // デフォルトでは何もしないか、汎用的なログ出力のみ
      // 親コンポーネントでこの関数をオーバーライドするか、
      // EventBus自体を介して通知する仕組みが必要だが、
      // ここでは単純にインターフェース定義とデフォルト実装を追加。
    },

    onInput: (payload: any) => {
      console.log('[EventBus] Input:', payload)
    }
  }

  return {
    messages: readonly(messages) as Readonly<Ref<EventMessage[]>>,
    addMessage,
    removeMessage,
    handlers
  }
}

/**
 * イベントハンドラーをInjectするためのキー
 */
export const EVENT_BUS_KEY = Symbol('eventBus')

