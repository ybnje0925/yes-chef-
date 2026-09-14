"use client";
import { Mic } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
export default function VoiceButton({ onNext }: { onNext: () => void }) {
  const voice = useVoice(onNext, true);
  return (
    <div className="voice">
      <button
        className="text-button"
        disabled={!voice.supported}
        onClick={voice.listening ? voice.stop : voice.listen}
      >
        <Mic size={16} />
        {voice.supported
          ? voice.listening
            ? "상시 듣는 중 · 잠시 끄기"
            : "음성 다시 켜기"
          : "이 브라우저는 버튼으로 대답해 주세요"}
      </button>
      <p>
        {voice.hint ||
          (voice.supported
            ? "“예, 셰프!”라고 말하면 바로 다음 단계로 갑니다. 음성이 브라우저 제공 서버로 전송될 수 있어요."
            : "")}
      </p>
    </div>
  );
}
