import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

// トッププレイの pp を達成日順に並べて折れ線グラフ用データに変換
function buildPpTrendData(scores) {
  return scores
      .filter((s) => typeof s.pp === "number" && s.created_at)
      .map((s) => ({
        date: s.created_at,
        pp: Math.round(s.pp * 100) / 100,
        title: s.beatmapset?.title ?? "Unknown",
        version: s.beatmap?.version ?? "",
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function PpTrendChart({ scores }) {
  const data = buildPpTrendData(scores);

  if (data.length < 2) {
    return (
        <p className="chart-empty">
          グラフを表示するにはトッププレイのデータが足りません。
        </p>
    );
  }

  return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#777" }}
                minTickGap={30}
            />
            <YAxis
                tick={{ fontSize: 11, fill: "#777" }}
                width={40}
                label={{ value: "pp", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip
                formatter={(value) => [`${value}pp`, "pp"]}
                labelFormatter={formatDate}
                contentStyle={{ fontSize: "0.85rem" }}
            />
            <Line
                type="monotone"
                dataKey="pp"
                stroke="#ff66ab"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
}

// 比較機能で使う配色パレット(プレイヤーごとに1色ずつ割り当てる)
const COMPARE_COLORS = [
  "#ff66ab",
  "#6bb3ff",
  "#7cd657",
  "#ffcc22",
  "#b98aff",
  "#ff8f40",
  "#40c4c4",
  "#e05285",
];

// 複数プレイヤーのトッププレイを日付順に結合し、
// 各行に「その日付に達成したプレイヤーのppだけ」を入れたデータを作る。
// (recharts の connectNulls で、データが無い箇所を飛ばして線をつなげる)
function buildCombinedPpTrendData(playerResults) {
  const rows = [];

  playerResults.forEach(({ username, scores }) => {
    (scores ?? [])
        .filter((s) => typeof s.pp === "number" && s.created_at)
        .forEach((s) => {
          rows.push({
            date: s.created_at,
            [username]: Math.round(s.pp * 100) / 100,
          });
        });
  });

  return rows.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function CombinedPpTrendChart({ playerResults }) {
  const validResults = playerResults.filter((r) => !r.error && r.scores?.length);
  const data = buildCombinedPpTrendData(validResults);

  if (data.length < 2) {
    return (
        <p className="chart-empty">
          グラフを表示するにはトッププレイのデータが足りません。
        </p>
    );
  }

  return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#777" }}
                minTickGap={30}
            />
            <YAxis
                tick={{ fontSize: 11, fill: "#777" }}
                width={40}
                label={{ value: "pp", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip
                formatter={(value) => [`${value}pp`, ""]}
                labelFormatter={formatDate}
                contentStyle={{ fontSize: "0.85rem" }}
            />
            <Legend wrapperStyle={{ fontSize: "0.85rem" }} />
            {validResults.map(({ username }, idx) => (
                <Line
                    key={username}
                    type="monotone"
                    dataKey={username}
                    stroke={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
}

// 基本ステータスの並列表示用テーブル
const BASIC_STAT_ROWS = [
  { key: "global_rank", label: "Rank", value: (s) => (s?.global_rank ? `#${s.global_rank}` : "N/A") },
  { key: "pp", label: "PP", value: (s) => (s?.pp != null ? s.pp.toFixed(2) : "N/A") },
  {
    key: "hit_accuracy",
    label: "Accuracy",
    value: (s) => (s?.hit_accuracy != null ? `${s.hit_accuracy.toFixed(2)}%` : "N/A"),
  },
  { key: "play_count", label: "Play Count", value: (s) => s?.play_count ?? "N/A" },
];

// サブステータスの並列表示用テーブル(レベル・総プレイ時間・Ranked Score等)
const SUB_STAT_ROWS = [
  {
    key: "level",
    label: "Level",
    value: (s) =>
        s?.level?.current != null ? `${s.level.current} (${s.level.progress ?? 0}%)` : "N/A",
  },
  {
    key: "play_time",
    label: "総プレイ時間",
    value: (s) => (s?.play_time != null ? `${Math.round(s.play_time / 3600)}時間` : "N/A"),
  },
  {
    key: "ranked_score",
    label: "Ranked Score",
    value: (s) => (s?.ranked_score != null ? s.ranked_score.toLocaleString() : "N/A"),
  },
  {
    key: "country_rank",
    label: "Country Rank",
    value: (s) => (s?.country_rank ? `#${s.country_rank}` : "N/A"),
  },
  {
    key: "replays_watched",
    label: "リプレイ視聴数",
    value: (s) =>
        s?.replays_watched_by_others != null
            ? s.replays_watched_by_others.toLocaleString()
            : "N/A",
  },
];

function CompareStatsTable({ playerResults, rows = BASIC_STAT_ROWS }) {
  return (
      <div className="compare-stats-table-wrapper">
        <table className="compare-stats-table">
          <thead>
          <tr>
            <th></th>
            {playerResults.map(({ username }, idx) => (
                <th key={username}>
                  <span
                      className="compare-color-dot"
                      style={{ background: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}
                  />
                  {username}
                </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {rows.map((row) => (
              <tr key={row.key}>
                <td className="compare-stat-label">{row.label}</td>
                {playerResults.map(({ username, user, error }) => (
                    <td key={username}>{error ? "-" : row.value(user?.statistics)}</td>
                ))}
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
}

// トッププレイの比較(各プレイヤーのTop5を並べて表示)
function CompareTopPlays({ playerResults }) {
  return (
      <div className="compare-topplays-grid">
        {playerResults.map(({ username, scores, error }, idx) => (
            <div key={username} className="compare-topplays-column">
              <h4>
                <span
                    className="compare-color-dot"
                    style={{ background: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}
                />
                {username}
              </h4>
              {error ? (
                  <p className="chart-empty">取得できませんでした</p>
              ) : (
                  (scores ?? []).slice(0, 5).map((score) => (
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
                  ))
              )}
            </div>
        ))}
      </div>
  );
}

// 難易度(スターレート)帯ごとにトッププレイ数を集計する
const STAR_BUCKETS = [
  { key: "0-2", label: "〜2★", min: 0, max: 2 },
  { key: "2-3", label: "2〜3★", min: 2, max: 3 },
  { key: "3-4", label: "3〜4★", min: 3, max: 4 },
  { key: "4-5", label: "4〜5★", min: 4, max: 5 },
  { key: "5-6", label: "5〜6★", min: 5, max: 6 },
  { key: "6-7", label: "6〜7★", min: 6, max: 7 },
  { key: "7+", label: "7★〜", min: 7, max: Infinity },
];

function buildDifficultyDistribution(playerResults) {
  return STAR_BUCKETS.map((bucket) => {
    const row = { bucket: bucket.label };
    playerResults.forEach(({ username, scores, error }) => {
      if (error) return;
      row[username] = (scores ?? []).filter((s) => {
        const star = s.beatmap?.difficulty_rating;
        return typeof star === "number" && star >= bucket.min && star < bucket.max;
      }).length;
    });
    return row;
  });
}

function DifficultyDistributionChart({ playerResults }) {
  const validResults = playerResults.filter((r) => !r.error && r.scores?.length);
  const data = buildDifficultyDistribution(validResults);
  const hasAnyData = data.some((row) =>
      validResults.some(({ username }) => (row[username] ?? 0) > 0)
  );

  if (!hasAnyData) {
    return (
        <p className="chart-empty">
          グラフを表示するにはトッププレイのデータが足りません。
        </p>
    );
  }

  return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#777" }} />
            <YAxis
                tick={{ fontSize: 11, fill: "#777" }}
                width={32}
                allowDecimals={false}
                label={{ value: "件数", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip contentStyle={{ fontSize: "0.85rem" }} />
            <Legend wrapperStyle={{ fontSize: "0.85rem" }} />
            {validResults.map(({ username }, idx) => (
                <Bar
                    key={username}
                    dataKey={username}
                    fill={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
  );
}

// 2人以上のプレイヤーが両方トッププレイに持っている譜面(共通ビートマップ)を集計する
function buildCommonBeatmaps(playerResults) {
  const validResults = playerResults.filter((r) => !r.error);
  const byBeatmap = new Map();

  validResults.forEach(({ username, scores }) => {
    (scores ?? []).forEach((s) => {
      const beatmapId = s.beatmap?.id;
      if (!beatmapId) return;

      if (!byBeatmap.has(beatmapId)) {
        byBeatmap.set(beatmapId, {
          title: s.beatmapset?.title ?? "Unknown",
          version: s.beatmap?.version ?? "",
          star: s.beatmap?.difficulty_rating,
          entries: {},
        });
      }
      byBeatmap.get(beatmapId).entries[username] = {
        pp: s.pp,
        accuracy: s.accuracy,
        rank: s.rank,
      };
    });
  });

  return Array.from(byBeatmap.values())
      .filter((entry) => Object.keys(entry.entries).length >= 2)
      .sort((a, b) => {
        const countDiff = Object.keys(b.entries).length - Object.keys(a.entries).length;
        if (countDiff !== 0) return countDiff;
        const maxA = Math.max(...Object.values(a.entries).map((e) => e.pp ?? 0));
        const maxB = Math.max(...Object.values(b.entries).map((e) => e.pp ?? 0));
        return maxB - maxA;
      });
}

function CommonBeatmapsTable({ playerResults }) {
  const validResults = playerResults.filter((r) => !r.error);
  const commonBeatmaps = buildCommonBeatmaps(playerResults);

  if (commonBeatmaps.length === 0) {
    return (
        <p className="chart-empty">
          共通のトッププレイ譜面が見つかりませんでした。
        </p>
    );
  }

  return (
      <div className="compare-stats-table-wrapper">
        <table className="compare-stats-table compare-beatmaps-table">
          <thead>
          <tr>
            <th className="compare-beatmap-col">譜面</th>
            {validResults.map(({ username }, idx) => (
                <th key={username}>
                  <span
                      className="compare-color-dot"
                      style={{ background: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}
                  />
                  {username}
                </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {commonBeatmaps.map((beatmap, rowIdx) => {
            const bestPp = Math.max(
                ...Object.values(beatmap.entries).map((e) => e.pp ?? 0)
            );
            return (
                <tr key={rowIdx}>
                  <td className="compare-beatmap-col compare-stat-label">
                    {beatmap.title} - {beatmap.version}
                    {typeof beatmap.star === "number" && (
                        <span className="compare-beatmap-star">
                    {beatmap.star.toFixed(1)}★
                  </span>
                    )}
                  </td>
                  {validResults.map(({ username }) => {
                    const entry = beatmap.entries[username];
                    if (!entry) return <td key={username}>-</td>;
                    const isBest = entry.pp === bestPp;
                    return (
                        <td key={username} className={isBest ? "compare-best-cell" : ""}>
                          {entry.pp?.toFixed(2) ?? "-"}pp
                          {typeof entry.accuracy === "number" && (
                              <span className="compare-beatmap-acc">
                        {(entry.accuracy * 100).toFixed(2)}%
                      </span>
                          )}
                        </td>
                    );
                  })}
                </tr>
            );
          })}
          </tbody>
        </table>
      </div>
  );
}

// トッププレイが達成された時間帯(UTC)を4時間区切りで集計する
const TIME_BUCKETS = [
  { label: "0-4時", min: 0, max: 4 },
  { label: "4-8時", min: 4, max: 8 },
  { label: "8-12時", min: 8, max: 12 },
  { label: "12-16時", min: 12, max: 16 },
  { label: "16-20時", min: 16, max: 20 },
  { label: "20-24時", min: 20, max: 24 },
];

function buildActivityTimeDistribution(playerResults) {
  return TIME_BUCKETS.map((bucket) => {
    const row = { bucket: bucket.label };
    playerResults.forEach(({ username, scores, error }) => {
      if (error) return;
      row[username] = (scores ?? []).filter((s) => {
        if (!s.created_at) return false;
        const hour = new Date(s.created_at).getUTCHours();
        return hour >= bucket.min && hour < bucket.max;
      }).length;
    });
    return row;
  });
}

function ActivityTimeChart({ playerResults }) {
  const validResults = playerResults.filter((r) => !r.error && r.scores?.length);
  const data = buildActivityTimeDistribution(validResults);
  const hasAnyData = data.some((row) =>
      validResults.some(({ username }) => (row[username] ?? 0) > 0)
  );

  if (!hasAnyData) {
    return (
        <p className="chart-empty">
          グラフを表示するにはトッププレイのデータが足りません。
        </p>
    );
  }

  return (
      <div className="chart-wrapper">
        <p className="chart-note">※ 達成時刻はUTC(協定世界時)基準です</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#777" }} />
            <YAxis
                tick={{ fontSize: 11, fill: "#777" }}
                width={32}
                allowDecimals={false}
                label={{ value: "件数", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip contentStyle={{ fontSize: "0.85rem" }} />
            <Legend wrapperStyle={{ fontSize: "0.85rem" }} />
            {validResults.map(({ username }, idx) => (
                <Bar
                    key={username}
                    dataKey={username}
                    fill={COMPARE_COLORS[idx % COMPARE_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
  );
}

// プレイヤーごとの単一数値指標(平均max_combo、平均ミス数、平均BPMなど)を集計する
function buildAveragePlayerMetric(playerResults, getValue) {
  return playerResults
      .filter((r) => !r.error)
      .map(({ username, scores }) => {
        const values = (scores ?? [])
            .map(getValue)
            .filter((v) => typeof v === "number" && !Number.isNaN(v));
        const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        return { username, value: Math.round(avg * 100) / 100 };
      });
}

function SimplePlayerBarChart({ data, tooltipLabel, valueSuffix = "" }) {
  const hasAnyData = data.some((row) => row.value > 0);

  if (!hasAnyData) {
    return (
        <p className="chart-empty">
          グラフを表示するにはトッププレイのデータが足りません。
        </p>
    );
  }

  return (
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="username" tick={{ fontSize: 11, fill: "#777" }} />
            <YAxis tick={{ fontSize: 11, fill: "#777" }} width={40} />
            <Tooltip
                formatter={(value) => [`${value}${valueSuffix}`, tooltipLabel]}
                contentStyle={{ fontSize: "0.85rem" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, idx) => (
                  <Cell key={entry.username} fill={COMPARE_COLORS[idx % COMPARE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
  );
}

// ミス数・コンボ比較(平均max_combo、平均ミス数)
function ComboMissCompare({ playerResults }) {
  const comboData = buildAveragePlayerMetric(playerResults, (s) =>
      typeof s.max_combo === "number" ? s.max_combo : null
  );
  const missData = buildAveragePlayerMetric(
      playerResults,
      (s) => s.statistics?.count_miss ?? s.count_miss ?? 0
  );

  return (
      <div className="compare-dual-chart">
        <div>
          <h4 className="compare-subheading">平均Max Combo</h4>
          <SimplePlayerBarChart data={comboData} tooltipLabel="平均Max Combo" valueSuffix="x" />
        </div>
        <div>
          <h4 className="compare-subheading">平均ミス数(トッププレイ内)</h4>
          <SimplePlayerBarChart data={missData} tooltipLabel="平均ミス数" valueSuffix="回" />
        </div>
      </div>
  );
}

// BPM傾向比較(トッププレイの平均BPM)
function BpmCompare({ playerResults }) {
  const bpmData = buildAveragePlayerMetric(playerResults, (s) =>
      typeof s.beatmap?.bpm === "number" ? s.beatmap.bpm : null
  );

  return <SimplePlayerBarChart data={bpmData} tooltipLabel="平均BPM" valueSuffix=" BPM" />;
}

function PlayerCompare() {
  const [usernames, setUsernames] = useState(["", "", ""]);
  const [mode, setMode] = useState("osu");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUsername = (idx, value) => {
    setUsernames((prev) => prev.map((u, i) => (i === idx ? value : u)));
  };

  const addPlayer = () => {
    if (usernames.length >= 8) return;
    setUsernames((prev) => [...prev, ""]);
  };

  const removePlayer = (idx) => {
    if (usernames.length <= 2) return;
    setUsernames((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCompare = async (e) => {
    e.preventDefault();
    const targets = usernames.map((u) => u.trim()).filter(Boolean);
    if (targets.length < 2) {
      setError("2人以上のユーザー名を入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    const fetched = await Promise.all(
        targets.map(async (username) => {
          try {
            const userRes = await fetch(
                `${API_BASE}/api/user/${encodeURIComponent(username)}?mode=${mode}`
            );
            if (!userRes.ok) {
              throw new Error(
                  userRes.status === 404
                      ? "ユーザーが見つかりません"
                      : "取得に失敗しました"
              );
            }
            const user = await userRes.json();

            const scoresRes = await fetch(
                `${API_BASE}/api/user/${encodeURIComponent(
                    username
                )}/scores/best?mode=${mode}&limit=100`
            );
            const scores = scoresRes.ok ? await scoresRes.json() : [];

            return { username, user, scores };
          } catch (err) {
            return { username, user: null, scores: [], error: err.message };
          }
        })
    );

    setResults(fetched);
    setLoading(false);
  };

  return (
      <>
        <form className="compare-form" onSubmit={handleCompare}>
          {usernames.map((username, idx) => (
              <div key={idx} className="compare-player-row">
                <span
                    className="compare-color-dot"
                    style={{ background: COMPARE_COLORS[idx % COMPARE_COLORS.length] }}
                />
                <input
                    type="text"
                    placeholder={`プレイヤー${idx + 1}のユーザー名`}
                    value={username}
                    onChange={(e) => updateUsername(idx, e.target.value)}
                />
                {usernames.length > 2 && (
                    <button
                        type="button"
                        className="compare-remove-btn"
                        onClick={() => removePlayer(idx)}
                        aria-label="削除"
                    >
                      ×
                    </button>
                )}
              </div>
          ))}

          <div className="compare-form-actions">
            <button
                type="button"
                className="compare-add-btn"
                onClick={addPlayer}
                disabled={usernames.length >= 8}
            >
              + プレイヤーを追加
            </button>

            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="osu">osu!</option>
              <option value="taiko">Taiko</option>
              <option value="fruits">Catch</option>
              <option value="mania">Mania</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "比較中..." : "比較する"}
            </button>
          </div>
        </form>

        {error && <p className="error">{error}</p>}

        {results.some((r) => r.error) && (
            <p className="error">
              {results
                  .filter((r) => r.error)
                  .map((r) => `${r.username}: ${r.error}`)
                  .join(" / ")}
            </p>
        )}

        {results.length > 0 && (
            <>
              <div className="chart-card">
                <h3>基本ステータス比較</h3>
                <CompareStatsTable playerResults={results} rows={BASIC_STAT_ROWS} />
              </div>

              <div className="chart-card">
                <h3>サブステータス比較</h3>
                <CompareStatsTable playerResults={results} rows={SUB_STAT_ROWS} />
              </div>

              <div className="chart-card">
                <h3>pp推移の比較</h3>
                <CombinedPpTrendChart playerResults={results} />
              </div>

              <div className="chart-card">
                <h3>難易度分布の比較</h3>
                <DifficultyDistributionChart playerResults={results} />
              </div>

              <div className="chart-card">
                <h3>活動時間帯の比較</h3>
                <ActivityTimeChart playerResults={results} />
              </div>

              <div className="chart-card">
                <h3>ミス数・コンボ比較</h3>
                <ComboMissCompare playerResults={results} />
              </div>

              <div className="chart-card">
                <h3>BPM傾向比較</h3>
                <BpmCompare playerResults={results} />
              </div>

              <div className="chart-card">
                <h3>ビートマップ比較(共通のトッププレイ譜面)</h3>
                <CommonBeatmapsTable playerResults={results} />
              </div>

              <div className="chart-card">
                <h3>トッププレイの比較</h3>
                <CompareTopPlays playerResults={results} />
              </div>
            </>
        )}
      </>
  );
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
          )}/scores/best?mode=${mode}&limit=100`
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

  const singlePlayerResult = user
      ? [{ username: user.username, user, scores, error: null }]
      : [];

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

        {user && (
            <div className="chart-card">
              <h3>サブステータス</h3>
              <CompareStatsTable playerResults={singlePlayerResult} rows={SUB_STAT_ROWS} />
            </div>
        )}

        {scores.length > 0 && (
            <div className="chart-card">
              <h3>pp推移(トッププレイ)</h3>
              <PpTrendChart scores={scores} />
            </div>
        )}

        {scores.length > 0 && (
            <div className="chart-card">
              <h3>活動時間帯</h3>
              <ActivityTimeChart playerResults={singlePlayerResult} />
            </div>
        )}

        {scores.length > 0 && (
            <div className="chart-card">
              <h3>ミス数・コンボ</h3>
              <ComboMissCompare playerResults={singlePlayerResult} />
            </div>
        )}

        {scores.length > 0 && (
            <div className="chart-card">
              <h3>BPM傾向</h3>
              <BpmCompare playerResults={singlePlayerResult} />
            </div>
        )}

        {scores.length > 0 && (
            <div className="scores-list">
              <h3>Top Plays</h3>
              {scores.slice(0, 5).map((score) => (
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
          <button
              className={`tab-button ${tab === "compare" ? "active" : ""}`}
              onClick={() => setTab("compare")}
          >
            プレイヤー比較
          </button>
        </div>

        {tab === "player" && <PlayerSearch />}
        {tab === "beatmap" && <BeatmapSearch />}
        {tab === "compare" && <PlayerCompare />}
      </div>
  );
}

export default App;