osu! stats

English | 日本語

osu! の公式APIを使って、プレイヤーの統計情報・ビートマップ・複数プレイヤー比較を検索・表示するWebアプリです。UIは日本語/英語を切り替えられます。

## デモ🔗 
https://osu-stats-app.vercel.app/
![デモ画像](img.png)

使用技術


フロントエンド: React, Vite, Recharts
バックエンド: FastAPI (Python)
API: osu! API v2(Client Credentials Grant)


機能


osu! ユーザー名でプレイヤーを検索(rank, pp, accuracy, play countなどの統計表示)
ゲームモード切り替え(osu!, Taiko, Catch, Mania)
トッププレイ(ベストスコア)一覧の表示、ランクバッジの色分け
pp推移・活動時間帯・コンボ/ミス数・BPM傾向のグラフ表示
ビートマップ検索(曲名・アーティスト名、難易度・ジャンル・言語などのフィルタ付き)
プレイヤー比較(最大8人まで、各種統計・グラフ・共通トッププレイ譜面を並べて比較)
UIの日本語/英語切り替え


セットアップ

前提条件


Python 3.10+
Node.js 18+
osu! OAuthアプリ の登録(Client ID / Client Secretが必要)


バックエンド

bashcd backend
cp .env.example .env
# .env を編集して OSU_CLIENT_ID と OSU_CLIENT_SECRET を設定

pip install -r requirements.txt
uvicorn main:app --reload --port 8000

フロントエンド

bashcd frontend
npm install
npm run dev

ブラウザで http://localhost:5173 を開いてください。

API エンドポイント

メソッドパス説明GET/api/user/{username}ユーザーの統計情報を取得GET/api/user/{username}/scores/bestユーザーのトッププレイを取得GET/api/beatmapsets/searchビートマップセットを検索

今後追加したい機能


お気に入りプレイヤーの保存
より詳細な統計グラフ


ライセンス

MIT