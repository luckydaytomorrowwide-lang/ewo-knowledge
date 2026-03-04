/**
 * MakeJointIdAC Activity
 * 
 * JointIDを生成する
 * 
 * Input:
 *   - tableName: テーブル名
 *   - lineId: 行ID
 *   - key: キー（オプション、デフォルト: 空文字列）
 * 
 * Output:
 *   - jointId: 生成されたJointID（例: "table:xxx|lineId:yyy|key:zzz"）
 */

import type { ActivityFunction } from '~/types/activity'

export interface MakeJointIdACPayload {
  tableName: string
  lineId: string
  key?: string
}

export interface MakeJointIdACResult {
  jointId: string
}

export const MakeJointIdAC: ActivityFunction = async (
  payload: MakeJointIdACPayload
): Promise<MakeJointIdACResult> => {
  const startTime = performance.now()
  console.log('[MakeJointIdAC] 実行開始:', payload)

  const { tableName, lineId, key = '' } = payload
  
  const jointId = `table:${tableName}|lineId:${lineId}|key:${key}`
  
  const result = { jointId }

  const endTime = performance.now()
  console.log(`[MakeJointIdAC] 完了 (${(endTime - startTime).toFixed(3)}ms):`, result)
  return result
}

export const MakeJointIdACDef = {
  name: 'MakeJointIdAC',
  scope: 'common',
  description: 'JointIDを生成する'
}

