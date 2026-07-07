"""
osu! Stats App - Backend
Client Credentials Grant を使って osu! API v2 にアクセスする。
(ユーザー自身のログインは不要。公開データの取得のみなのでこれで十分)
"""

import os
import time
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

OSU_CLIENT_ID = os.getenv("OSU_CLIENT_ID")
OSU_CLIENT_SECRET = os.getenv("OSU_CLIENT_SECRET")

TOKEN_URL = "https://osu.ppy.sh/oauth/token"
API_BASE = "https://osu.ppy.sh/api/v2"

app = FastAPI(title="osu! Stats App API")

# ローカル開発用 + 本番のフロントエンドURLからのアクセスを許可
# フロントエンドをVercel等にデプロイしたら、そのURLをここに追加する
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://osu-stats-app.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# トークンをメモリ上にキャッシュ(シンプルな実装。将来Redis等に置き換え可)
_token_cache = {"access_token": None, "expires_at": 0}


async def get_access_token() -> str:
    """Client Credentials Grant でアクセストークンを取得(キャッシュ付き)"""
    now = time.time()
    if _token_cache["access_token"] and _token_cache["expires_at"] > now + 60:
        return _token_cache["access_token"]

    if not OSU_CLIENT_ID or not OSU_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="OSU_CLIENT_ID / OSU_CLIENT_SECRET が .env に設定されていません",
        )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TOKEN_URL,
            json={
                "client_id": OSU_CLIENT_ID,
                "client_secret": OSU_CLIENT_SECRET,
                "grant_type": "client_credentials",
                "scope": "public",
            },
        )
        resp.raise_for_status()
        data = resp.json()

    _token_cache["access_token"] = data["access_token"]
    _token_cache["expires_at"] = now + data["expires_in"]
    return _token_cache["access_token"]


@app.get("/")
async def root():
    return {"status": "ok", "message": "osu! Stats App backend is running"}


@app.get("/api/user/{username}")
async def get_user(username: str, mode: str = "osu"):
    """
    ユーザー名からosu!プレイヤー情報を取得。
    mode: osu, taiko, fruits, mania
    """
    token = await get_access_token()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_BASE}/users/{username}/{mode}",
            headers={"Authorization": f"Bearer {token}"},
            params={"key": "username"},
        )

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    resp.raise_for_status()
    return resp.json()


@app.get("/api/user/{username}/scores/best")
async def get_user_best_scores(username: str, mode: str = "osu", limit: int = 10):
    """ユーザーのベストスコア(トッププレイ)を取得"""
    token = await get_access_token()

    # まずuser_idを取得する必要がある
    async with httpx.AsyncClient() as client:
        user_resp = await client.get(
            f"{API_BASE}/users/{username}/{mode}",
            headers={"Authorization": f"Bearer {token}"},
            params={"key": "username"},
        )
        if user_resp.status_code == 404:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
        user_resp.raise_for_status()
        user_id = user_resp.json()["id"]

        scores_resp = await client.get(
            f"{API_BASE}/users/{user_id}/scores/best",
            headers={"Authorization": f"Bearer {token}"},
            params={"mode": mode, "limit": limit},
        )
        scores_resp.raise_for_status()
        return scores_resp.json()


@app.get("/api/beatmapsets/search")
async def search_beatmapsets(q: str, mode: str = "", status: str = "ranked"):
    """
    ビートマップセットを検索する。
    q: 検索キーワード(曲名、アーティスト名など)
    mode: osu, taiko, fruits, mania (空文字なら全モード)
    status: ranked, qualified, loved, pending, graveyard, wip, all
    """
    token = await get_access_token()

    params = {"query": q}
    if status and status != "all":
        params["s"] = status
    if mode:
        mode_map = {"osu": "0", "taiko": "1", "fruits": "2", "mania": "3"}
        if mode in mode_map:
            params["m"] = mode_map[mode]

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{API_BASE}/beatmapsets/search",
            headers={"Authorization": f"Bearer {token}"},
            params=params,
        )
        resp.raise_for_status()
        return resp.json()