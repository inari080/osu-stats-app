// 日本語 / 英語の翻訳辞書
// 使い方: t("key") で現在の言語の文字列を取得する(LanguageContext経由)

export const translations = {
    ja: {
        appTitle: "osu! stats",
        appSubtitle: "プレイヤー統計・ビートマップを検索",

        tabPlayer: "プレイヤー検索",
        tabBeatmap: "ビートマップ検索",
        tabCompare: "プレイヤー比較",

        searchPlaceholderUsername: "osu! ユーザー名",
        searchButton: "検索",
        searchingButton: "検索中...",

        errorUserNotFound: "ユーザーが見つかりませんでした",
        errorFetchFailed: "取得に失敗しました",
        errorFetchFailedShort: "取得できませんでした",
        errorBeatmapSearchFailed: "検索に失敗しました",
        errorNeedTwoUsernames: "2人以上のユーザー名を入力してください",

        subStatsHeading: "サブステータス",
        ppTrendHeading: "pp推移(トッププレイ)",
        activityTimeHeading: "活動時間帯",
        comboMissHeading: "ミス数・コンボ",
        bpmHeading: "BPM傾向",
        topPlaysHeading: "Top Plays",

        statLevel: "Level",
        statPlayTime: "総プレイ時間",
        statPlayTimeSuffix: "時間",
        statRankedScore: "Ranked Score",
        statCountryRank: "Country Rank",
        statReplaysWatched: "リプレイ視聴数",

        chartEmpty: "グラフを表示するにはトッププレイのデータが足りません。",
        chartCountAxis: "件数",
        activityUtcNote: "※ 達成時刻はUTC(協定世界時)基準です",

        avgMaxCombo: "平均Max Combo",
        avgMissCount: "平均ミス数(トッププレイ内)",
        avgMissCountShort: "平均ミス数",
        avgMissSuffix: "回",
        avgBpm: "平均BPM",

        commonBeatmapsNotFound: "共通のトッププレイ譜面が見つかりませんでした。",
        beatmapColumn: "譜面",

        comparePlayerPlaceholder: (idx) => `プレイヤー${idx}のユーザー名`,
        compareRemoveLabel: "削除",
        compareAddPlayer: "+ プレイヤーを追加",
        compareButton: "比較する",
        comparingButton: "比較中...",

        compareBasicStats: "基本ステータス比較",
        compareSubStats: "サブステータス比較",
        comparePpTrend: "pp推移の比較",
        compareDifficulty: "難易度分布の比較",
        compareActivityTime: "活動時間帯の比較",
        compareComboMiss: "ミス数・コンボ比較",
        compareBpm: "BPM傾向比較",
        compareBeatmaps: "ビートマップ比較(共通のトッププレイ譜面)",
        compareTopPlays: "トッププレイの比較",

        beatmapSearchPlaceholder: "曲名・アーティスト名で検索",
        modeAll: "全モード",
        starLowerBound: "★下限",
        starUpperBound: "★上限",
        starRangeSeparator: "〜",

        statusRanked: "Ranked",
        statusQualified: "Qualified",
        statusLoved: "Loved",
        statusFavourites: "お気に入り",
        statusPending: "Pending",
        statusWip: "WIP",
        statusGraveyard: "Graveyard",
        statusAny: "すべて",

        sortDefault: "関連度(デフォルト)",
        sortRankedDesc: "Ranked日: 新しい順",
        sortRankedAsc: "Ranked日: 古い順",
        sortPlaysDesc: "プレイ数: 多い順",
        sortPlaysAsc: "プレイ数: 少ない順",
        sortDifficultyDesc: "難易度: 高い順",
        sortDifficultyAsc: "難易度: 低い順",
        sortRatingDesc: "評価: 高い順",
        sortFavouritesDesc: "お気に入り: 多い順",
        sortTitleAsc: "タイトル: A-Z",
        sortArtistAsc: "アーティスト: A-Z",

        genreNone: "ジャンル: 指定なし",
        languageNone: "言語: 指定なし",

        mappedBy: "mapped by",

        topPlayersHeading: "トッププレイヤー",
        newRankedMapsHeading: "新しくRankedされたビートマップ",
        loadingText: "読み込み中...",
        errorRankingsFailed: "ランキングの取得に失敗しました",
    },

    en: {
        appTitle: "osu! stats",
        appSubtitle: "Search player stats and beatmaps",

        tabPlayer: "Player Search",
        tabBeatmap: "Beatmap Search",
        tabCompare: "Compare Players",

        searchPlaceholderUsername: "osu! username",
        searchButton: "Search",
        searchingButton: "Searching...",

        errorUserNotFound: "User not found",
        errorFetchFailed: "Failed to fetch data",
        errorFetchFailedShort: "Failed to load",
        errorBeatmapSearchFailed: "Search failed",
        errorNeedTwoUsernames: "Please enter at least 2 usernames",

        subStatsHeading: "Additional Stats",
        ppTrendHeading: "PP Trend (Top Plays)",
        activityTimeHeading: "Activity Hours",
        comboMissHeading: "Combo & Misses",
        bpmHeading: "BPM Trend",
        topPlaysHeading: "Top Plays",

        statLevel: "Level",
        statPlayTime: "Total Play Time",
        statPlayTimeSuffix: "h",
        statRankedScore: "Ranked Score",
        statCountryRank: "Country Rank",
        statReplaysWatched: "Replays Watched",

        chartEmpty: "Not enough top play data to show a chart.",
        chartCountAxis: "Count",
        activityUtcNote: "* Times are based on UTC",

        avgMaxCombo: "Avg. Max Combo",
        avgMissCount: "Avg. Misses (in top plays)",
        avgMissCountShort: "Avg. Misses",
        avgMissSuffix: "",
        avgBpm: "Avg. BPM",

        commonBeatmapsNotFound: "No shared top-play beatmaps found.",
        beatmapColumn: "Beatmap",

        comparePlayerPlaceholder: (idx) => `Player ${idx} username`,
        compareRemoveLabel: "Remove",
        compareAddPlayer: "+ Add Player",
        compareButton: "Compare",
        comparingButton: "Comparing...",

        compareBasicStats: "Basic Stats Comparison",
        compareSubStats: "Additional Stats Comparison",
        comparePpTrend: "PP Trend Comparison",
        compareDifficulty: "Difficulty Distribution Comparison",
        compareActivityTime: "Activity Hours Comparison",
        compareComboMiss: "Combo & Miss Comparison",
        compareBpm: "BPM Trend Comparison",
        compareBeatmaps: "Beatmap Comparison (shared top plays)",
        compareTopPlays: "Top Play Comparison",

        beatmapSearchPlaceholder: "Search by title or artist",
        modeAll: "All modes",
        starLowerBound: "Min ★",
        starUpperBound: "Max ★",
        starRangeSeparator: "-",

        statusRanked: "Ranked",
        statusQualified: "Qualified",
        statusLoved: "Loved",
        statusFavourites: "Favourites",
        statusPending: "Pending",
        statusWip: "WIP",
        statusGraveyard: "Graveyard",
        statusAny: "All",

        sortDefault: "Relevance (default)",
        sortRankedDesc: "Ranked date: newest",
        sortRankedAsc: "Ranked date: oldest",
        sortPlaysDesc: "Play count: high to low",
        sortPlaysAsc: "Play count: low to high",
        sortDifficultyDesc: "Difficulty: high to low",
        sortDifficultyAsc: "Difficulty: low to high",
        sortRatingDesc: "Rating: high to low",
        sortFavouritesDesc: "Favourites: high to low",
        sortTitleAsc: "Title: A-Z",
        sortArtistAsc: "Artist: A-Z",

        genreNone: "Genre: any",
        languageNone: "Language: any",

        mappedBy: "mapped by",

        topPlayersHeading: "Top Players",
        newRankedMapsHeading: "Newly Ranked Beatmaps",
        loadingText: "Loading...",
        errorRankingsFailed: "Failed to load rankings",
    },
};

export function translate(lang, key, ...args) {
    const dict = translations[lang] || translations.ja;
    const value = dict[key] ?? translations.ja[key] ?? key;
    return typeof value === "function" ? value(...args) : value;
}