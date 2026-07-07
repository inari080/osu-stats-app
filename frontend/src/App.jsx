import { useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// osu!のランク(XH, X, SH, S, A, B, C, D)に応じてCSSクラス名を返す
function getRankClass(rank) {
  if (!rank) return "";
  const normalized = rank.toUpperCase();
  if (normalized === "XH" || normalized === "SSH") return "rank-ssh";
  if (normalized === "X" || normalized === "SS") return "rank-ss";
  if (normalized === "SH") return "rank-sh";
  if (normalized === "S") return "rank-s";
  if (normalized === "A") return "rank-a";
  if (normalized === "B") return "rank-b";
  if (normalized === "C") return "rank-c";
  return "rank-d";
}

function PlayerSearch() {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("osu");
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setUser(null);
    setScores([]);

    try {
      const userRes = await fetch(
          `${API_BASE}/api/user/${encodeURIComponent(username)}?mode=${mode}`
      );
      if (!userRes.ok) {
        throw new Error(
            userRes.status === 404
                ? "ユーザーが見つかりませんでした"
                : "取得に失敗しました"
        );
      }
      const userData = await userRes.json();
      setUser(userData);

      const scoresRes = await fetch(
          `${API_BASE}/api/user/${encodeURIComponent(
              username
          )}/scores/best?mode=${mode}&limit=5`
      );
      if (scoresRes.ok) {
        setScores(await scoresRes.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        <form className="search-form" onSubmit={handleSearch}>
          <input
              type="text"
              placeholder="osu! ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
          />
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="osu">osu!</option>
            <option value="taiko">Taiko</option>
            <option value="fruits">Catch</option>
            <option value="mania">Mania</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "検索中..." : "検索"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {user && (
            <div className="user-card">
              <img src={user.avatar_url} alt={user.username} className="avatar" />
              <div className="user-info">
                <h2>{user.username}</h2>
                <p>Rank: #{user.statistics?.global_rank ?? "N/A"}</p>
                <p>PP: {user.statistics?.pp?.toFixed(2) ?? "N/A"}</p>
                <p>Accuracy: {user.statistics?.hit_accuracy?.toFixed(2) ?? "N/A"}%</p>
                <p>Play Count: {user.statistics?.play_count ?? "N/A"}</p>
              </div>
            </div>
        )}

        {scores.length > 0 && (
            <div className="scores-list">
              <h3>Top Plays</h3>
              {scores.map((score) => (
                  <div key={score.id} className="score-row">
              <span className="beatmap-title">
                {score.beatmapset?.title ?? "Unknown"}
                {" - "}
                {score.beatmap?.version ?? ""}
              </span>
                    <span className="score-pp">{score.pp?.toFixed(2) ?? 0}pp</span>
                    <span className={`score-rank ${getRankClass(score.rank)}`}>
                {score.rank}
              </span>
                  </div>
              ))}
            </div>
        )}
      </>
  );
}

const STATUS_OPTIONS = [
  { value: "ranked", label: "Ranked" },
  { value: "qualified", label: "Qualified" },
  { value: "loved", label: "Loved" },
  { value: "favourites", label: "お気に入り" },
  { value: "pending", label: "Pending" },
  { value: "wip", label: "WIP" },
  { value: "graveyard", label: "Graveyard" },
  { value: "any", label: "すべて" },
];

const SORT_OPTIONS = [
  { value: "", label: "関連度(デフォルト)" },
  { value: "ranked_desc", label: "Ranked日: 新しい順" },
  { value: "ranked_asc", label: "Ranked日: 古い順" },
  { value: "plays_desc", label: "プレイ数: 多い順" },
  { value: "plays_asc", label: "プレイ数: 少ない順" },
  { value: "difficulty_desc", label: "難易度: 高い順" },
  { value: "difficulty_asc", label: "難易度: 低い順" },
  { value: "rating_desc", label: "評価: 高い順" },
  { value: "favourites_desc", label: "お気に入り: 多い順" },
  { value: "title_asc", label: "タイトル: A-Z" },
  { value: "artist_asc", label: "アーティスト: A-Z" },
];

const GENRE_OPTIONS = [
  { value: "", label: "ジャンル: 指定なし" },
  { value: "1", label: "Unspecified" },
  { value: "2", label: "Video Game" },
  { value: "3", label: "Anime" },
  { value: "4", label: "Rock" },
  { value: "5", label: "Pop" },
  { value: "6", label: "Other" },
  { value: "7", label: "Novelty" },
  { value: "9", label: "Hip Hop" },
  { value: "10", label: "Electronic" },
  { value: "11", label: "Metal" },
  { value: "12", label: "Classical" },
  { value: "13", label: "Folk" },
  { value: "14", label: "Jazz" },
];

const LANGUAGE_OPTIONS = [
  { value: "", label: "言語: 指定なし" },
  { value: "1", label: "Unspecified" },
  { value: "2", label: "English" },
  { value: "3", label: "Japanese" },
  { value: "4", label: "Chinese" },
  { value: "5", label: "Instrumental" },
  { value: "6", label: "Korean" },
  { value: "7", label: "French" },
  { value: "8", label: "German" },
  { value: "9", label: "Swedish" },
  { value: "10", label: "Spanish" },
  { value: "11", label: "Italian" },
  { value: "12", label: "Russian" },
  { value: "13", label: "Polish" },
  { value: "14", label: "Other" },
];

function BeatmapSearch() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("");
  const [status, setStatus] = useState("ranked");
  const [sort, setSort] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [minStar, setMinStar] = useState("");
  const [maxStar, setMaxStar] = useState("");
  const [beatmapsets, setBeatmapsets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // App.jsx: handleSearch
  const handleSearch = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setBeatmapsets([]);

    try {
      const params = new URLSearchParams({ q: query, status });
      if (mode) params.set("mode", mode);
      if (sort) params.set("sort", sort);
      if (genre) params.set("genre", genre);
      if (language) params.set("language", language);
      if (minStar !== "") params.set("min_star", minStar);
      if (maxStar !== "") params.set("max_star", maxStar);

      const res = await fetch(`${API_BASE}/api/beatmapsets/search?${params}`);
      if (!res.ok) {
        throw new Error("検索に失敗しました");
      }
      const data = await res.json();
      setBeatmapsets(data.beatmapsets ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <>
        <form className="search-form" onSubmit={handleSearch}>
          <input
              type="text"
              placeholder="曲名・アーティスト名で検索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
          />
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">全モード</option>
            <option value="osu">osu!</option>
            <option value="taiko">Taiko</option>
            <option value="fruits">Catch</option>
            <option value="mania">Mania</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "検索中..." : "検索"}
          </button>
        </form>

        <div className="filter-bar">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
            ))}
          </select>

          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            {GENRE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
            ))}
          </select>

          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
            ))}
          </select>

          // App.jsx: 星レート部分
          <div className="star-range">
            <input
                type="number"
                step="0.1"
                min="0"
                max="15"
                placeholder="★下限"
                value={minStar}
                onChange={(e) => setMinStar(e.target.value)}
            />
            <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={minStar === "" ? 0 : minStar}
                onChange={(e) => setMinStar(e.target.value)}
                className="star-slider"
            />
            <span>〜</span>
            <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={maxStar === "" ? 15 : maxStar}
                onChange={(e) => setMaxStar(e.target.value)}
                className="star-slider"
            />
            <input
                type="number"
                step="0.1"
                min="0"
                max="15"
                placeholder="★上限"
                value={maxStar}
                onChange={(e) => setMaxStar(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        {beatmapsets.length > 0 && (
            <div className="beatmapset-list">
              {beatmapsets.map((set) => (
                  <div key={set.id} className="beatmapset-card">
                    <img
                        src={set.covers?.card ?? set.covers?.list}
                        alt={set.title}
                        className="beatmapset-cover"
                    />
                    <div className="beatmapset-info">
                      <h3>{set.title}</h3>
                      <p className="beatmapset-artist">{set.artist}</p>
                      <p className="beatmapset-mapper">mapped by {set.creator}</p>
                      <div className="beatmapset-diffs">
                        {set.beatmaps?.slice(0, 6).map((b) => (
                            <span key={b.id} className="diff-badge">
                      {b.version} ({b.difficulty_rating?.toFixed(1)}★)
                    </span>
                        ))}
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </>
  );
}

function App() {
  const [tab, setTab] = useState("player");

  return (
      <div className="app">
        <header className="header">
          <h1>osu! stats</h1>
          <p className="subtitle">プレイヤー統計・ビートマップを検索</p>
        </header>

        <div className="tabs">
          <button
              className={`tab-button ${tab === "player" ? "active" : ""}`}
              onClick={() => setTab("player")}
          >
            プレイヤー検索
          </button>
          <button
              className={`tab-button ${tab === "beatmap" ? "active" : ""}`}
              onClick={() => setTab("beatmap")}
          >
            ビートマップ検索
          </button>
        </div>

        {tab === "player" ? <PlayerSearch /> : <BeatmapSearch />}
      </div>
  );
}

export default App;