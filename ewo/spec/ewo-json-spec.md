# EWO JSON (.ewo.json) 仕様書 ver.1.0

作成日: 2026-03-06
ソース: `nuxt/utils/ewo/types.ts`, `extractWfDef.ts`, `extractWiring.ts`, `extractLayout.ts`, `validator.ts`, `importer.ts`, `exporter.ts`
エンジン: `nuxt/utils/ewo/engine/` (coordinator, mediator, acWorker, launcher, inlineExpander, guardEval, payloadStore, eventBus, cloudEvent, registry)
PHP実装: `laravel/app/Ewo/` (Engine/, Dto/, Adapter/, Bus/, Event/)
デモ参照: `nuxt/workflowDefs/demo/workflows/*.ewo.json` (11パターン)

---

## 1. 概要

`.ewo.json` は EWO ワークフローエンジンの実行定義とオーサリングツールのレイアウト情報を一体化した JSON フォーマット。
以下の 3 つの関心を 1 ファイルに集約する。

| セクション | 役割 | 必須 |
|---|---|---|
| `wfDef` | 実行グラフ定義（ノード、依存、出力） | ✅ |
| `wiring` | イベントルーティング定義 | ✅ |
| `layout` | オーサリングツール用の視覚レイアウト | ⚠️ 省略時は auto-layout |

---

## 2. トップレベル構造

```typescript
interface EwoJson {
  id: string                              // ワークフロー一意ID (例: "MakeTemporaryWF")
  version: string                         // セマンティックバージョン (例: "1.0.0")
  name: string                            // 表示名
  description?: string                    // 説明文
  inputs: Record<string, { schema: string }>  // WF入力ポート定義
  wfDef: {                                // 実行グラフ
    nodes: WfNode[]
    forEachZones?: ForEachZone[]
    outputs: Record<string, string>       // WF出力マッピング
  }
  wiring: Wiring                          // イベントルーティング
  layout: EwoLayout                       // 視覚レイアウト
}
```

### 2-1. `inputs`

```json
{
  "inputs": {
    "tableId": { "schema": "string" },
    "rows": { "schema": "any[]" },
    "depth": { "schema": "number" },
    "config": { "schema": "object" }
  }
}
```

`schema` に使える型: `"string"`, `"number"`, `"boolean"`, `"any"`, `"any[]"`, `"object"`, `"object[]"`, `"string[]"`, など。

---

## 3. wfDef — 実行グラフ定義

### 3-1. WfNode

```typescript
interface WfNode {
  id: string             // ノードインスタンスID（一意、"/"禁止）
  operation: string      // 呼び出す AC/WF の名前 (例: "SearchLineAC", "DeployBlockWF")
  deps: Record<string, WfDepType>     // 入力ポートの依存定義
  outputs: Record<string, {}>         // 出力ポート宣言（値は空オブジェクト）
  guard?: string                      // 条件式（後述）
  wfCall?: WfCallDef                  // サブワークフロー呼び出し定義
}
```

**重要: `id` と `operation` の違い**

| フィールド | 意味 | 例 |
|---|---|---|
| `id` | ノードのインスタンス名。WF内で一意。 | `"CreateUlid"`, `"SearchButtonAnchor"` |
| `operation` | 呼び出すAC/WFの実体名。ACサフィックスを含む。 | `"CreateUlidAC"`, `"SearchLineAC"` |

同じ AC を複数回使う場合、`id` で区別する:
```json
{ "id": "SearchLabelLine",  "operation": "SearchLineAC", ... },
{ "id": "SearchJointLine",  "operation": "SearchLineAC", ... }
```

オーサリングツールのサイドバーからドラッグすると `label` = `operation` = AC名 となるが、
手動や JSON 生成時は `id`（= layout上の `label`）を短い人間可読名にし、
`operation` に正式な AC 名を指定するのが慣例。

### 3-2. WfDepType — 依存の種類

```typescript
// 他のノードの出力ポートからの依存
interface WfDep {
  sourceAcId: string    // ソースノードID or 特殊値
  sourcePort: string    // ソースの出力ポート名
}

// リテラル値
interface WfDepLiteral {
  literal: any          // 固定値 (string, number, boolean, null, [], {}, etc.)
}

// 複数ソースからの選択（分岐マージ）
interface WfDepOneOf {
  oneOf: WfDep[]
}

type WfDepType = WfDep | WfDepLiteral | WfDepOneOf
```

#### 特殊な `sourceAcId` 値

| sourceAcId | 意味 | 例 |
|---|---|---|
| `$input` | WFの入力ポート | `{ "sourceAcId": "$input", "sourcePort": "tableId" }` |
| `$zoneInput` | ForEachゾーンのイテレーションアイテム | `{ "sourceAcId": "$zoneInput", "sourcePort": "item" }` |
| `$zone:ZoneId` | ForEachゾーンの収集結果 | `{ "sourceAcId": "$zone:EnrichItems", "sourcePort": "enrichedItems" }` |

#### `deps` の例

```json
{
  "deps": {
    "tableId": { "sourceAcId": "$input", "sourcePort": "tableId" },
    "ulid": { "sourceAcId": "CreateUlid", "sourcePort": "ulid" },
    "beforeRows": { "literal": [] },
    "name": { "literal": "data_property" },
    "enabled": { "literal": true },
    "config": { "literal": { "key": "value" } },
    "result": {
      "oneOf": [
        { "sourceAcId": "BranchA", "sourcePort": "value" },
        { "sourceAcId": "BranchB", "sourcePort": "value" }
      ]
    }
  }
}
```

### 3-3. `outputs` — WF出力マッピング

WF全体の出力を `"出力ポート名": "ノードID.ポート名"` で定義。

```json
{
  "outputs": {
    "tempTableId": "BuildTempTableId.tempTableId",
    "nodeLabels": "GetNodeLabels.labels"
  }
}
```

出力がないWFは空オブジェクト:
```json
{ "outputs": {} }
```

