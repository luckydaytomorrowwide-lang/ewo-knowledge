# EWO Generation Specification

このドキュメントは  
EWO生成の基本仕様を定義する。

---

# EWOとは

EWO は workflow 実行を定義するファイルである。

EWO は **EWO.json** として定義する。

---

# EWO生成

EWO生成は **PLAN工程**で行う。

PLAN工程では  
新しい **EWO.json** を作成する。

---

# 実装参照

workflow実行の実装は  
sourceブランチを参照する。

source / ewo / source / activities  
source / ewo / source / workflows  

これらが実装の正本である。

---

# examples

examples は  
実績のあるEWOの例を保存する。

EWO生成時の参考として使用する。

examples には次の種類がある。

good  
良いEWOの例

bad  
悪いEWOの例

---

# 情報不足時

ユーザー依頼だけでは  
EWO生成内容が確定できない場合

推測で補完してはならない。

不足情報を質問して確定する。
