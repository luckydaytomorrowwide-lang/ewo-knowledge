# EWO Factory Specification

このディレクトリは
EWO Factory の仕様（SSOT）を定義する。

---

# 用語

このプロジェクトでは

SWF = EWO

として扱う。

---

# spec の役割

spec は EWO Factory の **正本（SSOT）**であり、次の内容を定義する。

* EWO生成仕様
* EWO Factory運用仕様
* 作業工程（PDCA）
* テスト構造
* リポジトリ構造
* 参照関係

---

# spec ファイル一覧

| ファイル              | 内容         |
| ----------------- | ---------- |
| README.md         | spec の入口   |
| ewo-generation.md | EWO生成仕様    |
| pdca-structure.md | 作業工程（PDCA） |
| test-structure.md | テスト構造      |
| repository.md     | リポジトリ構造    |
| operation-rule.md | 運用ルール      |
| reference-map.md  | 参照関係       |

---

# 参照順

GitHubの内容は次の順序で参照する。

1 spec
2 decisions
3 examples
4 templates
5 checklists

spec が最優先である。

---

# docs/pdca

docs/pdca は

PLAN
DO
CHECK
ACTION

の工程ナビゲーションであり
spec へのリンク集である。

spec の代替ではない。

---

# 実装参照

EWO生成の実装は
source ブランチを参照する。

source / ewo / source / activities
source / ewo / source / workflows

これらが実装の正本である。