### 3-4. `guard` — 条件式

ノードの実行条件を jq ライクな式で記述。`false` と評価されたノードはスキップされる。

```typescript
// guardEval.ts がサポートする構文:
// - プロパティアクセス: .prop, .nested.prop, .array[0]
// - 比較: ==, !=, >, <, >=, <=
// - 論理: and, or, not
// - リテラル: null, true, false, 数値, "文字列"
```

#### guard 式のデータコンテキスト

guard は**ノードの deps が解決された状態のデータ**に対して評価される。
式のプロパティ参照には **2 つのスタイル** がある:

| スタイル | 書式 | データソース | 例 |
|---|---|---|---|
| **jq スタイル** | `.depName` | ノードの deps キー名で直接参照 | `".orderType == \"standard\""` |
| **パスストア形式** | `SourceNodeId.portName` | ペイロードストア経由 | `"FirstUCat.row != 'option'"` |

**jq スタイル** (`.` 始まり) はデモで使われる形式。deps に定義された入力名をそのまま参照する:

```json
// deps に "orderType" キーがあるノードの guard
{ "guard": ".orderType == \"standard\"" }
{ "guard": ".orderType == \"express\"" }
{ "guard": ".hasTicket == false" }
```

**パスストア形式** は本番 WF で使われる形式。ソースノード名 + ポート名で参照する:

```json
{ "guard": "FirstUCat.row != 'option'" }
{ "guard": "$input.snackingConfig == null" }
{ "guard": "$input.configId == \"schedule\"" }
{ "guard": "SearchNodes.nodeIds.length > 0" }
{ "guard": "ResolveKeyMap.replaceKey != null" }
```

> **guardEval.ts** は両形式を解釈可能。新規作成時はどちらでもよいが、
> プロジェクト内で統一を推奨。

### 3-5. `wfCall` — サブワークフロー呼び出し

```typescript
interface WfCallDef {
  callee: string            // 呼び出すWF名 (例: "MakeTemporaryWF")
  calleeVersion?: string    // バージョン指定
  boundary: boolean         // true=外部実行, false=インライン展開
  recursive?: boolean       // 自己再帰（boundary=true のみ）
  policy?: {
    timeoutSec?: number
    maxRecursionDepth?: number
    retry?: { max: number; backoffSec: number }
  }
}
```

```json
{
  "id": "DeployStruct",
  "operation": "DeployBlockTemporaryWF",
  "deps": { ... },
  "outputs": { "tempTableId": {} },
  "wfCall": {
    "callee": "DeployBlockTemporaryWF",
    "boundary": true
  }
}
```

**boundary の意味:**
- `true`: 別のWFインスタンスとして外部実行。policy 設定推奨。
- `false`: 現在のWF内にインライン展開。ノードIDは `parentId/childId` 形式になる。

#### 再帰 wfCall パターン

自身のWFを呼ぶ再帰パターンでは `recursive: true` と `policy.maxRecursionDepth` を設定:

```json
{
  "id": "RecursiveWalk",
  "operation": "DemoRecursive_TreeWalk",
  "deps": {
    "nodeId": { "sourceAcId": "$zoneInput", "sourcePort": "childItem" }
  },
  "outputs": { "tree": {} },
  "wfCall": {
    "callee": "DemoRecursive_TreeWalk",
    "boundary": true,
    "recursive": true,
    "policy": { "maxRecursionDepth": 10 }
  }
}
```

> `recursive: true` は `boundary: true` の場合のみ有効。
> `maxRecursionDepth` を指定しないと無限再帰のリスクがある。

#### インライン wfCall パターン (boundary=false)

`boundary: false` は子WFのノードを親WF内に展開する:

```json
{
  "id": "CallPurchase",
  "operation": "DemoWF-PurchaseTicket",
  "deps": { ... },
  "outputs": { "ticketId": {}, "receipt": {} },
  "guard": ".hasTicket == false",
  "wfCall": {
    "callee": "DemoWF-PurchaseTicket",
    "boundary": false
  }
}
```

> インライン展開では子WFの全ノードが親の実行グラフに組み込まれるため、
> 子WF側の wiring は使われず、親の wiring がルーティングを担う。

### 3-6. ForEachZone — ループ定義

```typescript
interface ForEachZone {
  id: string                           // ゾーンID
  collectionSource: {
    sourceAcId: string                 // コレクション元ノード or "$input"
    sourcePort: string                 // コレクションの出力ポート
  }
  iterationParam: string              // イテレーション変数名 (例: "item")
  nodes: string[]                     // ゾーン内のノードID一覧
  childZones?: ForEachZone[]          // ネストされた子ゾーン
  outputNodeId: string                // イテレーション末尾ノードID
  outputPort: string                  // 収集する出力ポート
  outputCollection: string            // 収集結果のコレクション名
  mode?: 'sequential' | 'parallel'    // 実行モード (デフォルト: parallel)
}
```

#### ForEachZone の例

```json
{
  "forEachZones": [
    {
      "id": "nodeZone",
      "collectionSource": { "sourceAcId": "$input", "sourcePort": "nodeIds" },
      "iterationParam": "nodeItem",
      "nodes": ["SearchNode", "BuildStruct"],
      "childZones": [
        {
          "id": "configZone",
          "collectionSource": { "sourceAcId": "ResolveConfig", "sourcePort": "value" },
          "iterationParam": "configItem",
          "nodes": ["ProcessConfig", "ReplaceKey"],
          "outputNodeId": "ReplaceKey",
          "outputPort": "layoutRows",
          "outputCollection": "allConfigResults"
        }
      ],
      "outputNodeId": "configZone",
      "outputPort": "allConfigResults",
      "outputCollection": "allNodeResults"
    }
  ]
}
```

#### ForEachZone の mode

| mode | 動作 | デフォルト |
|---|---|---|
| `"parallel"` | 全イテレーションを同時実行 | ✅ |
| `"sequential"` | イテレーションを順次実行（前の完了を待つ） | |

