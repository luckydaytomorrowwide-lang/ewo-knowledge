# リポジトリ参照ルール

## リポジトリURL（固定）

https://github.com/luckydaytomorrowwide-lang/ewo-swf-knowledge

---

## ブランチの役割

### source ブランチ

用途：
- AC 定義の参照
- WF 定義の参照
- EWO生成時の使用可能コンポーネント確認

参照パス：
- swf/source/activities/
- swf/source/workflows/

---

### main ブランチ

用途：
- spec の正
- tests の正
- 運用検証の正

---

## ブランチ参照原則

- EWO生成時は source ブランチを参照する。
- テスト・解析時は main ブランチを参照する。
- 自動的なブランチ推測は行わない。
- spec に明記されているブランチを正とする。
