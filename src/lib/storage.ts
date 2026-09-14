import { emptyStats, grades } from "./scoring";
import type { Stats } from "./types";
export function readStats(): Stats {
  try {
    const s = JSON.parse(localStorage.getItem("yes-chef:stats:v1") || "null");
    if (
      s &&
      Number.isInteger(s.count) &&
      s.count >= 0 &&
      (s.best === null || grades.includes(s.best))
    )
      return { ...emptyStats, ...s };
  } catch {}
  return emptyStats;
}
export function saveStats(stats: Stats) {
  try {
    localStorage.setItem("yes-chef:stats:v1", JSON.stringify(stats));
  } catch {
    /* Storage is optional: private mode still cooks. */
  }
}
