# EWO Source

このブランチには  
EWO Workflow の **実装コード**を格納します。

main ブランチにある knowledge リポジトリとは役割が異なります。

---

# 役割

このブランチは

EWO Workflow を実際に動作させるための

- activities
- workflows
- engine
- runtime

などの **実装コードの正本（SSOT）**です。

---

# 実装構造

例
- ewo/source/activities
- ewo/source/workflows


ここにあるコードが  
EWO Runner や Authoring Tool から利用されます。

---

# knowledge との関係

|ブランチ|役割|
|---|---|
main | knowledge（仕様・例・テンプレート） |
source | 実装コード |

AI や作業者は

1 knowledge を参照  
2 source を確認  

という順序で理解します。

---

# 注意

source ブランチは

仕様ではありません。

仕様は **main ブランチの spec** を参照してください。