```json
{
  "id": "detailZone",
  "collectionSource": { "sourceAcId": "Search", "sourcePort": "ids" },
  "iterationParam": "item",
  "nodes": ["FetchDetail", "EnrichItem"],
  "outputNodeId": "EnrichItem",
  "outputPort": "enrichedItem",
  "outputCollection": "enrichedItems",
  "mode": "parallel"
}
```

> `mode` 省略時は `"parallel"` として動作。
> 順序保証が必要な場合（例: 依存関係のあるAPI呼び出し）は `"sequential"` を指定。

#### 特殊な $zoneInput / $zone 参照

ゾーン内ノードが `$zoneInput` を参照する場合の dep:
```json
{ "sourceAcId": "$zoneInput", "sourcePort": "nodeItem" }
```

ゾーンの収集結果を下流で使う場合の dep:
```json
{ "sourceAcId": "$zone:nodeZone", "sourcePort": "allNodeResults" }
```

---

## 4. wiring — イベントルーティング定義

### 4-1. 構造

```typescript
interface Wiring {
  version: 1               // 固定値
  routes: WiringRoute[]
}

interface WiringRoute {
  id: string                           // ルートID (例: "R-CreateUlid")
  when: { type: string }              // トリガーイベント (例: "CreateUlid.done")
  correlate: { by: ["correlationid"] } // 相関キー (固定)
  emit: WiringEmit[]                   // 発行するイベント
}

interface WiringEmit {
  type: string    // ターゲットイベント (例: "BuildTempTableId.ulid")
  wfid: string    // ワークフローID
  map: string     // 固定値 "outputRef->payloadRef"
}
```

### 4-2. wiring 生成ルール

`extractWiring.ts` の自動生成ロジックに基づく。

#### ルール 1: 各ノードに1つのルート

```
ノードID: {acId}
ルートID: R-{acId}
when:     { "type": "{acId}.done" }
```

#### ルール 2: 依存先への emit

あるノード A の出力が、ノード B の deps で参照されている場合:
```
A.done → emit { "type": "B.{depName}", "wfid": "{wfId}", "map": "outputRef->payloadRef" }
```

**例:** CreateUlid の ulid が BuildTempTableId の ulid dep で参照されている場合:
```json
{
  "id": "R-CreateUlid",
  "when": { "type": "CreateUlid.done" },
  "correlate": { "by": ["correlationid"] },
  "emit": [
    { "type": "BuildTempTableId.ulid", "wfid": "MakeTemporaryWF", "map": "outputRef->payloadRef" }
  ]
}
```

#### ルール 3: `$input` からの依存は wiring に含めない

`sourceAcId === "$input"` の deps は WF 開始時に Coordinator が直接注入するため、
wiring のルートを生成しない。

#### ルール 4: 終端ノードは `wf.completed` を emit

WF出力を提供するノード（`outputs` で参照されるノード）、
または下流ノードから参照されていないノードが終端:

```json
{
  "id": "R-PushRecords",
  "when": { "type": "PushRecords.done" },
  "correlate": { "by": ["correlationid"] },
  "emit": [
    { "type": "wf.completed", "wfid": "MakeTemporaryWF", "map": "outputRef->payloadRef" }
  ]
}
```

#### ルール 5: ファンアウト時は `.result` emit を先頭に追加

1つのノードの出力が2つ以上のターゲットに emit される場合、
`extractWiring.ts` は先頭に `{sourceAcId}.result` を自動挿入する。
これは Mediator がフルペイロードを保持するための最適化 emit。

```json
{
  "id": "R-BuildTempTableId",
  "when": { "type": "BuildTempTableId.done" },
  "emit": [
    { "type": "BuildTempTableId.result", "wfid": "GetNodeTableWF", "map": "outputRef->payloadRef" },
    { "type": "PushRecords.tableId", "wfid": "GetNodeTableWF", "map": "outputRef->payloadRef" },
    { "type": "SearchTableIdLine.tableId", "wfid": "GetNodeTableWF", "map": "outputRef->payloadRef" },
    { "type": "SearchFirstBlockIdLine.tableId", "wfid": "GetNodeTableWF", "map": "outputRef->payloadRef" }
  ]
}
```

> **注意:** 手動作成のデモ（DemoSwitchMerge_OrderProcess）では `.fanout` という名前が
> 使われている例がある。エンジンは emit type のサフィックスを区別しないため、
> `.result` でも `.fanout` でも動作する。自動生成時は `.result` で統一。

#### ルール 6: 下流が存在しないノード

下流 emit がなく、終端でもないノードは emit が空配列:
```json
{
  "id": "R-PushDataTable",
  "when": { "type": "PushDataTable.done" },
  "correlate": { "by": ["correlationid"] },
  "emit": []
}
```

### 4-3. ForEachZone の wiring ルール

| ルート種別 | when | emit | 説明 |
|---|---|---|---|
| ゾーン入力 | `{sourceAcId}.done` | `$zone:{zoneId}.input` | ゾーン開始トリガー |
| ゾーン内 | `{zoneNodeId}.done` | 次のゾーン内ノードの dep | ゾーン内部のルーティング |
| ゾーン完了 | `$zone:{zoneId}.done` | 下流ノードの dep | ゾーン収集結果の配送 |

```json
{ "id": "R-Search", "when": { "type": "Search.done" }, "emit": [
    { "type": "$zone:EnrichItems.input", "wfid": "...", "map": "outputRef->payloadRef" }
] },
{ "id": "R-FetchDetail", "when": { "type": "FetchDetail.done" }, "emit": [
    { "type": "EnrichItem.detail", "wfid": "...", "map": "outputRef->payloadRef" }
] },
{ "id": "R-$zone:EnrichItems", "when": { "type": "$zone:EnrichItems.done" }, "emit": [
    { "type": "Assemble.items", "wfid": "...", "map": "outputRef->payloadRef" }
] }
```

