export default function ChefPortrait() {
  return (
    <svg
      viewBox="0 0 340 390"
      className="chef-portrait"
      role="img"
      aria-label="팔짱을 낀 엄격한 헤드 셰프 일러스트"
    >
      <defs>
        <pattern
          id="hatch"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(22)"
        >
          <path d="M0 0v5" stroke="#151513" strokeWidth=".7" />
        </pattern>
      </defs>
      <ellipse cx="177" cy="355" rx="137" ry="15" fill="#111" opacity=".3" />
      <path
        d="M77 354L86 255Q105 222 140 217L197 217Q243 222 264 259L289 354Z"
        fill="#ded8ca"
        stroke="#161613"
        strokeWidth="4"
      />
      <path
        d="M146 199v31l24 28 28-30-4-35"
        fill="#b0a591"
        stroke="#161613"
        strokeWidth="4"
      />
      <path
        d="M131 120Q168 93 209 123l-3 57q-8 48-36 47-31-3-39-45Z"
        fill="#d3c6ab"
        stroke="#161613"
        strokeWidth="4"
      />
      <path
        d="M132 147l-8-7-4 27 13 15m73-35 9-5 4 24-13 14"
        fill="#c3b397"
        stroke="#161613"
        strokeWidth="4"
      />
      <path d="M135 152l25 6m21 0 23-9" stroke="#151513" strokeWidth="7" />
      <path d="M145 164h9m34-2h9" stroke="#151513" strokeWidth="4" />
      <path
        d="M170 161l-6 23 13 1m-24 16q17-9 33-2"
        fill="none"
        stroke="#151513"
        strokeWidth="3"
      />
      <path d="M144 203q26 31 49-7l-6 18-17 13-21-12" fill="url(#hatch)" />
      <path
        d="M130 140l-4-42q-34-13-14-39 12-14 29-9 4-37 33-30 16 2 23 22 36-8 41 19 5 26-27 34l-5 42Z"
        fill="#f3efdf"
        stroke="#151513"
        strokeWidth="4"
      />
      <path
        d="M131 114q34-9 78-3m-66-55 7 42m39-51-3 48"
        fill="none"
        stroke="#151513"
        strokeWidth="2"
      />
      <path
        d="M140 221l30 37-23 27-24-51m74-14-27 38 25 25 23-47M170 259v92"
        fill="#efeadc"
        stroke="#151513"
        strokeWidth="3"
      />
      <path
        d="M90 261q-19 30-25 50-2 28 30 32l133-43-7-30-106 29"
        fill="#e5dfd1"
        stroke="#151513"
        strokeWidth="4"
      />
      <path
        d="M259 258q24 22 28 53 3 28-29 35l-150-39 9-27 113 27"
        fill="#d7d0c0"
        stroke="#151513"
        strokeWidth="4"
      />
      <path
        d="M109 280l-22-9-9 12 28 24m112-35 27-8 8 18-25 17"
        fill="#c3b397"
        stroke="#151513"
        strokeWidth="3"
      />
      <path d="M92 333l8 20h159l4-15-77-19-69 21" fill="url(#hatch)" />
      <circle cx="183" cy="286" r="3" fill="#151513" />
      <path d="M231 236l-4 35" stroke="#ef4935" strokeWidth="8" />
    </svg>
  );
}
