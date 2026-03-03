/**
 * Common Activities - すべての共通Activityをエクスポート
 * 
 * 命名規則: PascalCase + AC
 * 配置: フラット構造（サブディレクトリなし）
 */

import type { ActivityMap } from '~/types/activity'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase 1: 基盤ユーティリティ（12個）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { ParseToArrayAC } from './ParseToArrayAC'
import { ParseCellRefAC } from './ParseCellRefAC'
import { BuildCellRefAC } from './BuildCellRefAC'
import { ParseTableNameAC } from './ParseTableNameAC'
import { MakeJointIdAC } from './MakeJointIdAC'
import { CreateEventIdAC } from './CreateEventIdAC'
import { CreateUlidAC } from './CreateUlidAC'
import { FirstRowAC } from './FirstRowAC'
import { RestoreCellRefAC } from './RestoreCellRefAC'
import { RegisterStructAC } from './RegisterStructAC'
import { RegisterDataAC } from './RegisterDataAC'
import { BuildTemporaryTableIdAC } from './BuildTemporaryTableIdAC'
import { ReplaceLayoutKeyAC } from './ReplaceLayoutKeyAC'
import { PaddingLayoutBlockAC } from './PaddingLayoutBlockAC'
import { ParseLayoutBlockKeyAC } from './ParseLayoutBlockKeyAC'
import { GetLayoutParentKeyAC } from './GetLayoutParentKeyAC'
import { ConvertLayoutRowsToMapAC } from './ConvertLayoutRowsToMapAC'
import { PatchLayoutMapAC } from './PatchLayoutMapAC'
import { ConvertScheduleToCalendarEventAC } from './ConvertScheduleToCalendarEventAC'
import { BuildLayoutCalendarJsonAC } from './BuildLayoutCalendarJsonAC'
import { OpenViewContextAC } from './OpenViewContextAC'
import { UpdateViewContextModeAC } from './UpdateViewContextModeAC'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase 2: データ展開・基本検索（7個）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { MergeTableAC } from './MergeTableAC'
import { MergeTableOldAC } from './MergeTableOldAC'
import { MergeRowsAC } from './MergeRowsAC'
import { SearchLineAC } from './SearchLineAC'
import { RetrieveColumnAC } from './RetrieveColumnAC'
import { RetrieveCellrefAC } from './RetrieveCellrefAC'
import { RegisterTemporaryAC } from './RegisterTemporaryAC'
import { SetParamAC } from './SetParamAC'
import { GetParamAC } from './GetParamAC'
import { ConcatStringAC } from './ConcatStringAC'
import { SeparateStringAC } from './SeparateStringAC'
import { CreateLayoutBlockKeyAC } from './CreateLayoutBlockKeyAC'
import { CreateLayoutBlockPropertyAC } from './CreateLayoutBlockPropertyAC'
import { BuildLayoutBlockRowAC } from './BuildLayoutBlockRowAC'
import { SearchLayoutJsonAC } from './SearchLayoutJsonAC'
import { SearchLayoutTemplateTypeAC } from './SearchLayoutTemplateTypeAC'
import { SearchLayoutTemplateTypeByValueAC } from './SearchLayoutTemplateTypeByValueAC'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase 3: 高度な検索・取得（8個）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { SearchNodeAC } from './SearchNodeAC'
import { SearchNodeFetchAC } from './SearchNodeFetchAC'
import { SearchTableAC } from './SearchTableAC'
import { SearchTableFetchAC } from './SearchTableFetchAC'
import { SearchLineFetchAC } from './SearchLineFetchAC'
import { RetrieveTableAC } from './RetrieveTableAC'
import { RetrieveBlockAC } from './RetrieveBlockAC'
import { GetPageIdAC } from './GetPageIdAC'
import { GetTableUlidByJsonAC } from './GetTableUlidByJsonAC'
import { GetNodePropertyAC } from './GetNodePropertyAC'
import { GetNodeLabelsAC } from './GetNodeLabelsAC'
import { PushRecordsAC } from './PushRecordsAC'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase 4: CRUD操作（4個）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { CreateNodeAC } from './CreateNodeAC'
import { CreateInstanceAC } from './CreateInstanceAC'
import { CreateEdgeAC } from './CreateEdgeAC'
import { UpdateNodeAC } from './UpdateNodeAC'
import { UpdateCellAC } from './UpdateCellAC'
import { BuildUpdateCellJsonAC } from './BuildUpdateCellJsonAC'


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase 5: UI制御・Container管理（10個）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { OpenContainerAC } from './OpenContainerAC'
import { CloseContainerAC } from './CloseContainerAC'
import { ApplyLayoutJsonAC } from './ApplyLayoutJsonAC'
import { ApplyDataJsonAC } from './ApplyDataJsonAC'
import { RunJointAC } from './RunJointAC'
// FetchAC は未使用のため削除済み
import { DisplayTableAC } from './DisplayTableAC'
import { GenerateModalLayoutAC } from './GenerateModalLayoutAC'
import { RegisterModalLayoutAC } from './RegisterModalLayoutAC'
import { RegisterModalDataAC } from './RegisterModalDataAC'
import { GetLayoutSnackingConfigAC } from './GetLayoutSnackingConfigAC'
import { GetLayoutKeyMapConfigAC } from './GetLayoutKeyMapConfigAC'
import { GetLayoutButtonConfigAC } from './GetLayoutButtonConfigAC'
import { BuildMergedLayoutAC } from './BuildMergedLayoutAC'
import { BuildCustomMergedLayoutAC } from './BuildCustomMergedLayoutAC'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Phase 6: VNode生成・構造化（4個）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { MakeBlockAC } from './MakeBlockAC'
import { OutputVNodeAC } from './OutputVNodeAC'
import { StructRowsAC } from './StructRowsAC'
import { ConvertStructToDataTableNameAC } from './ConvertStructToDataTableNameAC'
import { ConvertDeployToStructTableNameAC } from './ConvertDeployToStructTableNameAC'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Common Workflows（Activity として登録）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { GetCellWF } from '~/workflowDefs/common/workflows/GetCellWF'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 既存Activity（改名）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { AddFormDataStoreByOutputJsonAC } from './AddFormDataStoreByOutputJsonAC'
import { ParseInputsActivity } from './ParseInputsActivity'
import { GenerateRequestActivity } from './GenerateRequestActivity'
import { RequestEventActivity } from './RequestEventActivity'
import { ProcessJointInputActivity } from './ProcessJointInputActivity'
import { FetchCncfActivity } from './FetchCncfActivity'
import { MergeInputActivity } from './MergeInputActivity'
import { SaveToAnswerStoreActivity } from './SaveToAnswerStoreActivity'
import { SetAnswerDataAC } from './SetAnswerDataAC'