---

## 5. layout — 視覚レイアウト

### 5-1. 構造

```typescript
interface EwoLayout {
  viewport: { x: number; y: number; zoom: number }
  nodes: EwoLayoutNode[]
  edges: EwoLayoutEdge[]    // ⚠️ "edges" (複数形) — "edge" ではない
}
```

### 5-2. ノードタイプ

| type | 用途 | 数 |
|---|---|---|
| `ewoStart` | WF開始ノード | 1（必須） |
| `ewoEnd` | WF終了ノード | 1（必須） |
| `ewoAc` | アクティビティノード | 0〜N |
| `ewoWfCall` | サブWF呼び出しノード | 0〜N |
| `ewoLiteral` | リテラル値ノード | 0〜N |
| `ewoForEachRegion` | ForEachゾーンリージョン | 0〜N |

### 5-3. EwoLayoutNode

```typescript
interface EwoLayoutNode {
  id: string                           // "node-{wfDefNodeId}" or "node-start", "node-end"
  type: string                         // ノードタイプ
  position: { x: number; y: number }   // 座標
  style?: Record<string, string>       // リージョンのサイズ指定等
  parentNode?: string                  // 親リージョンID (ゾーン内ノード用)
  extent?: 'parent'                    // 親リージョン内に制約
  data?: Record<string, any>           // ノード固有データ
}
```

#### node-start の data

```json
{
  "id": "node-start",
  "type": "ewoStart",
  "position": { "x": 50, "y": 150 },
  "data": {
    "inputs": [
      { "name": "tableId", "type": "string" },
      { "name": "rows", "type": "any[]" }
    ]
  }
}
```

#### node-end の data

```json
{
  "id": "node-end",
  "type": "ewoEnd",
  "position": { "x": 1050, "y": 150 },
  "data": {
    "outputs": [
      { "name": "tempTableId", "type": "string" }
    ]
  }
}
```

#### ewoAc ノードの data

```json
{
  "id": "node-CreateUlid",
  "type": "ewoAc",
  "position": { "x": 300, "y": 100 },
  "data": {
    "label": "CreateUlid",              // 画面表示名（インスタンス名）
    "operation": "CreateUlidAC",         // 呼び出すAC名
    "functionRef": "CreateUlidAC",       // (任意) ドラッグ元AC参照。通常 operation と同値
    "nodeType": "activity",              // (任意) "activity" or "wfCall"。オーサリングUI用
    "inputs": [                          // 入力ポート定義
      { "name": "tableId", "type": "string" }
    ],
    "outputs": [                         // 出力ポート定義
      { "name": "ulid", "type": "string" }
    ]
  }
}
```

