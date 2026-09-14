import type { Counters, Grade, Stats, Session } from "./types";
export const grades: Grade[] = ["S", "A", "B", "C", "D", "F"];
export function evaluate(c: Counters) {
  const score = Math.max(
    0,
    100 - c.disobedience * 15 - c.early * 3 - c.late * 8,
  );
  const grade: Grade =
    score >= 95
      ? "S"
      : score >= 85
        ? "A"
        : score >= 70
          ? "B"
          : score >= 55
            ? "C"
            : score >= 40
              ? "D"
              : "F";
  return {
    score,
    grade,
    message: {
      S: "오늘은 인정한다. 내일도 이 정도만 해.",
      A: "오, 생각보다 안 망쳤네? 앞치마는 계속 입어.",
      B: "몇 번 사고 칠 뻔했지만, 끝까지 해냈네.",
      C: "요리보다 내 인내심이 더 익었다.",
      D: "내 주방이었다면 설거지부터 다시다.",
      F: "자유로운 영혼이네. 레시피는 읽긴 했냐?",
    }[grade],
  };
}
export const emptyStats: Stats = {
  count: 0,
  best: null,
  recent: null,
  lastSessionId: null,
};
export function recordResult(stats: Stats, session: Session): Stats {
  if (session.demo || stats.lastSessionId === session.id) return stats;
  const grade = evaluate(session.counters).grade;
  return {
    count: stats.count + 1,
    best:
      !stats.best || grades.indexOf(grade) < grades.indexOf(stats.best)
        ? grade
        : stats.best,
    recent: session.recipeId,
    lastSessionId: session.id,
  };
}
