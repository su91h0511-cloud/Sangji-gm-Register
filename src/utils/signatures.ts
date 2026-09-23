// Realistic digital SVG signatures generator for Korean names
// Provides authentic cursive ink strokes in deep slate/indigo ink

export const createSignatureSvg = (name: string, variant = 0): string => {
  const seed = (name.charCodeAt(0) || 0) + (name.charCodeAt(name.length - 1) || 0) + variant;
  
  // Choose stroke color: deep charcoal/slate blue ink
  const inkColors = ['#0f172a', '#1e293b', '#1e3a8a', '#172554'];
  const inkColor = inkColors[seed % inkColors.length];

  // Variations in loop and flourish paths based on name length and characters
  const width = 130;
  const height = 46;

  // Generate stylized path coordinates representing realistic signature stroke
  const p1 = 20 + (seed % 10);
  const p2 = 25 + ((seed * 3) % 12);
  const p3 = 60 + ((seed * 7) % 15);
  const p4 = 85 + ((seed * 5) % 20);

  // SVG containing cursive script signature representation with authentic pen flourish
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <g fill="none" stroke="${inkColor}" stroke-linecap="round" stroke-linejoin="round">
        <!-- Main signature stroke -->
        <path d="M ${p1} 30 C ${p1 + 5} 12, ${p1 + 18} 10, ${p1 + 16} 26 C ${p1 + 14} 38, ${p1 + 28} 34, ${p3} 24 C ${p3 + 12} 16, ${p3 + 22} 14, ${p4} 28 C ${p4 + 8} 34, ${p4 + 20} 26, ${width - 15} 22" 
              stroke-width="2.2" />
        <!-- Accent loop / flourish -->
        <path d="M ${p1 + 10} 22 Q ${p3 - 10} 38, ${width - 12} 32 Q ${p4} 42, ${p1 + 5} 36" 
              stroke-width="1.6" opacity="0.85" />
        <!-- Pen dots / marks -->
        <circle cx="${p4 + 10}" cy="18" r="1.2" fill="${inkColor}" stroke="none" />
      </g>
      <!-- Stylized signature name text embedded for legibility -->
      <text x="${width / 2}" y="28" 
            text-anchor="middle" 
            font-family="'Pretendard', 'Apple SD Gothic Neo', sans-serif" 
            font-size="13" 
            font-weight="700" 
            font-style="italic" 
            fill="${inkColor}" 
            letter-spacing="4"
            opacity="0.92"
            transform="rotate(-3, ${width / 2}, 28)">
        ${name}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

export const sampleSignaturesMap: Record<string, string> = {
  '김진우': createSignatureSvg('김진우', 1),
  '박서현': createSignatureSvg('박서현', 2),
  '이민호': createSignatureSvg('이민호', 3),
  '정유진': createSignatureSvg('정유진', 4),
  '최동욱': createSignatureSvg('최동욱', 5),
  '강지혜': createSignatureSvg('강지혜', 6),
  '윤상혁': createSignatureSvg('윤상혁', 7),
  '송미경': createSignatureSvg('송미경', 8),
  '오태양': createSignatureSvg('오태양', 9),
  '한수빈': createSignatureSvg('한수빈', 10),
  '임재현': createSignatureSvg('임재현', 11),
  '배성우': createSignatureSvg('배성우', 12),
};
