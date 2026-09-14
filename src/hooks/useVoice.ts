"use client";
import { useCallback, useEffect, useRef, useState } from "react";
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((e: {
      results: { [key: number]: { [key: number]: { transcript: string } } };
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}
type VoiceWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
export function useVoice(onNext: () => void) {
  const [supported, setSupported] = useState(false),
    [listening, setListening] = useState(false),
    [hint, setHint] = useState("");
  const ref = useRef<Recognition | null>(null),
    restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    stoppedByUser = useRef(false),
    callback = useRef(onNext);
  callback.current = onNext;
  useEffect(() => {
    const w = window as VoiceWindow;
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      if (restartTimer.current) clearTimeout(restartTimer.current);
      ref.current?.abort();
    };
  }, []);
  const listen = useCallback(() => {
    const w = window as VoiceWindow;
    const Constructor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Constructor) return;
    if (ref.current) return;
    stoppedByUser.current = false;
    const r = new Constructor();
    ref.current = r;
    r.lang = "ko-KR";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      // 연속 인식에서는 이전 발화도 results에 남아 있으므로, 이번에 들어온
      // 마지막 발화만 처리해야 같은 “예, 셰프”가 여러 단계를 넘기지 않는다.
      const last = Object.keys(e.results).length - 1;
      const words = e.results[last]?.[0]?.transcript.replace(/[\s,.!]/g, "");
      if (/^(예|네)(셰프|쉐프)$/.test(words)) {
        setHint("들었다. 다음 단계로 간다, 셰프!");
        callback.current();
      }
    };
    r.onerror = () => {
      setHint(
        "마이크 권한이나 연결을 확인해 주세요. 버튼으로 계속할 수 있어요.",
      );
    };
    r.onend = () => {
      ref.current = null;
      setListening(false);
      // Chrome은 침묵 뒤에도 인식을 종료할 수 있다. 사용자가 한 번 켠 세션은
      // 다음 단계에서도 유지되도록 즉시 다시 시작한다.
      if (!stoppedByUser.current)
        restartTimer.current = setTimeout(() => listen(), 250);
    };
    try {
      r.start();
      setListening(true);
      setHint("상시 듣는 중. “예, 셰프!”라고 말하면 다음 단계로 가요.");
    } catch {
      setListening(false);
      setHint("음성을 시작하지 못했어요. 버튼을 사용해 주세요.");
    }
  }, []);
  const stop = useCallback(() => {
    stoppedByUser.current = true;
    if (restartTimer.current) clearTimeout(restartTimer.current);
    ref.current?.abort();
  }, []);
  return { supported, listening, hint, listen, stop };
}
