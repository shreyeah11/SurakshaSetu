const LS_KEY = "suraksha_game_scores";

/**
 * Merge game stats into localStorage and sync to API when logged in.
 * Uses flat keys: quizBest, quizLast, quizTotalQs, quizAt, compareBest, compareAnswered, hunterBest
 */
export function recordGameScore(partial) {
  let s = {};
  try {
    s = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    s = {};
  }
  const next = { ...s, ...partial };
  if (partial.quizBest != null) next.quizBest = Math.max(s.quizBest || 0, partial.quizBest);
  if (partial.compareBest != null) next.compareBest = Math.max(s.compareBest || 0, partial.compareBest);
  if (partial.compareAnswered != null) next.compareAnswered = Math.max(s.compareAnswered || 0, partial.compareAnswered);
  if (partial.hunterBest != null) next.hunterBest = Math.max(s.hunterBest || 0, partial.hunterBest);
  localStorage.setItem(LS_KEY, JSON.stringify(next));
  const tok = localStorage.getItem("gp_token");
  if (tok) {
    fetch("/api/user/scores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
      body: JSON.stringify({ scores: next }),
    }).catch(() => {});
  }
}

export function getLocalGameScores() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}
