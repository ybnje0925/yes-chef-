import type { ClockState } from "./types";
export const newClock = (now: number): ClockState => ({
  startedAt: now,
  pausedAt: null,
  pausedMs: 0,
});
export function elapsedSeconds(clock: ClockState, now: number) {
  return Math.max(
    0,
    ((clock.pausedAt ?? now) - clock.startedAt - clock.pausedMs) / 1000,
  );
}
export function togglePause(clock: ClockState, now: number): ClockState {
  return clock.pausedAt === null
    ? { ...clock, pausedAt: now }
    : {
        ...clock,
        pausedMs: clock.pausedMs + now - clock.pausedAt,
        pausedAt: null,
      };
}
export function formatTime(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}
