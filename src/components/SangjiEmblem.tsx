import React from 'react';

interface SangjiEmblemProps {
  className?: string;
  size?: number;
}

export const SangjiEmblem: React.FC<SangjiEmblemProps> = ({
  className = 'w-8 h-8',
  size,
}) => {
  const sizeStyle = size ? { width: size, height: size } : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      className={className}
      style={sizeStyle}
      aria-label="상지여자중학교 휘장"
      role="img"
    >
      <defs>
        {/* Arc for circular school name text */}
        <path
          id="sangji-circle-arc"
          d="M 85,195 A 185,185 0 0,0 415,195"
          fill="none"
        />
      </defs>

      {/* Background Circle */}
      <circle cx="250" cy="250" r="235" fill="#ffffff" />

      {/* Double Concentric Rings */}
      <circle
        cx="250"
        cy="250"
        r="230"
        fill="none"
        stroke="#00873e"
        strokeWidth="6"
      />
      <circle
        cx="250"
        cy="250"
        r="218"
        fill="none"
        stroke="#00873e"
        strokeWidth="10"
      />
      <circle
        cx="250"
        cy="250"
        r="142"
        fill="none"
        stroke="#00873e"
        strokeWidth="5"
      />

      {/* Top Emblem: Laurel Leaves (월계수) */}
      <g fill="#00873e">
        {/* Left Laurel Leaves */}
        <path d="M 195,65 C 185,55 165,58 155,70 C 168,75 185,73 195,65 Z" />
        <path d="M 175,78 C 160,72 145,80 138,95 C 152,95 168,88 175,78 Z" />
        <path d="M 152,98 C 138,94 125,105 120,120 C 135,118 147,108 152,98 Z" />
        <path d="M 132,122 C 120,120 108,132 105,148 C 120,144 128,132 132,122 Z" />
        <path d="M 118,150 C 108,150 98,162 98,178 C 112,172 118,160 118,150 Z" />

        {/* Right Laurel Leaves */}
        <path d="M 305,65 C 315,55 335,58 345,70 C 332,75 315,73 305,65 Z" />
        <path d="M 325,78 C 340,72 355,80 362,95 C 348,95 332,88 325,78 Z" />
        <path d="M 348,98 C 362,94 375,105 380,120 C 365,118 353,108 348,98 Z" />
        <path d="M 368,122 C 380,120 392,132 395,148 C 380,144 372,132 368,122 Z" />
        <path d="M 382,150 C 392,150 402,162 402,178 C 388,172 382,160 382,150 Z" />
      </g>

      {/* Top Center: 1964 Book Crest */}
      <g>
        {/* Book outer border */}
        <path
          d="M 215,35 L 285,35 L 285,75 Q 250,85 215,75 Z"
          fill="#ffffff"
          stroke="#00873e"
          strokeWidth="4"
        />
        {/* Center fold line */}
        <line x1="250" y1="35" x2="250" y2="80" stroke="#00873e" strokeWidth="3" />
        {/* Book pages accent */}
        <path
          d="M 220,70 Q 250,78 280,70"
          fill="none"
          stroke="#00873e"
          strokeWidth="2"
        />
        {/* 1964 Year Text */}
        <text
          x="250"
          y="58"
          fill="#00873e"
          fontSize="20"
          fontWeight="bold"
          fontFamily="'Pretendard', 'Noto Sans KR', sans-serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          1964
        </text>
      </g>

      {/* Circular Text: • KOREA • SANGJI GIRLS' MIDDLE SCHOOL • WONJU • */}
      <text
        fill="#00873e"
        fontSize="21"
        fontWeight="800"
        fontFamily="'Arial', 'Pretendard', sans-serif"
        letterSpacing="2.5"
      >
        <textPath
          href="#sangji-circle-arc"
          startOffset="50%"
          textAnchor="middle"
        >
          • KOREA • SANGJI GIRLS&apos; MIDDLE SCHOOL • WONJU •
        </textPath>
      </text>

      {/* Center Shield (방패) with 3 Peaks (치악산 삼봉) */}
      <g id="shield-group">
        {/* Shield background: Green top with peaks, white body */}
        <path
          d="M 160,140 Q 200,160 250,140 Q 300,160 340,140 L 340,270 Q 340,365 250,395 Q 160,365 160,270 Z"
          fill="#ffffff"
          stroke="#00873e"
          strokeWidth="6"
        />

        {/* Green Upper Cap of the Shield */}
        <path
          d="M 160,140 Q 200,160 250,140 Q 300,160 340,140 L 340,240 L 160,240 Z"
          fill="#00873e"
        />

        {/* Three Mountain Peaks (White peaks rising in green upper cap) */}
        <g fill="#ffffff" stroke="#00873e" strokeWidth="2">
          {/* Left Peak */}
          <path d="M 190,225 L 190,168 Q 205,152 220,168 L 220,225 Z" />
          {/* Center Peak (Higher) */}
          <path d="M 228,225 L 228,150 Q 250,132 272,150 L 272,225 Z" />
          {/* Right Peak */}
          <path d="M 280,225 L 280,168 Q 295,152 310,168 L 310,225 Z" />
        </g>

        {/* Open Book in the Middle */}
        <g id="open-book">
          {/* Book Base / Outline */}
          <path
            d="M 172,225 L 246,230 L 246,310 Q 210,320 172,310 Z"
            fill="#ffffff"
            stroke="#00873e"
            strokeWidth="5"
          />
          <path
            d="M 328,225 L 254,230 L 254,310 Q 290,320 328,310 Z"
            fill="#ffffff"
            stroke="#00873e"
            strokeWidth="5"
          />
          {/* Inner Book Border */}
          <path
            d="M 178,232 L 242,236 L 242,304 Q 210,312 178,304 Z"
            fill="#ffffff"
            stroke="#00873e"
            strokeWidth="2.5"
          />
          <path
            d="M 322,232 L 258,236 L 258,304 Q 290,312 322,304 Z"
            fill="#ffffff"
            stroke="#00873e"
            strokeWidth="2.5"
          />

          {/* Book spine line */}
          <line x1="250" y1="225" x2="250" y2="315" stroke="#00873e" strokeWidth="4" />

          {/* Hanja: 尚 (Sang) on left page */}
          <text
            x="210"
            y="282"
            fill="#00873e"
            fontSize="46"
            fontWeight="900"
            fontFamily="'Noto Serif KR', 'Nanum Myeongjo', serif"
            textAnchor="middle"
          >
            尚
          </text>

          {/* Hanja: 志 (Ji) on right page */}
          <text
            x="290"
            y="282"
            fill="#00873e"
            fontSize="46"
            fontWeight="900"
            fontFamily="'Noto Serif KR', 'Nanum Myeongjo', serif"
            textAnchor="middle"
          >
            志
          </text>
        </g>

        {/* Character: 中 (Middle School) below the book */}
        <text
          x="250"
          y="370"
          fill="#00873e"
          fontSize="48"
          fontWeight="900"
          fontFamily="'Pretendard', 'Noto Sans KR', 'Arial', sans-serif"
          textAnchor="middle"
        >
          中
        </text>
      </g>
    </svg>
  );
};
