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
      viewBox="0 0 512 512"
      className={className}
      style={sizeStyle}
      aria-label="상지여중 앱 아이콘"
      role="img"
    >
      <defs>
        <linearGradient id="sangji-bg-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#008a40" />
          <stop offset="100%" stopColor="#00632d" />
        </linearGradient>
        <linearGradient id="sangji-border-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
        </linearGradient>
      </defs>

      {/* Squircle App Icon Background */}
      <rect width="512" height="512" rx="112" ry="112" fill="url(#sangji-bg-grad-comp)" />
      {/* Inner Highlight Border */}
      <rect
        x="12"
        y="12"
        width="488"
        height="488"
        rx="100"
        ry="100"
        fill="none"
        stroke="url(#sangji-border-grad-comp)"
        strokeWidth="8"
      />

      {/* School Emblem Year Tag */}
      <text
        x="256"
        y="82"
        fill="rgba(255,255,255,0.65)"
        fontSize="28"
        fontWeight="700"
        fontFamily="'Pretendard', 'Noto Sans KR', sans-serif"
        textAnchor="middle"
        letterSpacing="4"
      >
        SINCE 1964
      </text>

      {/* Korean Text: 상지 / 여중 (2x2 Grid) */}
      <g
        fill="#ffffff"
        fontFamily="'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif"
        fontWeight="900"
        fontSize="160"
        textAnchor="middle"
      >
        {/* Row 1: 상 지 */}
        <text x="170" y="235">상</text>
        <text x="342" y="235">지</text>
        {/* Row 2: 여 중 */}
        <text x="170" y="415">여</text>
        <text x="342" y="415">중</text>
      </g>

      {/* Center subtle decorative accent */}
      <circle cx="256" cy="275" r="5" fill="#fcd34d" opacity="0.8" />
    </svg>
  );
};
