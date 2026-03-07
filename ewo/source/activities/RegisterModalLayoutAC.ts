/**
 * RegisterModalLayoutAC Activity
 * 
 * 生成されたLayoutをJointStoreに登録する
 * 
 * Input:
 *   - jointId: JointIDキー
 *   - layout: 登録するLayoutNode構造
 * 
 * Output:
 *   - success: 登録成功フラグ
 */

import type { ActivityFunction } from '~/types/activity'
import type { LayoutNode } from '~/types/vnode'
import { useJointStore } from '~/stores/joint'

export interface RegisterModalLayoutACPayload {
    jointId: string
    layout: LayoutNode
}

export interface RegisterModalLayoutACResult {
    success: boolean
}

export const RegisterModalLayoutAC: ActivityFunction = async (
    payload: RegisterModalLayoutACPayload
): Promise<RegisterModalLayoutACResult> => {
  const startTime = performance.now()
  console.log('[RegisterModalLayoutAC] 実行開始:', payload)

  try {
        const jointStore = useJointStore()
        jointStore.setData(payload.jointId, { layout: payload.layout })

        console.log('[RegisterModalLayoutAC] 完了: Layout registered for', payload.jointId)
        return { success: true}
    } catch (error) {
        console.error('[RegisterModalLayoutAC] エラー:', error)
        return { success: false }
    }
}

export const RegisterModalLayoutACDef = {
    name: 'RegisterModalLayoutAC',
    scope: 'common',
    description: '生成されたLayoutをJointStoreに登録する'
}
