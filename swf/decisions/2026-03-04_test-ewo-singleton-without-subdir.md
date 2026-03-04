# Decision: GitHub UI でのファイル追加時は「フォルダ」と「ファイル名」を分離して指示する（パス二重入力の再発防止）

## 決定日
2026-03-04

## Status
Accepted

## Context
GitHubのWeb UI でファイルを追加する際、表示中のディレクトリと入力パスが混同され、
`swf/decisions` を表示しながら `swf/decisions/<file>` を入力してしまい、
結果として `swf/decisions/swf/decisions/<file>` のように二重ディレクトリが作られる事故が発生した。

この事故は、参照パスの正（specの参照マップ）と実体がズレるため、
Decision参照漏れ・運用矛盾につながる。

## Decision
- GitHub UI でファイル追加・移動を案内する際、以後は必ず以下の形式で指示する：
  - フォルダ：`<dir>`
  - ファイル名：`<filename>`
  - （必要に応じて）配置後のフルパス：`<dir>/<filename>`
- 指示側（AI）は「フルパス一括」だけの提示を禁止し、必ず分離形式を併記する。
- 受け手は GitHub UI 上で表示しているフォルダと、入力する内容が重複していないかを確認する。

## Consequences
- コピペによる二重パス事故をガードできる。
- Decision/spec の参照パスが安定し、参照漏れリスクを低減できる。
