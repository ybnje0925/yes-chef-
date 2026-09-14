"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Flame,
  Clock3,
  ChefHat,
  Mic,
  Pause,
  Play,
  X,
  Check,
  Share2,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  UtensilsCrossed,
} from "lucide-react";
import ChefPortrait from "./ChefPortrait";
import FoodArt from "./FoodArt";
import Brand from "./Brand";
import VoiceButton from "./VoiceButton";
import { recipes } from "@/data/recipes";
import { useCookingSession } from "@/hooks/useCookingSession";
import Dialog from "./Dialog";
import { formatTime } from "@/lib/timer";
import { emptyStats, evaluate, recordResult } from "@/lib/scoring";
import { readStats, saveStats } from "@/lib/storage";
import type { Recipe, Stats } from "@/lib/types";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export default function Kitchen() {
  const cook = useCookingSession();
  const [screen, setScreen] = useState<
    "home" | "recipes" | "prep" | "cooking" | "result"
  >("home");
  const [selected, setSelected] = useState<Recipe>(recipes[0]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [checked, setChecked] = useState<string[]>([]);
  const [demo, setDemo] = useState(false),
    [pastaMinutes, setPastaMinutes] = useState(8);
  const [sound, setSound] = useState(false),
    [exitOpen, setExitOpen] = useState(false);
  const [notice, setNotice] = useState(""),
    [install, setInstall] = useState<InstallPrompt | null>(null);
  useEffect(() => {
    setStats(readStats());
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    const handler = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  useEffect(() => {
    if (!cook.session?.finishedAt) return;
    const updated = recordResult(readStats(), cook.session);
    saveStats(updated);
    setStats(updated);
    setScreen("result");
  }, [cook.session]);
  useEffect(() => {
    if (
      !sound ||
      screen !== "cooking" ||
      !cook.message ||
      !("speechSynthesis" in window)
    )
      return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(cook.message);
    u.lang = "ko-KR";
    u.rate = 1.07;
    window.speechSynthesis.speak(u);
    return () => window.speechSynthesis.cancel();
  }, [sound, screen, cook.message]);
  useEffect(() => {
    if (screen !== "cooking") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [screen]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(id);
  }, [notice]);
  function choose(recipe: Recipe) {
    setSelected(recipe);
    setChecked([]);
    setPastaMinutes(8);
    setScreen("prep");
  }
  function beginCooking() {
    if (checked.length !== selected.ingredients.length) {
      setNotice("재료를 모두 준비한 뒤 “예, 셰프”라고 말해.");
      return;
    }
    cook.start(selected, demo, pastaMinutes * 60);
    // 조리를 시작하면 셰프 음성 안내를 기본으로 켠다.
    setSound(true);
    setScreen("cooking");
  }
  async function addToHome() {
    if (install) {
      await install.prompt();
      await install.userChoice;
      setInstall(null);
    } else
      setNotice(
        "iPhone: Safari 공유 → 홈 화면에 추가. Android: 브라우저 메뉴 → 앱 설치 / 홈 화면에 추가.",
      );
  }
  async function share() {
    if (!cook.session) return;
    const result = evaluate(cook.session.counters);
    const text = `YES CHEF · ${cook.recipe?.name}\n오늘의 셰프 평가 ${result.grade} (${result.score}점)\n혼난 횟수 ${cook.session.counters.scolded}회\n“${result.message}”${cook.session.demo ? "\n빠른 체험 결과" : ""}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "예셰프 · 오늘의 성적표",
          text,
          url: window.location.origin,
        });
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
      }
    }
    setNotice(
      "스크린샷 찍어서 친구한테 자랑하세요. 성적표가 한 화면에 쏙 들어가요.",
    );
  }

  const result = cook.session ? evaluate(cook.session.counters) : null;
  return (
    <div className="site-shell">
      <header className="header">
        <button
          onClick={() =>
            screen === "cooking" ? setExitOpen(true) : setScreen("home")
          }
          aria-label="YES CHEF 홈"
        >
          <Brand />
        </button>
        <div className="header-right">
          <span className="live-dot" />
          <span>KITCHEN IS OPEN</span>
          <button
            className="install-button"
            onClick={addToHome}
            aria-label="홈 화면에 추가"
          >
            <Download size={16} />
            <span>앱 설치</span>
          </button>
        </div>
      </header>
      {screen === "home" && (
        <main className="home">
          <div className="hero-topline">
            <span>NO EXCUSES. JUST COOK.</span>
            <span>EST. 2026 / SEOUL</span>
          </div>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                <span /> 당신의 주방에, 까다로운 한 명.
              </div>
              <h1>
                YES
                <br />
                <span>CHEF</span>
                <em>!</em>
              </h1>
              <h2>
                오늘도 요리
                <br className="mobile-break" /> 망치러 왔나?
              </h2>
              <p className="hero-description">
                레시피는 내가 안다. 넌 따라와.
                <br />
                시작했으면, 끝까지 요리하는 거다.
              </p>
              <button
                className="primary hero-cta"
                onClick={() => setScreen("recipes")}
              >
                예, 셰프! <ArrowUpRight size={26} />
              </button>
              <span className="cta-note">
                회원가입 없이 입장. 변명도 없이 입장.
              </span>
            </div>
            <div className="hero-visual">
              <div className="visual-top">
                <span>HEAD CHEF / 001</span>
                <Flame size={22} />
              </div>
              <div className="chef-circle" />
              <div className="vertical-label">HEAT UP. SHOW UP.</div>
              <ChefPortrait />
              <div className="quote-sticker">
                <span>
                  “앞치마 매.
                  <br />
                  각오는 내가 시켜줄게.”
                </span>
                <ArrowUpRight size={23} />
              </div>
              <div className="visual-bottom">
                <span>STRICT IN THE KITCHEN.</span>
                <span>SOFT AT HEART. (MAYBE.)</span>
              </div>
            </div>
          </section>
          <div className="ticker">
            <span>불 켜.</span>
            <span className="asterisk">✳</span>
            <span>집중해.</span>
            <span className="asterisk">✳</span>
            <span>대답은 크게.</span>
            <span className="asterisk">✳</span>
            <span>예, 셰프!</span>
            <span className="asterisk">✳</span>
            <span className="ticker-extra">NO EXCUSES.</span>
          </div>
          <section className="how">
            <div className="section-title">
              <span className="eyebrow">THE KITCHEN RULES</span>
              <h2>간단하다. 시키는 대로 해.</h2>
            </div>
            <div className="rules">
              <article>
                <span>01 / PICK</span>
                <h3>오늘의 메뉴 선택</h3>
                <p>쉬운 요리라고 방심하지 마.</p>
              </article>
              <article>
                <span>02 / FOLLOW</span>
                <h3>셰프의 지시를 따라</h3>
                <p>너무 빨리 넘기면? 일단 혼난다.</p>
              </article>
              <article>
                <span>03 / SURVIVE</span>
                <h3>끝나면 성적표 한 장</h3>
                <p>자랑할지 숨길지는 네 실력에 달렸다.</p>
              </article>
            </div>
          </section>
          <div className="home-bottom">
            <span>
              <Flame size={17} /> 4개의 메뉴. 1명의 셰프. 변명은 0개.
            </span>
            <button
              className="text-button"
              onClick={() => {
                setDemo(true);
                setScreen("recipes");
              }}
            >
              먼저 빠르게 체험하기 <ArrowRight size={16} />
            </button>
          </div>
        </main>
      )}
      {screen === "recipes" && (
        <main className="inner recipes-page">
          <button className="back" onClick={() => setScreen("home")}>
            <ArrowLeft size={16} /> 주방 입구
          </button>
          <div className="page-heading">
            <div>
              <span className="eyebrow">CHOOSE YOUR BATTLE</span>
              <h1>오늘, 뭘 만들 건데?</h1>
              <p>일단 골라. 망치지 않는 건 내가 도와줄 테니까.</p>
            </div>
            <span className="outline-badge">4 MENUS / 1 CHEF</span>
          </div>
          <div className="recipe-grid">
            {recipes.map((r, i) => (
              <button
                className="recipe-card"
                key={r.id}
                onClick={() => choose(r)}
              >
                <div className="recipe-picture">
                  <span className="card-number">0{i + 1}</span>
                  <FoodArt kind={r.thumbnail} />
                  <span className="card-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
                <div className="recipe-info">
                  <span className="micro">{r.englishName}</span>
                  <h2>{r.name}</h2>
                  <div className="recipe-meta">
                    <span>
                      <Clock3 size={14} /> 약 {r.estimatedMinutes}분
                    </span>
                    <span aria-label={`난이도 5점 중 ${r.difficulty}점`}>
                      <b>{"★".repeat(r.difficulty)}</b>
                      {"☆".repeat(5 - r.difficulty)}
                    </span>
                  </div>
                  <p>“{r.chefIntro}”</p>
                </div>
              </button>
            ))}
          </div>
          <div className="mode-toggle">
            <div>
              <strong>빠른 체험 모드</strong>
              <p>
                타이머를 10초로 줄여서 분위기만 맛보기. 기록에는 남지 않아요.
              </p>
            </div>
            <button
              className={`switch ${demo ? "on" : ""}`}
              role="switch"
              aria-checked={demo}
              aria-label="빠른 체험 모드"
              onClick={() => setDemo(!demo)}
            >
              <span />
            </button>
          </div>
          <div className="stats-row">
            <div>
              <span>누적 요리</span>
              <strong>
                {stats.count}
                <small>회</small>
              </strong>
            </div>
            <div>
              <span>최고 등급</span>
              <strong>{stats.best || "—"}</strong>
            </div>
            <div>
              <span>최근 요리</span>
              <strong className="recent">
                {recipes.find((r) => r.id === stats.recent)?.name ||
                  "아직 신입"}
              </strong>
            </div>
          </div>
        </main>
      )}
      {screen === "prep" && (
        <main className="inner prep-page">
          <button className="back" onClick={() => setScreen("recipes")}>
            <ArrowLeft size={16} /> 메뉴 다시 고르기
          </button>
          <div className="prep-grid">
            <div className="prep-art">
              <FoodArt kind={selected.thumbnail} />
              <span className="eyebrow">TODAY'S MISSION</span>
              <h1>{selected.name}</h1>
              <p>“{selected.chefIntro}”</p>
              <div className="prep-meta">
                <span>
                  <Clock3 size={16} />
                  {selected.estimatedMinutes}분
                </span>
                <span>{selected.steps.length} STEPS</span>
                <span>1인분</span>
              </div>
            </div>
            <section className="prep-list">
              <span className="eyebrow">MISE EN PLACE</span>
              <h2>재료부터 챙겨.</h2>
              <p>다 꺼냈으면 체크해. 요리하다 냉장고 뛰어가지 말고.</p>
              <div className="ingredients">
                {selected.ingredients.map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={checked.includes(item)}
                      onChange={() =>
                        setChecked((a) =>
                          a.includes(item)
                            ? a.filter((v) => v !== item)
                            : [...a, item],
                        )
                      }
                    />
                    <span className="checkbox">
                      {checked.includes(item) && <Check size={16} />}
                    </span>
                    {item}
                  </label>
                ))}
              </div>
              {selected.id === "aglio" && (
                <label className="pasta-setting">
                  면 삶기 시간{" "}
                  <select
                    value={pastaMinutes}
                    onChange={(e) => setPastaMinutes(Number(e.target.value))}
                  >
                    {[5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <option key={n} value={n}>
                        {n}분
                      </option>
                    ))}
                  </select>
                  <small>
                    포장지 시간을 참고해 설정. 이후 팬에서 약 1분 더 익혀요.
                  </small>
                </label>
              )}
              <div className="prep-note">
                <ChefHat size={20} />
                <p>
                  {demo
                    ? "빠른 체험 중 · 실제 조리에는 사용하지 마세요."
                    : "시간은 가이드. 불 세기와 음식 상태를 먼저 확인해."}
                  <br />
                  <span>타이머 일시정지는 불을 끄지 않아요.</span>
                </p>
              </div>
              <button
                className="primary"
                disabled={checked.length !== selected.ingredients.length}
                onClick={beginCooking}
              >
                다 준비했습니다, 셰프! <ArrowRight size={20} />
              </button>
              <p className="button-note">
                {checked.length} / {selected.ingredients.length} 재료 준비 완료
              </p>
              <VoiceButton key={selected.id} onNext={beginCooking} />
            </section>
          </div>
        </main>
      )}
      {screen === "cooking" && cook.session && cook.recipe && cook.step && (
        <main className="cooking-page">
          <div className="cooking-top">
            <button className="text-button" onClick={() => setExitOpen(true)}>
              <X size={18} /> 그만두기
            </button>
            <span>
              {cook.recipe.name}
              {cook.session.demo ? " · 빠른 체험" : ""}
            </span>
            <button
              className={`icon-button ${sound ? "enabled" : ""}`}
              aria-label={sound ? "셰프 음성 끄기" : "셰프 음성 켜기"}
              onClick={() => setSound(!sound)}
            >
              {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
          <div className="progress-track">
            {cook.recipe.steps.map((s, i) => (
              <span
                key={s.id}
                className={i <= cook.session!.index ? "done" : ""}
              />
            ))}
          </div>
          <div className="step-label">
            <span>
              STEP {String(cook.session.index + 1).padStart(2, "0")}{" "}
              <i>/ {String(cook.recipe.steps.length).padStart(2, "0")}</i>
            </span>
            <span>
              {cook.session.clock.pausedAt !== null
                ? "PAUSED"
                : "SERVICE IN PROGRESS"}{" "}
              <span className="live-dot" />
            </span>
          </div>
          <section className="instruction">
            <span className="eyebrow">
              {cook.step.timerRequired
                ? "타이머는 내가 본다. 넌 요리에 집중해."
                : "잘 듣고, 움직여."}
            </span>
            <h1>{cook.step.instruction}</h1>
            <p>{cook.step.detail}</p>
          </section>
          {cook.step.timerRequired && (
            <section
              className={`timer ${cook.session.lateWarned ? "late" : ""}`}
              aria-label="조리 타이머"
            >
              <span>
                {cook.session.clock.pausedAt !== null
                  ? "일시정지 · 불 상태를 확인하세요"
                  : cook.elapsed >= cook.step.recommendedDuration
                    ? "시간 완료 · 음식 상태 확인"
                    : "남은 시간"}
              </span>
              <strong>
                {formatTime(cook.step.recommendedDuration - cook.elapsed)}
              </strong>
              <div className="timer-bottom">
                <span>
                  권장 {formatTime(cook.step.recommendedDuration)} / 최소{" "}
                  {formatTime(cook.step.minimumDuration)}
                </span>
                <button onClick={cook.pause}>
                  {cook.session.clock.pausedAt !== null ? (
                    <Play size={15} />
                  ) : (
                    <Pause size={15} />
                  )}{" "}
                  {cook.session.clock.pausedAt !== null
                    ? "다시 시작"
                    : "일시정지"}
                </button>
              </div>
            </section>
          )}
          <div
            className={`chef-message ${cook.session.lateWarned ? "warning" : ""}`}
            role="status"
          >
            <span className="chef-avatar">
              <ChefHat size={24} />
            </span>
            <div>
              <span>HEAD CHEF</span>
              <p>“{cook.message}”</p>
            </div>
          </div>
          <div className="cooking-actions">
            <button
              className="primary"
              disabled={cook.session.clock.pausedAt !== null}
              onClick={() => cook.next()}
            >
              {cook.session.index === cook.recipe.steps.length - 1
                ? "완성했습니다, 셰프!"
                : "예, 셰프!"}{" "}
              <ArrowRight size={22} />
            </button>
            {cook.session.warned &&
              !cook.earlyDialog &&
              cook.elapsed < cook.step.minimumDuration && (
                <button
                  className="skip text-button"
                  disabled={cook.session.clock.pausedAt !== null}
                  onClick={() => cook.next(true)}
                >
                  그래도 넘어가기 · 지시 불이행 +1
                </button>
              )}
            <VoiceButton
              key={cook.session.index}
              onNext={
                cook.earlyDialog ? cook.apologize : () => cook.next()
              }
            />
          </div>
        </main>
      )}
      {screen === "result" && cook.session && result && (
        <main className="result-page">
          <div className="receipt">
            <div className="receipt-top">
              <Brand />
              <span>KITCHEN REPORT</span>
            </div>
            <span className="eyebrow">
              {cook.session.demo
                ? "빠른 체험 · 기록에 반영되지 않아요"
                : "오늘도 주방에서 살아남았다."}
            </span>
            <h1>오늘의 셰프 평가</h1>
            <div className="grade">
              {result.grade}
              <span>{result.score} / 100</span>
            </div>
            <div className="grade-stamp">
              SERVICE
              <br />
              COMPLETE
            </div>
            <h2>{cook.recipe?.name}</h2>
            <dl className="result-stats">
              <div>
                <dt>조리시간</dt>
                <dd>
                  {formatTime(
                    (cook.session.finishedAt! - cook.session.startedAt) / 1000,
                  )}
                </dd>
              </div>
              <div>
                <dt>지시 불이행</dt>
                <dd>{cook.session.counters.disobedience}회</dd>
              </div>
              <div>
                <dt>너무 빨리 넘기기</dt>
                <dd>{cook.session.counters.early}회</dd>
              </div>
              <div>
                <dt>타이머 초과</dt>
                <dd>{cook.session.counters.late}회</dd>
              </div>
              <div className="scold-total">
                <dt>셰프에게 혼난 횟수</dt>
                <dd>{cook.session.counters.scolded}회</dd>
              </div>
            </dl>
            <blockquote>“{result.message}”</blockquote>
            <div className="receipt-footer">
              <span>열정은 인정. 실력은 계속 지켜본다.</span>
              <div className="barcode" />
              <small>YES CHEF · NO EXCUSES. JUST COOK.</small>
            </div>
          </div>
          <p className="result-note">
            지시와 시간 준수 점수 · 맛이나 익힘 정도를 판정하지 않아요.
          </p>
          <button className="primary" onClick={share}>
            결과 공유하기 <Share2 size={20} />
          </button>
          <button
            className="text-button again"
            onClick={() => {
              cook.reset();
              setScreen("recipes");
            }}
          >
            <RotateCcw size={16} /> 다시 주방으로
          </button>
        </main>
      )}
      <footer className="footer">
        <span>YES CHEF © 2026</span>
        <span>요리는 진지하게. 혼나는 건 가볍게.</span>
        <span>MADE TO MAKE YOU COOK.</span>
      </footer>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button aria-label="알림 닫기" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {cook.earlyDialog && screen === "cooking" && (
        <Dialog titleId="warning-title">
          <span className="eyebrow">CHEF IS NOT IMPRESSED</span>
          <Flame className="modal-flame" size={44} />
          <h2 id="warning-title">어딜 가.</h2>
          <p>{cook.message}</p>
          <div className="warning-time">
            지금 {formatTime(cook.elapsed)} 지났다.
            <br />
            권장 시간까지{" "}
            <strong>
              {formatTime((cook.step?.recommendedDuration || 0) - cook.elapsed)}
            </strong>{" "}
            남았어.
          </div>
          <button autoFocus className="primary" onClick={cook.apologize}>
            죄송합니다 셰프
          </button>
          <small>돌아간 뒤 ‘그래도 넘어가기’를 선택할 수 있어요.</small>
        </Dialog>
      )}
      {exitOpen && (
        <Dialog titleId="exit-title">
          <span className="eyebrow">LEAVING SO SOON?</span>
          <h2 id="exit-title">벌써 퇴근하게?</h2>
          <p>
            진행 중인 요리는 저장되지 않아.
            <br />
            나가기 전에 가스와 전열기구부터 확인해.
          </p>
          <button
            autoFocus
            className="primary"
            onClick={() => setExitOpen(false)}
          >
            계속하겠습니다, 셰프!
          </button>
          <button
            className="text-button again"
            onClick={() => {
              setExitOpen(false);
              cook.reset();
              setScreen("recipes");
            }}
          >
            요리 종료하기
          </button>
        </Dialog>
      )}
    </div>
  );
}
