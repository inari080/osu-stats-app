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

function BeatmapSearch() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("");
  const [beatmapsets, setBeatmapsets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setBeatmapsets([]);

    try {
      const params = new URLSearchParams({ q: query });
      if (mode) params.set("mode", mode);

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