> **`functionRef` / `nodeType`** はオーサリングツールが保持するメタ情報。
> エンジン実行には使われないが、オーサリングツールからの export 時に含まれる。
> 手動作成時は省略可能。
```

#### ewoWfCall ノードの data

```json
{
  "id": "node-DeployStruct",
  "type": "ewoWfCall",
  "position": { "x": 300, "y": 100 },
  "data": {
    "label": "DeployStruct",
    "operation": "DeployBlockTemporaryWF",
    "functionRef": "DeployBlockTemporaryWF",
    "nodeType": "wfCall",
    "inputs": [...],
    "outputs": [{ "name": "tempTableId", "type": "string" }],
    "wfCall": { "callee": "DeployBlockTemporaryWF", "boundary": true }
  }
}
```

再帰 wfCall の場合は `wfCall` に `recursive` と `policy` も含める:

```json
{
  "id": "node-RecursiveWalk",
  "type": "ewoWfCall",
  "position": { "x": 50, "y": 80 },
  "parentNode": "region-childZone",
  "extent": "parent",
  "data": {
    "label": "RecursiveWalk",
    "operation": "DemoRecursive_TreeWalk",
    "inputs": [{ "name": "nodeId", "type": "string" }],
    "outputs": [{ "name": "tree", "type": "object" }],
    "wfCall": {
      "callee": "DemoRecursive_TreeWalk",
      "boundary": true,
      "recursive": true,
      "policy": { "maxRecursionDepth": 10 }
    }
  }
}
```

#### ewoLiteral ノードの data

`wfDef.nodes[].deps` で `literal` を使用した固定値に対応する視覚ノード:

```json
{
  "id": "node-literal-taxRate",
  "type": "ewoLiteral",
  "position": { "x": 280, "y": 30 },
  "data": {
    "label": "taxRate",
    "value": 0.1,
    "valueType": "number"
  }
}
```

| data フィールド | 説明 |
|---|---|
| `label` | 表示名（deps のキー名と合わせる） |
| `value` | リテラル値（string, number, boolean, null, object, array） |
| `valueType` | `"string"`, `"number"`, `"boolean"`, `"object"`, `"array"` |

> ewoLiteral ノードの出力ハンドルは `"output-value"` 固定。
> ターゲットのハンドルは `"input-{depキー名}"` (例: `"input-taxRate"`)。

#### ewoForEachRegion ノードの data

```json
{
  "id": "region-nodeZone",
  "type": "ewoForEachRegion",
  "position": { "x": 840, "y": 350 },
  "style": { "width": "1600px", "height": "500px" },
  "data": {
    "label": "NodeZone (nodeIds iterate)",
    "zoneId": "nodeZone",
    "iterationParam": "nodeItem",
    "outputCollection": "allNodeResults"
  }
}
```

ゾーン内のノードは `parentNode` と `extent` を設定:
```json
{
  "id": "node-SearchNode",
  "type": "ewoAc",
  "position": { "x": 30, "y": 70 },
  "parentNode": "region-nodeZone",
  "extent": "parent",
  "data": { "label": "SearchNode", "operation": "SearchNodeAC" }
}
```

### 5-4. EwoLayoutEdge

```typescript
interface EwoLayoutEdge {
  id: string              // エッジID (例: "e-start-ulid")
  source: string          // ソースノードID
  target: string          // ターゲットノードID
  sourceHandle?: string   // ソースハンドル (例: "output-tableId")
  targetHandle?: string   // ターゲットハンドル (例: "input-tableId")
}
```

#### ハンドル命名規則

| ハンドル種別 | 形式 | 例 |
|---|---|---|
| 出力ハンドル | `output-{portName}` | `output-tableId`, `output-ulid` |
| 入力ハンドル | `input-{portName}` | `input-tableId`, `input-rows` |
| ゾーン iter-out | `iter-out` | ForEach → 先頭ノード |
| ゾーン collect-in | `collect-in` | 末尾ノード → ForEach |
| ゾーン input-collection | `input-collection` | 外部 → ForEach |
| ゾーン output-results | `output-results` | ForEach → 下流ノード |

### 5-5. layout 省略時の挙動

`layout.nodes` が空配列の場合、`importer.ts` が dagre アルゴリズムで
左→右（LR）方向に自動レイアウトを生成する。
ただし、オーサリングツールでの編集・確認を想定する場合は layout を含めることを推奨。

---

## 6. バリデーションルール

`validator.ts` に基づくオーサリングツールの検証ルール。

### 6-1. 構造バリデーション (structure)

| ルール | 重要度 | メッセージ |
|---|---|---|
| Start ノードが1つ存在すること | error | `Workflow Start ノードが必要です` |
| Start ノードが2つ以上ないこと | error | `Workflow Start ノードは1つだけ配置してください` |
| End ノードが1つ存在すること | error | `Workflow End ノードが必要です` |
| End ノードが2つ以上ないこと | error | `Workflow End ノードは1つだけ配置してください` |
| AC ノードが存在すること | warning | `Activity ノードがありません` |
| ノード ID に `/` を含まないこと | error | `ノード ID に "/" を含めることはできません` |
| ラベル重複の警告 | warning | `"X" が N 回使用されています` |

### 6-2. DAG バリデーション (dag)

| ルール | 重要度 | メッセージ |
|---|---|---|
| 循環依存がないこと | error | `依存グラフに循環が検出されました。DAGである必要があります` |

### 6-3. ポートバリデーション (port)

| ルール | 重要度 | メッセージ |
|---|---|---|
| 必須入力ポートが接続されていること | warning | `入力ポート "{name}" が未接続です` |
| 孤立ノードがないこと | warning | `孤立ノードです（入力エッジがありません）` |
| End ノードにエッジが接続されていること | warning | `Workflow End に接続されたエッジがありません` |

### 6-4. guard バリデーション

| ルール | 重要度 | メッセージ |
|---|---|---|
| guard 式が `.` で始まること | warning | `guard 式は "." で始まるJQ式を推奨します` |

### 6-5. ForEachZone バリデーション (forEachZone)

| ルール | 重要度 | メッセージ |
|---|---|---|
| Zone ID が設定されていること | error | `Zone ID が未設定です` |
| iterationParam が設定されていること | error | `iterationParam が未設定です` |
| ゾーン内にノードがあること | error | `ゾーン内にノードがありません` |
| input-collection が接続されていること | error | `input-collection が未接続です` |
| iter-out が接続されていること | warning | `iter-out が未接続です` |
| collect-in が接続されていること | warning | `collect-in が未接続です` |
| output-results が接続されていること | warning | `output-results が未接続です` |

### 6-6. wfCall バリデーション

| ルール | 重要度 | メッセージ |
|---|---|---|
| callee が設定されていること | error | `wfCall の callee が未設定です` |
| boundary=true に policy があること | warning | `boundary=true の wfCall に policy が未設定です` |
| recursive=true は boundary=true のみ | error | `recursive=true は boundary=true の場合のみ` |
| ノードIDに `/` を含まないこと | error | ` "/" を含めることはできません` |

---

## 7. TS → JSON 変換ガイド

### 7-1. 基本マッピング

| TS のパターン | JSON での表現 |
|---|---|
| `payload.field` | `deps: { field: { sourceAcId: "$input", sourcePort: "field" } }` |
| `await XxxAC({ param: value })` | `node: { id: "Xxx", operation: "XxxAC", deps: { param: ... } }` |
| `output_prev.port` | `deps: { param: { sourceAcId: "Prev", sourcePort: "port" } }` |
| `await SubWF({ ... })` | `node: { operation: "SubWF", wfCall: { callee: "SubWF", boundary: true } }` |
| `return { out: val }` | `outputs: { out: "LastNode.port" }` |
| 固定値 `[]`, `"str"`, `42` | `deps: { param: { literal: value } }` |

### 7-2. ノード ID の命名規則

TS の変数名からノード ID を導出:

```typescript
const output_createUlid = await CreateUlidAC({})
// → node ID: "CreateUlid"

