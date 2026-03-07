/**
 * GetPageIdAC Activity
 * 
 * 現在のページのノードULIDを取得する（routeのpageIdから取得）
 * 
 * Input:
 *   なし
 * 
 * Output:
 *   現在のページのノードULID
 */

import type { ActivityFunction } from '~/types/activity'

export const GetPageIdAC: ActivityFunction = async (
  payload?: any
): Promise<string> => {
  const startTime = performance.now()
  console.log('[GetPageIdAC] 実行開始:', payload)

  console.log('[GetPageIdAC] 実行開始')

  try {
      const nuxtApp = useNuxtApp()
      const currentRoute = (nuxtApp as any)?.$router?.currentRoute?.value
      const pageId = currentRoute?.params?.pageId as string | undefined
      if (pageId) {
          console.log('[GetPageIdAC] 完了($router.currentRoute):', pageId)
          return pageId
      }
  } catch (e) {
      console.warn('[GetPageIdAC] $router.currentRoute からの取得に失敗。', e)
  }

  throw new Error('GetPageIdAC: pageUlid を取得できませんでした')
}

export const GetPageIdACDef = {
  name: 'GetPageIdAC',
  scope: 'common',
  description: '現在のページのノードULIDを取得する'
}

