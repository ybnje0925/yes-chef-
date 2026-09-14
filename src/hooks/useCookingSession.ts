"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { recipes } from "@/data/recipes";
import { elapsedSeconds, newClock, togglePause } from "@/lib/timer";
import {
  brutalScoldMessages,
  idleMessages,
  lateScoldMessages,
  randomMessage,
} from "@/lib/chef";
import type { Recipe, Session } from "@/lib/types";

const chefStepLine = (instruction: string, direction: string) =>
  `${instruction} ${direction}`;

export function useCookingSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState("");
  const [earlyDialog, setEarlyDialog] = useState(false);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const lastAction = useRef(0);
  const recipe = recipes.find((r) => r.id === session?.recipeId);
  const original = recipe?.steps[session?.index ?? 0];
  const step =
    original && session
      ? {
          ...original,
          ...(session.recipeId === "aglio" && original.id === "pasta"
            ? {
                recommendedDuration: session.pastaSeconds,
                minimumDuration: Math.max(0, session.pastaSeconds - 60),
                maximumDuration: session.pastaSeconds + 60,
              }
            : {}),
          ...(session.demo
            ? {
                minimumDuration: original.timerRequired ? 6 : 2,
                recommendedDuration: original.timerRequired ? 10 : 3,
                maximumDuration: original.maximumDuration ? 18 : 0,
              }
            : {}),
        }
      : undefined;
  const elapsed = session ? elapsedSeconds(session.clock, now) : 0;
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("pageshow", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("pageshow", tick);
    };
  }, []);
  useEffect(() => {
    if (
      !session ||
      session.finishedAt ||
      !step ||
      session.clock.pausedAt !== null
    )
      return;
    if (
      step.maximumDuration > 0 &&
      elapsed > step.maximumDuration &&
      !session.lateWarned
    ) {
      setMessage(randomMessage([...step.lateWarningMessages, ...lateScoldMessages]));
      setSession((s) =>
        s
          ? {
              ...s,
              lateWarned: true,
              timerNotified: true,
              counters: {
                ...s.counters,
                late: s.counters.late + 1,
                scolded: s.counters.scolded + 1,
              },
            }
          : s,
      );
      navigator.vibrate?.([120, 80, 120]);
    } else if (
      step.timerRequired &&
      elapsed >= step.recommendedDuration &&
      !session.timerNotified
    ) {
      setMessage("시간 됐다. 상태 확인하고 다음 단계로!");
      setSession((s) => (s ? { ...s, timerNotified: true } : s));
      navigator.vibrate?.([200, 100, 200]);
    }
  }, [elapsed, session, step]);
  useEffect(() => {
    if (!session || session.finishedAt) return;
    const id = setInterval(() => {
      if (
        sessionRef.current?.clock.pausedAt === null &&
        !sessionRef.current.lateWarned &&
        !sessionRef.current.timerNotified &&
        !sessionRef.current.warned
      )
        setMessage(randomMessage(idleMessages));
    }, 45000);
    return () => clearInterval(id);
  }, [session?.id, session?.index, session?.finishedAt]);
  function start(recipe: Recipe, demo = false, pastaSeconds = 480) {
    const now = Date.now();
    lastAction.current = 0;
    setNow(now);
    setEarlyDialog(false);
    setSession({
      id: crypto.randomUUID(),
      recipeId: recipe.id,
      index: 0,
      startedAt: now,
      clock: newClock(now),
      counters: { disobedience: 0, early: 0, late: 0, scolded: 0 },
      warned: false,
      lateWarned: false,
      timerNotified: false,
      finishedAt: null,
      demo,
      pastaSeconds,
    });
    // 화면의 지시문을 셰프 대사 첫머리에 넣어, 매 스텝을 음성만으로도
    // 이해할 수 있게 한다.
    setMessage(
      chefStepLine(
        recipe.steps[0].instruction,
        recipe.steps[0].chefStartMessage,
      ),
    );
  }
  function next(force = false) {
    const s = sessionRef.current;
    if (
      !s ||
      !step ||
      !recipe ||
      s.finishedAt ||
      s.clock.pausedAt !== null ||
      earlyDialog
    )
      return;
    const now = Date.now();
    if (now - lastAction.current < 500) return;
    lastAction.current = now;
    const actual = elapsedSeconds(s.clock, now);
    if (actual < step.minimumDuration && !(force && s.warned)) {
      setSession({
        ...s,
        warned: true,
        counters: {
          ...s.counters,
          early: s.counters.early + 1,
          scolded: s.counters.scolded + 1,
        },
      });
      // “어딜 가” 모달은 언제나 강한 제지 멘트가 먼저 나오고,
      // 그 뒤에 현재 조리 단계에 맞는 구체적인 지적을 붙인다.
      setMessage(
        `${randomMessage(brutalScoldMessages)} ${randomMessage(step.earlyWarningMessages)}`,
      );
      setEarlyDialog(true);
      navigator.vibrate?.(80);
      return;
    }
    const late =
      step.maximumDuration > 0 &&
      actual > step.maximumDuration &&
      !s.lateWarned;
    const counters = {
      ...s.counters,
      disobedience:
        s.counters.disobedience +
        (force && actual < step.minimumDuration ? 1 : 0),
      late: s.counters.late + (late ? 1 : 0),
      scolded: s.counters.scolded + (late ? 1 : 0),
    };
    if (s.index === recipe.steps.length - 1) {
      setSession({ ...s, counters, finishedAt: now });
      return;
    }
    setSession({
      ...s,
      index: s.index + 1,
      clock: newClock(now),
      counters,
      warned: false,
      lateWarned: false,
      timerNotified: false,
    });
    setNow(now);
    const nextStep = recipe.steps[s.index + 1];
    setMessage(
      `${randomMessage(step.successMessages)} ${chefStepLine(nextStep.instruction, nextStep.chefStartMessage)}`,
    );
  }
  const pause = useCallback(() => {
    const now = Date.now();
    setSession((s) => (s ? { ...s, clock: togglePause(s.clock, now) } : s));
    setNow(now);
  }, []);
  return {
    session,
    recipe,
    step,
    elapsed,
    now,
    message,
    earlyDialog,
    start,
    next,
    pause,
    apologize: () => {
      setEarlyDialog(false);
      setMessage("좋아. 하던 것부터 마저 해.");
    },
    reset: () => {
      setSession(null);
      setEarlyDialog(false);
    },
    setMessage,
  };
}