const output_buildTempTableId = await BuildTemporaryTableIdAC({ ... })
// → node ID: "BuildTempTableId"
```

同じ AC を複数回呼ぶ場合は目的に応じた名前を付ける:
```typescript
const output_3_1 = await RetrieveTableAC({ tableId: structTableId })
const output_5_1 = await RetrieveTableAC({ tableId: dataTableId })
// → "RetrieveStructTable", "RetrieveDataTable"
```

### 7-3. for ループ → ForEachZone

```typescript
// TS
for (const item of collection) {
  const result = await ProcessAC({ data: item })
  // ...
}
```

```json
// JSON
"forEachZones": [{
  "id": "processZone",
  "collectionSource": { "sourceAcId": "SourceNode", "sourcePort": "collection" },
  "iterationParam": "item",
  "nodes": ["Process"],
  "outputNodeId": "Process",
  "outputPort": "result",
  "outputCollection": "allResults"
}]
```

ゾーン内ノードの deps:
```json
{ "data": { "sourceAcId": "$zoneInput", "sourcePort": "item" } }
```

### 7-4. if/else 分岐 → guard

```typescript
if (condition) {
  await BranchAAC(...)
} else {
  await BranchBAC(...)
}
```

```json
{ "id": "BranchA", "guard": "ConditionNode.value == true", ... },
{ "id": "BranchB", "guard": "ConditionNode.value != true", ... }
```

出力のマージは `oneOf`:
```json
{ "result": { "oneOf": [
  { "sourceAcId": "BranchA", "sourcePort": "value" },
  { "sourceAcId": "BranchB", "sourcePort": "value" }
] } }
```

### 7-5. バックエンド API 呼び出し → wfCall (boundary=true)

`ofetch` で `/api/v1/workflow` を呼ぶパターンは、
バックエンド側の WF をサブワークフローとして呼び出す:

```json
{
  "id": "Execute",
  "operation": "BackendWorkflowWF",
  "deps": { ... },
  "outputs": { "result": {} },
  "wfCall": { "callee": "BackendWorkflowWF", "boundary": true }
}
```

### 7-6. 純粋な計算ロジック → AC に分離

TS の WF 内でインラインに書かれた計算ロジックは、
対応する AC を作成して単一ノードとして表現:

```typescript
// TS: インライン計算
const no = `table:${payload.tableId}|lineId:${payload.lineId}|key:${payload.column}`
```

```json
// JSON: AC に分離
{ "id": "BuildSnackingNo", "operation": "BuildSnackingNoAC", "deps": { ... } }
```

---

## 8. 完全な例

### 8-1. シンプルな直列 WF (MakeTemporaryWF)

```json
{
  "id": "MakeTemporaryWF",
  "version": "1.0.0",
  "name": "MakeTemporaryWF",
  "description": "テンポラリテーブルを作成する。",
  "inputs": {
    "tableId": { "schema": "string" },
    "rows": { "schema": "any[]" }
  },
  "wfDef": {
    "nodes": [
      {
        "id": "CreateUlid",
        "operation": "CreateUlidAC",
        "deps": {},
        "outputs": { "ulid": {} }
      },
      {
        "id": "BuildTempTableId",
        "operation": "BuildTemporaryTableIdAC",
        "deps": {
          "tableId": { "sourceAcId": "$input", "sourcePort": "tableId" },
          "ulid": { "sourceAcId": "CreateUlid", "sourcePort": "ulid" }
        },
        "outputs": { "tempTableId": {} }
      },
      {
        "id": "PushRecords",
        "operation": "PushRecordsAC",
        "deps": {
          "tableId": { "sourceAcId": "BuildTempTableId", "sourcePort": "tempTableId" },
          "beforeRows": { "literal": [] },
          "afterRows": { "sourceAcId": "$input", "sourcePort": "rows" }
        },
        "outputs": {}
      }
    ],
    "outputs": {
      "tempTableId": "BuildTempTableId.tempTableId"
    }
  },
  "wiring": {
    "version": 1,
    "routes": [
      {
        "id": "R-CreateUlid",
        "when": { "type": "CreateUlid.done" },
        "correlate": { "by": ["correlationid"] },
        "emit": [
          { "type": "BuildTempTableId.ulid", "wfid": "MakeTemporaryWF", "map": "outputRef->payloadRef" }
        ]
      },
      {
        "id": "R-BuildTempTableId",
        "when": { "type": "BuildTempTableId.done" },
        "correlate": { "by": ["correlationid"] },
        "emit": [
          { "type": "PushRecords.tableId", "wfid": "MakeTemporaryWF", "map": "outputRef->payloadRef" }
        ]
      },
      {
        "id": "R-PushRecords",
        "when": { "type": "PushRecords.done" },
        "correlate": { "by": ["correlationid"] },
        "emit": [
          { "type": "wf.completed", "wfid": "MakeTemporaryWF", "map": "outputRef->payloadRef" }
        ]
      }
    ]
  },
  "layout": {
    "viewport": { "x": 0, "y": 0, "zoom": 0.8 },
    "nodes": [
      { "id": "node-start", "type": "ewoStart", "position": { "x": 50, "y": 150 },
        "data": { "inputs": [{ "name": "tableId", "type": "string" }, { "name": "rows", "type": "any[]" }] } },
      { "id": "node-CreateUlid", "type": "ewoAc", "position": { "x": 300, "y": 100 },
        "data": { "label": "CreateUlid", "operation": "CreateUlidAC", "inputs": [], "outputs": [{ "name": "ulid", "type": "string" }] } },
      { "id": "node-BuildTempTableId", "type": "ewoAc", "position": { "x": 540, "y": 150 },
        "data": { "label": "BuildTempTableId", "operation": "BuildTemporaryTableIdAC",
          "inputs": [{ "name": "tableId", "type": "string" }, { "name": "ulid", "type": "string" }],
          "outputs": [{ "name": "tempTableId", "type": "string" }] } },
      { "id": "node-PushRecords", "type": "ewoAc", "position": { "x": 800, "y": 150 },
        "data": { "label": "PushRecords", "operation": "PushRecordsAC",
          "inputs": [{ "name": "tableId", "type": "string" }, { "name": "afterRows", "type": "any[]" }],
          "outputs": [] } },
      { "id": "node-end", "type": "ewoEnd", "position": { "x": 1050, "y": 150 },
        "data": { "outputs": [{ "name": "tempTableId", "type": "string" }] } }
    ],
    "edges": [
      { "id": "e-start-ulid", "source": "node-start", "target": "node-CreateUlid" },
      { "id": "e-start-build", "source": "node-start", "target": "node-BuildTempTableId",
        "sourceHandle": "output-tableId", "targetHandle": "input-tableId" },
      { "id": "e-ulid-build", "source": "node-CreateUlid", "target": "node-BuildTempTableId",
        "sourceHandle": "output-ulid", "targetHandle": "input-ulid" },
      { "id": "e-build-push", "source": "node-BuildTempTableId", "target": "node-PushRecords",
        "sourceHandle": "output-tempTableId", "targetHandle": "input-tableId" },
      { "id": "e-start-push-rows", "source": "node-start", "target": "node-PushRecords",
        "sourceHandle": "output-rows", "targetHandle": "input-afterRows" },
      { "id": "e-push-end", "source": "node-PushRecords", "target": "node-end" },
      { "id": "e-build-end", "source": "node-BuildTempTableId", "target": "node-end",
        "sourceHandle": "output-tempTableId", "targetHandle": "input-tempTableId" }
    ]
  }
}
```

---

## 9. チェックリスト

ewo.json を手動生成する際の確認事項:

### wfDef

- [ ] 全ノードの `id` が WF 内で一意か
- [ ] `id` に `/` が含まれていないか
- [ ] `operation` に正しい AC/WF 名（サフィックス付き）が指定されているか
- [ ] `$input` 参照が `inputs` に定義されたポートを指しているか
- [ ] `outputs` の値が `"ノードID.ポート名"` 形式か
- [ ] `outputs` で参照されるノードが `nodes` に存在するか
- [ ] `wfCall` ノードの `callee` が設定されているか
- [ ] `forEachZones` の `nodes` リストがゾーン内ノードのIDと一致するか
- [ ] `$zoneInput` を使うノードが `forEachZones.nodes` に含まれているか
- [ ] `$zone:ZoneId` の ZoneId が `forEachZones.id` と一致するか

### wiring

- [ ] 全ノードに対応するルートが存在するか
- [ ] `$input` 依存のルートを生成していないか（不要）
- [ ] `$zoneInput` 依存のルートを生成していないか（不要）
- [ ] `$zone:` 依存のルートを生成していないか（代わりに `R-$zone:` ルートを生成）
- [ ] 終端ノードが `wf.completed` を emit しているか
- [ ] ファンアウト時に `.result` emit が先頭にあるか
- [ ] wfid が全 emit で一致しているか

### layout

- [ ] `edges` (複数形) を使っているか（`edge` ではない）
- [ ] `node-start` (ewoStart) と `node-end` (ewoEnd) が存在するか
- [ ] `node-start.data.inputs` が `inputs` と対応しているか
- [ ] `node-end.data.outputs` が `wfDef.outputs` と対応しているか
- [ ] wfCall ノードは `ewoWfCall` タイプか
- [ ] ゾーン内ノードに `parentNode` と `extent: "parent"` が設定されているか
- [ ] ForEachRegion ノードに `style` (width/height) が設定されているか
- [ ] リテラル dep がある場合 `ewoLiteral` ノードが配置されているか
- [ ] ewoLiteral の sourceHandle は `"output-value"` になっているか

---

## 付録 A. デモワークフロー パターン一覧

`nuxt/workflowDefs/demo/workflows/` に全パターンの参照実装がある:

| デモ | パターン | 主な特徴 |
|---|---|---|
| DemoSerial_ImageThumb | 直列 | A → B の最も基本的な形 |
| DemoJoin_UserReport | 並列→合流 (Join) | 2つの並列ノード → 合流ノード |
| DemoEwoParallelJoin | Fan-out + nested Join | AC1→AC4, AC2→AC3→AC4→AC5 の複合依存 |
| DemoLiteral_TaxCalc | リテラル値 | `{ "literal": 0.1 }` で固定値を供給 |
| DemoForEach_SearchDetail | ForEach Zone | `mode: "parallel"` でコレクション並列処理 |
| DemoNestedForEach_ClassReport | ネスト ForEach | `childZones` で2階層ループ |
| DemoRecursive_TreeWalk | 再帰 wfCall | `recursive: true`, `maxRecursionDepth: 10` |
| DemoSwitch_TicketView | Switch + 外部WF | `guard` + `wfCall(boundary=true)` + `oneOf` |
| DemoSwitchMerge_OrderProcess | Switch分岐合流 | 2分岐 guard → `oneOf` でマージ |
| DemoInlineWfCall_TicketView | インライン wfCall | `wfCall(boundary=false)` で子WFを展開 |
| DemoWF-PurchaseTicket | 子WF | 親WFから wfCall で呼ばれる側 |

---

## 付録 B. エンジン実行モデル

ソース: `nuxt/utils/ewo/engine/`, `laravel/app/Ewo/Engine/`

### B-1. アーキテクチャ

```
EwoJson
  │
  ▼
