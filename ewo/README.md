# EWO Knowledge

このディレクトリは **EWO Workflow の知識ベース**です。

SWF生成やEWO解析を  
**再現可能な形で進めるための情報**を格納します。

ここにある情報は **役割ごとに整理されており、AIや人が同じ手順で参照できる構造**になっています。

---

# 工程参照

EWO作業は **PDCA工程**で進めます。

|工程|参照ファイル|
|---|---|
PLAN|plan.md|
DO|do.md|
CHECK|check.md|
ACTION|action.md|

チャット開始時は **START.md** を参照してください。

---

# ディレクトリの役割

## spec

EWO作成のルールです。

ここに書かれている内容は **正とみなされます**。  
AIや人はまずここを参照します。

例

- SWF構造
- JSON構造
- workflow仕様

---

## decisions

設計上の決定事項を記録します。

仕様の背景や、過去の設計判断を理解するための資料です。

---

## examples

正しいEWO例を格納します。

AIが構造を理解したり、新しいJSONを生成するときの参考になります。

---

## templates

生成時に利用するテンプレートです。

例

- JSONテンプレート
- workflowテンプレート

---

## checklists

作業時の確認項目です。

例

- SWF作成チェック
- JSON検証チェック

---

## reference

reference には **参考資料**を格納します。

これらは正式仕様ではありません。

- 古い可能性があります  
- 実装と一致しない可能性があります  
- 不完全な可能性があります  

AIは **必要に応じて参照します。**

---

# 実装参照

workflow実装は **sourceブランチ**を参照します。

source/ewo/source/activities  
source/ewo/source/workflows

---

# 実行資材

workflow実行資材は **testブランチ**を参照します。

---

# Repository Policy

このリポジトリでは次を基本ルールとします。

- mainブランチへ直接変更しない
- 変更はPRで反映する
- 作業中の決定事項は `decisions/` に記録する

---

# Goal

このリポジトリの目的は

**EWO Workflow の生成・検証・実行を再現可能なプロセスとして固定すること**

です。
