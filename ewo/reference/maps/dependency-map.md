# EWO Tool Dependency Map

type: reference  
status: unofficial  
confidence: medium  
source: manual analysis  

## Overview

この資料はEWO関連ツールの依存関係を整理した参考資料です。

この資料は仕様ではありません。

- 不完全な可能性があります
- 古い可能性があります
- 実装と一致しない可能性があります

AIは以下の目的で参照できます

・ツール構造の理解  
・依存関係の確認  
・調査の補助  

referenceの内容と実装が矛盾する場合  
referenceを正とせず **ALERTを出してください**


Nuxt ページ依存ファイルマップ

各ツール（ページ）が参照しているファイルの一覧。
パスはすべて nuxt/ ディレクトリからの相対パス。

1. EWO オーサリングツール
ページ: pages/ewo-authoring/index.vue

直接参照
カテゴリ	ファイルパス
コンポーネント	components/ewo-authoring/EwoAcNode.vue
components/ewo-authoring/EwoWfCallNode.vue
components/ewo-authoring/EwoLiteralNode.vue
components/ewo-authoring/EwoStartNode.vue
components/ewo-authoring/EwoEndNode.vue
components/ewo-authoring/EwoForEachRegionNode.vue
components/ewo-authoring/EwoDataEdge.vue
components/workflow-authoring/CreateActivityModal.vue
ユーティリティ	utils/ewo/exporter.ts
utils/ewo/importer.ts
utils/ewo/validator.ts
utils/ewo/types.ts
API	/api/workflow-defs/scan

間接参照 (exporter.ts 経由)
ファイルパス
utils/ewo/extractWfDef.ts
utils/ewo/extractWiring.ts
utils/ewo/extractLayout.ts
コンポーネント群 (7個) はすべて外部パッケージ (vue, @vue-flow/core) のみに依存し、ローカルファイルへの追加参照なし。

2. EWO ランナー
ページ: pages/ewo-runner.vue

直接参照
カテゴリ	ファイルパス
型定義	utils/ewo/types.ts
ストア	stores/ewoEngine.ts
stores/rdb.ts
エンジン	utils/ewo/engine/registry.ts
API	/api/workflow-defs/ewo-workflows

間接参照 (stores/ewoEngine.ts 経由)
ファイルパス
utils/ewo/engine/launcher.ts

間接参照 (launcher.ts 経由 — エンジン本体)
ファイルパス
utils/ewo/engine/cloudEvent.ts
utils/ewo/engine/eventBus.ts
utils/ewo/engine/payloadStore.ts
utils/ewo/engine/coordinator.ts
utils/ewo/engine/mediator.ts
utils/ewo/engine/acWorker.ts
utils/ewo/engine/inlineExpander.ts
utils/ewo/engine/guardEval.ts
utils/ewo/extractWiring.ts

間接参照 (stores/rdb.ts 経由)
ファイルパス
utils/TtlTableCore.ts

間接参照 (acWorker.ts 経由 — アクティビティ定義群)
ファイルパス
workflowDefs/common/activities/index.ts (70+ AC ファイル群)
workflowDefs/demo/activities/ (30+ デモ AC ファイル群)
workflowDefs/common/workflows/ (30+ WF ファイル群)
3. XLSX データインポーター
ページ: pages/sheet-import.vue

直接参照
カテゴリ	ファイルパス
コンポーネント	components/SheetImporter.vue

間接参照 (SheetImporter.vue 経由)
ファイルパス
composables/useSheetImport.ts
stores/rdb.ts

間接参照 (useSheetImport.ts 経由)
ファイルパス
utils/xlsx-to-deploy-json.ts (型のみ)

間接参照 (stores/rdb.ts 経由)
ファイルパス
utils/TtlTableCore.ts
4. レイアウトビューア
ページ: pages/layout-viewer.vue

直接参照
カテゴリ	ファイルパス
アクティビティ	workflowDefs/common/activities/index.ts (BuildMergedLayoutAC)
コンポーネント	components/blocks/LayoutRenderer.vue
composable	composables/useEventBus.ts

間接参照 (LayoutRenderer.vue 経由 — ブロックコンポーネント群)
ファイルパス
components/blocks/CardBlock.vue
components/blocks/HeaderBlock.vue
components/blocks/AvatarBlock.vue
components/blocks/ActionButtonBlock.vue
components/blocks/ActionTabBlock.vue
components/blocks/TextLabelBlock.vue
components/blocks/TextValueBlock.vue
components/blocks/FieldLabelBlock.vue
components/blocks/InputFieldBlock.vue
components/blocks/CheckboxBlock.vue
components/blocks/InputSelectBlock.vue
components/blocks/InputTextBlock.vue
components/blocks/InputTextareaBlock.vue
components/blocks/InputCheckboxBlock.vue
components/blocks/InputRadioBlock.vue
components/blocks/InputFileBlock.vue
components/blocks/InputNumberBlock.vue
components/blocks/InputBooleanBlock.vue
components/blocks/CalendarBlock.vue
components/blocks/calendar/ContainerBlock.vue
components/blocks/calendar/HeaderBlock.vue
components/blocks/calendar/GridContainerBlock.vue
components/blocks/calendar/TimeAxisBlock.vue
components/blocks/calendar/DayColumnBlock.vue
components/blocks/calendar/EventBlock.vue
components/blocks/calendar/FooterBlock.vue
components/blocks/calendar/TimeLabelBlock.vue

間接参照 (workflowDefs/common/activities/index.ts 経由)
カテゴリ	ファイルパス
型定義	types/activity.ts
定数	constants/NCat.ts, constants/Column.ts, constants/Key.ts, constants/LayoutVueType.ts, constants/UCat.ts
ストア	stores/tableStruct.ts, stores/tableData.ts, stores/rdb.ts
AC/WF	70+ AC ファイル群 + 30+ WF ファイル群
共有ファイル
複数ツール間で共有されている主要ファイル:

ファイル	使用ツール
stores/rdb.ts	EWO ランナー, XLSX インポーター, レイアウトビューア
utils/ewo/types.ts	EWO オーサリング, EWO ランナー
utils/TtlTableCore.ts	EWO ランナー, XLSX インポーター (rdb 経由)
workflowDefs/common/activities/index.ts	EWO ランナー, レイアウトビューア
composables/useEventBus.ts	レイアウトビューア (直接 + ブロック経由)
utils/ewo/extractWiring.ts	EWO オーサリング (exporter 経由), EWO ランナー (inlineExpander 経由)