/**
 * すべての共通Activityを取得
 */
export function getCommonActivities(): ActivityMap {
  console.log('[Common Activities] Loading all activities...')

  const activities = {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Phase 1: 基盤ユーティリティ（12個）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ParseToArrayAC,
    ParseCellRefAC,
    BuildCellRefAC,
    ParseTableNameAC,
    MakeJointIdAC,
    CreateEventIdAC,
    CreateUlidAC,
    FirstRowAC,
    // HasButtonAC,
    RestoreCellRefAC,
    RegisterStructAC,
    RegisterDataAC,
    BuildTemporaryTableIdAC,
    ReplaceLayoutKeyAC,
    ParseLayoutBlockKeyAC,
    GetLayoutParentKeyAC,
    PaddingLayoutBlockAC,
    ConvertLayoutRowsToMapAC,
    PatchLayoutMapAC,
    ConvertScheduleToCalendarEventAC,
    BuildLayoutCalendarJsonAC,
    OpenViewContextAC,
    UpdateViewContextModeAC,

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Phase 2: データ展開・基本検索（7個）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    MergeTableAC,
    MergeRowsAC,
    MergeTableOldAC,
    SearchLineAC,
    RetrieveColumnAC,
    RetrieveCellrefAC,
    RegisterTemporaryAC,
    SetParamAC,
    GetParamAC,
    ConcatStringAC,
    SeparateStringAC,
    CreateLayoutBlockKeyAC,
    CreateLayoutBlockPropertyAC,
    BuildLayoutBlockRowAC,
    SearchLayoutJsonAC,
    SearchLayoutTemplateTypeAC,
    SearchLayoutTemplateTypeByValueAC,

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Phase 3: 高度な検索・取得（8個）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    SearchNodeAC,
    SearchNodeFetchAC,
    SearchTableAC,
    SearchTableFetchAC,
    SearchLineFetchAC,
    RetrieveTableAC,
    RetrieveBlockAC,
    GetPageIdAC,
    GetTableUlidByJsonAC,
    PushRecordsAC,
    GetNodePropertyAC,
    GetNodeLabelsAC,

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Phase 4: CRUD操作（4個）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    CreateNodeAC,
    CreateInstanceAC,
    CreateEdgeAC,
    UpdateNodeAC,
    UpdateCellAC,
    BuildUpdateCellJsonAC,


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Phase 5: UI制御・Container管理（9個）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    OpenContainerAC,
    ApplyLayoutJsonAC,
    ApplyDataJsonAC,
    CloseContainerAC,
    RunJointAC,
    // FetchAC,
    DisplayTableAC,
    GenerateModalLayoutAC,
    RegisterModalLayoutAC,
    RegisterModalDataAC,
    GetLayoutSnackingConfigAC,
    GetLayoutKeyMapConfigAC,
    GetLayoutButtonConfigAC,
    BuildMergedLayoutAC,

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Phase 6: VNode生成・構造化（4個）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    MakeBlockAC,
    OutputVNodeAC,
    StructRowsAC,
    ConvertStructToDataTableNameAC,
    ConvertDeployToStructTableNameAC,

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Common Workflows（Activity として登録）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    GetCellWF,

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 既存Activity（改名）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    AddFormDataStoreByOutputJsonAC,
    'custom:ParseInputsActivity': ParseInputsActivity,
    'custom:GenerateRequestActivity': GenerateRequestActivity,
    'custom:RequestEventActivity': RequestEventActivity,
    'custom:ProcessJointInputActivity': ProcessJointInputActivity,
    'custom:FetchCncfActivity': FetchCncfActivity,
    'custom:MergeInputActivity': MergeInputActivity,
    'custom:SaveToAnswerStoreActivity': SaveToAnswerStoreActivity,
    'custom:SetAnswerDataAC': SetAnswerDataAC,
  }

  console.log(`[Common Activities] Loaded ${Object.keys(activities).length} activities`)
  return activities
}

