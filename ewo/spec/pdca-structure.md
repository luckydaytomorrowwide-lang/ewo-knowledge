# PDCA Structure

EWO Factory は次の工程で運用する。

PLAN  
DO  
CHECK  
ACTION

---

# PLAN（EWO作成）

## 目的

新しいEWOを設計する。

## 作業

- 新しいEWO.jsonを作成する
- テストケースを作成する
- テスト資材一式を準備する

## 成果物

- EWO.json
- テストケース
- テスト資材

---

# DO（WF Running）

## 目的

workflowを実行する。

## 作業

- sourceブランチのworkflowを実行する

## 成果物

- workflow実行結果
- 実行ログ

---

# CHECK（log解析）

## 目的

workflow実行結果を検証する。

## 作業

- 実行ログを解析する
- 想定結果との差分を確認する

## 成果物

- 解析結果
- 問題点整理

---

# ACTION（解析結果の対応）

## 目的

解析結果に基づき改善を行う。

## 作業

- EWO.jsonを修正する
- 必要に応じてworkflowを修正する
- GitHubに反映する

## 成果物

- 修正EWO.json
- 修正PR
- decisions更新
- spec更新
