# Baseline (Current Standard)

このファイルは「いま再現できる正の基準」を固定する。
SWF生成の基準はここを正本とする。

---

## 1. Baseline ID
- baseline_id: baseline-2026-03-03-01

---

## 2. Engine
- engine_version: TBD

※ engine_version が未確定の場合は、確定次第ここを更新する。

---

## 3. Source (Implementation)
- repo: ewo-swf-knowledge
- branch: TBD
- tag: TBD
- commit: TBD

---

## 4. Test (Repro Assets)
- repo: ewo-swf-knowledge
- branch: TBD
- tag: TBD
- commit: TBD

---

## 5. Coverage (What is guaranteed)
- guaranteed_examples:
  - ExampleGood01 (normal EWO)
---

## 6. Related Knowledge
- spec:
  - swf/spec/pdca-structure.md
- decisions:
  - swf/decisions/ADR-0001-branch-strategy.md
- templates:
  - swf/templates/pull-request-template.md
- checklists:
  - swf/checklists/work-start-checklist.md

---

## 7. Change Policy
Baseline更新時は必ずPRを作成し、以下を満たすこと。

- 何が変わったか（diffの説明）
- なぜ変わったか（根拠）
- 検証結果（CHECK）
- 再発防止（ACT）
- 関連するADR/Issue（あれば）

---

## 8. Notes
TBD
