/**
 * PatchLayoutMapAC
 * 
 * LayoutMapDataに対して特定のパッチ（Snacking View用など）を適用する
 * (Vueコンポーネント内の patchSnackingLayout のロジックを移行)
 */

import type { ActivityFunction } from '~/types/activity'

export interface PatchLayoutMapACPayload {
    layoutMapData: Record<string, any>
}

export interface PatchLayoutMapACResult {
    layoutMapData: Record<string, any>
}

export const PatchLayoutMapAC: ActivityFunction = async (
    payload: PatchLayoutMapACPayload
): Promise<PatchLayoutMapACResult> => {
    const startTime = performance.now()
    console.log('[PatchLayoutMapAC] パッチ適用開始')

    const layoutMapData = payload.layoutMapData // Reference copy (mutable)

    let patchCount = 0
    let inputPatchCount = 0

    for (const [key, blockData] of Object.entries(layoutMapData)) {
        const prop = blockData.property

        // [PATCH 1] Button Rendering Fix
        if (prop && prop.buttonLabel) {
            blockData.viewType = 'actionButton'
            blockData.editType = 'actionButton'

            // [PATCH 2] Inject Properties into Basic Info Button
            if (prop.buttonLabel === '基本情報' || key === 'block[root].block[01KFZ00V39RJ6VHGYHXX42TKTW]') {
                console.log(`[PatchLayoutMapAC] Injecting properties to Basic Info Button (${key})`)
                Object.assign(prop, {
                    "varName": "openTabBtn",
                    "label": "タブOPEN",
                    "icon": "",
                    "value": "タブOPEN",
                    "display": "normal",
                    "jointIds[]": "[table:cncf_masters|lineId:1|key:value]",
                    "layoutMapConfigId": "table:layoutmap_config_masters|lineId:1|key:value",
                    "snackingConfigIds": "table:snacking_config_masters|lineId:1|key:value",
                    "buttonConfigId": "table:button_config_masters|lineId:1|key:value",
                    "searchType": "1",
                    "currentNodeId": null,
                    "edgeType": "TREE_CONNECT",
                    "nodeLabel": "基本情報:instance",
                    "row": null
                })
            }

            // console.log(`[Patch] ${key}: textValue → actionButton (label=${prop.buttonLabel})`)
            patchCount++
            continue
        }

        // [PATCH 3] Text Value -> Input Field
        if (prop && prop.fType === 'text' && prop.key === 'value') {
            blockData.viewType = 'inputField'
            blockData.type = 'inputField'

            prop.placeholder = prop.value
            inputPatchCount++
            // console.log(`[Patch] ${key}: text(value) → inputField (cell=${prop.lineId})`)

            // Inject Update Button as CHILD of Input Field
            const btnKey = `${key}.block[update-btn]`
            layoutMapData[btnKey] = {
                viewType: 'actionButton',
                property: {
                    text: '更新',
                    variant: 'primary',
                    jointId: 'update-btn',
                    icon: '🔄',
                    buttonJointId: prop.cell
                }
            }
        }
    }

    const endTime = performance.now()
    console.log(`[PatchLayoutMapAC] パッチ適用完了 (${(endTime - startTime).toFixed(3)}ms): ActionButton=${patchCount}件, InputField=${inputPatchCount}件`)

    return { layoutMapData }
}

export const PatchLayoutMapACDef = {
    name: 'PatchLayoutMapAC',
    scope: 'common',
    description: 'LayoutMapDataにパッチを適用する',
}
