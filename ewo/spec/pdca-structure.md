# PDCA Structure

EWO Factory は次の工程で運用する。

---

## PLAN

EWOの設計を行う工程。

### 作業

- 新しいEWO.jsonを作成する
- 作成対象のworkflowを定義する
- 入力条件を整理する

### 成果物

- EWO.json
- 作業計画
- 入力条件

---

## DO

workflowを実行する工程。

### 作業

- sourceブランチのworkflowを実行する

参照

source / ewo / source / workflows  
source / ewo / source / activities

### 成果物

- workflow実行結果
- 実行ログ

---

## CHECK

workflow実行結果を検証する工程。

### 作業

- 実行ログを解析する
- 想定結果との差分を確認する

### 成果物

- 解析結果
- 問題点整理

---

## ACTION

解析結果に対して改善を行う工程。

### 作業

- 修正EWO.jsonを作成する
- 必要に応じてworkflowを修正する

### 成果物

- 修正EWO.json
- 修正PR
- decisions更新
- spec更新