Launcher ──▶ InlineExpander (boundary=false の wfCall を事前展開)
  │
  ├── Coordinator   : ノード状態管理・スケジューリング・完了判定
  ├── Mediator      : wiring.routes に基づくイベントルーティング
  ├── AC Worker     : アクティビティ関数の実行
  ├── PayloadStore  : ノード出力の保持（Nuxt: in-memory / Laravel: Redis）
  ├── RequestBus    : Mediator → Coordinator へのポート到着通知
  └── AnswerBus     : AC Worker → Mediator への完了通知
```

### B-2. 実行フロー

1. **Launcher** が EwoJson をロードし、Coordinator / Mediator / PayloadStore / EventBus を生成
2. **Coordinator.start()** が `readyLoop()` を呼び出し
3. **readyLoop()** が全ノードをスキャン:
   - ゾーン内ノードはスキップ
   - `$input` と `literal` の deps は初期化時に pre-populate 済み
   - 全 deps が到着しているノードを「ready」と判定
   - `guard` を評価し、false なら skip（下流にカスケード伝播）
   - ready ノードに `.cmd` CloudEvent を発行
4. **AC Worker** がアクティビティ関数を実行し、結果を PayloadStore に保存、`.done` イベントを AnswerBus に発行
5. **Mediator** が `.done` イベントを受信、wiring.routes をマッチングし、ターゲットポートへ emit
6. **Coordinator** がポート到着を受信 → `readyLoop()` を再度実行
7. 全ノードが done/skipped になったらワークフロー完了

### B-3. CloudEvent タイプ規則

エンジン内部で使用される CloudEvent のタイプ命名:

| タイプ | 方向 | 意味 |
|---|---|---|
| `{acId}.cmd` | Coordinator → AC Worker | アクティビティ実行指示 |
| `{acId}.done` | AC Worker → AnswerBus | 実行完了 |
| `{acId}.error` | AC Worker → AnswerBus | 実行エラー |
| `{targetNode}.{depKey}` | Mediator → RequestBus | ポート到着通知 |
| `$zone:{zoneId}.input` | Mediator → RequestBus | ゾーンへのコレクション入力 |
| `$zone:{zoneId}.done` | Launcher → AnswerBus | ゾーン全イテレーション完了 |
| `wf.completed` | Mediator → (終了) | ワークフロー完了 |

> **wiring.routes の `emit.type`** はこの `{targetNode}.{depKey}` に対応する。
> Mediator は `when.type` で `.done` イベントをマッチし、`emit` でターゲットポートに転送する。

### B-4. ノード状態ライフサイクル

```
pending ──▶ running ──▶ done
   │                      │
   │  (guard=false)       │  (error)
   ▼                      ▼
