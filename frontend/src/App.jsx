import { useState } from "react";
import "./App.css";

const API_BASE = "https://osu-stats-app.onrender.com";

function App() {
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
    <div className="app">
      <header className="header">
        <h1>osu! stats</h1>
        <p className="subtitle">プレイヤー統計を検索</p>
      </header>

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
              <span className="score-rank">{score.rank}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