// 個別エクスポート
export {
  // Phase 1: 基盤ユーティリティ
  ParseToArrayAC,
  ParseCellRefAC,
  BuildCellRefAC,
  ParseTableNameAC,
  MakeJointIdAC,
  CreateEventIdAC,
  CreateUlidAC,
  FirstRowAC,
  RestoreCellRefAC,
  RegisterStructAC,
  RegisterDataAC,
  BuildTemporaryTableIdAC,
  ReplaceLayoutKeyAC,
  ParseLayoutBlockKeyAC,
  GetLayoutParentKeyAC,
  PaddingLayoutBlockAC,
  ConvertLayoutRowsToMapAC,
  PatchLayoutMapAC,
  ConvertScheduleToCalendarEventAC,
  BuildLayoutCalendarJsonAC,
  OpenViewContextAC,
  UpdateViewContextModeAC,

  // Phase 2: データ展開・基本検索
  MergeTableAC,
  MergeRowsAC,
  MergeTableOldAC,
  SearchLineAC,
  RetrieveBlockAC,
  RetrieveColumnAC,
  RetrieveCellrefAC,
  RegisterTemporaryAC,
  SetParamAC,
  GetParamAC,
  ConcatStringAC,
  SeparateStringAC,
  CreateLayoutBlockKeyAC,
  CreateLayoutBlockPropertyAC,
  BuildLayoutBlockRowAC,
  SearchLayoutJsonAC,
  SearchLayoutTemplateTypeAC,
  SearchLayoutTemplateTypeByValueAC,

  // Phase 3: 高度な検索・取得
  SearchNodeAC,
  SearchNodeFetchAC,
  SearchTableAC,
  SearchTableFetchAC,
  SearchLineFetchAC,
  RetrieveTableAC,
  GetPageIdAC,
  GetTableUlidByJsonAC,
  GetNodePropertyAC,
  PushRecordsAC,
  GetNodeLabelsAC,

  // Phase 4: CRUD操作
  CreateNodeAC,
  CreateInstanceAC,
  CreateEdgeAC,
  UpdateNodeAC,
  UpdateCellAC,
  BuildUpdateCellJsonAC,


  // Phase 5: UI制御・Container管理
  OpenContainerAC,
  CloseContainerAC,
  ApplyLayoutJsonAC,
  ApplyDataJsonAC,
  RunJointAC,
  // FetchAC,
  DisplayTableAC,
  GenerateModalLayoutAC,
  RegisterModalLayoutAC,
  RegisterModalDataAC,
  GetLayoutSnackingConfigAC,
  GetLayoutKeyMapConfigAC,
  GetLayoutButtonConfigAC,
  BuildMergedLayoutAC,
  BuildCustomMergedLayoutAC,

  // Phase 6: VNode生成・構造化
  MakeBlockAC,
  OutputVNodeAC,
  StructRowsAC,
  ConvertStructToDataTableNameAC,
  ConvertDeployToStructTableNameAC,

  // Common Workflows
  GetCellWF,

  // 既存
  AddFormDataStoreByOutputJsonAC,
  ParseInputsActivity,
  GenerateRequestActivity,
  RequestEventActivity,
  ProcessJointInputActivity,
  FetchCncfActivity,
  MergeInputActivity,
  SaveToAnswerStoreActivity,
  SetAnswerDataAC,

}

/**
 * Activity一覧を取得（デバッグ用）
 */
export function listCommonActivities(): string[] {
  const activities = getCommonActivities()
  return Object.keys(activities).sort()
}

/**
 * Activity数を取得（デバッグ用）
 */
export function getCommonActivityCount(): number {
  const activities = getCommonActivities()
  return Object.keys(activities).length
}