skipped                 error
```

- **pending**: 初期状態。deps 到着待ち
- **running**: 全 deps 到着 + guard 通過。AC Worker に dispatch 済み
- **done**: AC Worker から `.done` を受信
- **skipped**: guard が false、または上流ノードが skipped でカスケード
- **error**: AC Worker から `.error` を受信

#### guard skip のカスケード伝播

ノードが skipped になると、そのノードに直接依存する下流ノードも自動的に skipped:

```
ClassifyOrder → ProcessStandard (guard: .orderType == "standard")
             → ValidateExpress (guard: .orderType == "express")
                  → ShipExpress (ProcessStandard が skipped でも影響なし)
```

`oneOf` deps の場合、全ての選択肢が skipped のときのみカスケード:

```
FinalizeOrder.shipment = oneOf [ProcessStandard.shipment, ShipExpress.shipment]
→ どちらか一方が done であれば FinalizeOrder は実行される
```

### B-5. AC Worker の動作

#### operation 解決

```
resolveAc(operation || acId)
```

`operation` フィールドで AC レジストリを検索する。
見つからない場合はエラー。**operation が正確な AC 名でなければ実行できない。**

#### 結果ラッピング

AC 関数の戻り値がオブジェクトでない場合（配列、プリミティブ等）は自動ラップ:

```javascript
const result = (typeof rawResult === 'object' && !Array.isArray(rawResult))
  ? rawResult
  : { _result: rawResult }
```

> AC を実装する際は、`{ portName: value, ... }` のオブジェクトを返すのが推奨。

#### PayloadStore キー規則

| コンテキスト | キー形式 |
|---|---|
| 通常ノード | `{correlationId}:{acId}` |
| ゾーン内ノード | `{correlationId}:{acId}:{zoneId}:{iterationId}` |
| ゾーン出力 | `{correlationId}:$zone:{zoneId}` |

### B-6. oneOf 依存の解決ロジック

Coordinator は `oneOf` deps を以下のように解決する:

1. arrivedPorts キー: `{nodeId}.{depKey}:{sourceAcId}.{sourcePort}`
2. いずれかの選択肢が到着していれば deps 充足
3. `assemblePayload` 時に到着しているソースの値を採用（到着順で最初のもの）

```json
"shipment": {
  "oneOf": [
    { "sourceAcId": "ProcessStandard", "sourcePort": "shipment" },
    { "sourceAcId": "ShipExpress", "sourcePort": "shipment" }
  ]
}
```

> guard で一方が skipped の場合、到着したもう一方が自動的に使われる。

### B-7. インライン展開 (boundary=false) の詳細

`inlineExpander.ts` が実行前に処理:

| 処理 | 内容 |
|---|---|
| ノード ID | `{callNodeId}/{childNodeId}` にプレフィクス |
| 子の `$input` deps | 親 wfCall ノードの deps にリマップ |
| 子の `$zoneInput` deps | そのまま維持 |
| 子の `$zone:` refs | `$zone:{prefix}/{zoneId}` にプレフィクス |
| guard | 親 wfCall の guard を子のエントリノードに伝播 |
| wiring | 展開後の wfDef から再生成（子の wiring は使わない） |

**制約:**
- 展開深度上限: `MAX_EXPANSION_DEPTH = 10`（循環参照防止）
- callee がレジストリになく AC レジストリにある場合は通常 AC として実行

### B-8. ランタイム制約

| 制約 | Nuxt | Laravel | 設定箇所 |
|---|---|---|---|
| 再帰深度上限 | correlationId の `:` 数で判定 | 同左 | `wfCall.policy.maxRecursionDepth` or 20 |
| インライン展開深度 | 10 | - | `inlineExpander.ts` 固定値 |
| タイムアウト | - | 120秒 | `config/ewo.php` |
| Redis Stream TTL | - | 86400秒 | `config/ewo.php` |
| Payload TTL | - | 86400秒 | `config/ewo.php` |

### B-9. ewo.json 記述がエンジンに与える影響

| ewo.json の記述 | エンジンの解釈 |
|---|---|
| `deps.$input` | Coordinator が `initArrivedPorts()` で WF 入力値を pre-populate |
| `deps.literal` | Coordinator が `initArrivedPorts()` で固定値を pre-populate |
| `deps.oneOf` | Coordinator が複数ソースから最初の到着を採用 |
| `guard` | Coordinator が `readyLoop()` で評価、false なら skip + カスケード |
| `wfCall.boundary=true` | Launcher が子WFインスタンスを生成して実行 |
| `wfCall.boundary=false` | InlineExpander が展開してから実行 |
| `forEachZones` | Coordinator が `$zone:.input` イベントでイテレーション管理 |
| `wiring.routes` | Mediator が `.done` → ターゲットポートへルーティング |
| `wfDef.outputs` | Coordinator が `resolveOutputs()` で PayloadStore から取得 |
