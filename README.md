# members-edit

[members-assoc](https://github.com/approvers/members-assoc) で関連付けた情報を簡単に編集できるウェブ UI を提供します.

## 使い方

まず, あなたの Discord アカウントが限界開発鯖 (Approvers) に参加している必要があります. さもなくば編集データの保存が動作しないか, ログイン段階で失敗します.

Approvers のメンバーの方は, [https://edit.members.approvers.dev](https://edit.members.approvers.dev) にアクセスしてログインしましょう. OAuth によるログインのポップアップが表示されます.

その後, GitHub や X (旧 Twitter) のアカウント情報を追加/削除できます. 追加はリスト下部のボタンから, 削除はリスト内のアカウント項目の横にあるボタンから行なえます. 編集が完了したら, 保存ボタンをクリックして保存しましょう.

保存できた情報は, `https://members.approvers.dev/{あなたの Discord アカウントの ID}/associations` で取得できます. 心配であればご確認ください.

ログインした際のアクセストークンの関係で, 長時間操作しないでいると保存処理に失敗することがあります. その場合はリロードして再度ログインし直してください.

## 技術情報

これは Next.js (App Router) を用いて構築されており, Cloudflare Pages 上にデプロイされています.
