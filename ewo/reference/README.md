# Reference Materials

このフォルダには EWO に関する参考資料を格納します。

ここにある資料は正式仕様ではありません。

- 不完全な可能性があります
- 古い可能性があります
- 実装と一致しない可能性があります

## Purpose

reference は、AI や人が以下の目的で利用するための補助情報です。

・構造が不明なときの調査  
・ツール挙動の理解  
・ログ解析の補助  
・実装背景の把握  

## Usage Policy for AI

AI は reference を必要に応じて参照できます。

ただし reference の参照は必須ではありません。

spec / decisions / examples / templates / checklists で十分に判断できる場合は  
reference を参照しなくても構いません。

## Caution

reference の内容と

・JSON  
・実装  
・成果物  

が矛盾する場合

reference を正とみなしてはいけません。

その場合 AI は **ALERT を出してください**

## Priority

AI の基本参照順

1 spec  
2 decisions  
3 examples  
4 templates  
5 checklists  
6 reference（必要に応じて）
