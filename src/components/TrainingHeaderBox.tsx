import React from 'react';
import { TrainingInfo, FormConfig, TargetGroup } from '../types';

interface TrainingHeaderBoxProps {
  info: TrainingInfo;
  config: FormConfig;
  totalParticipants: number;
  onUpdateInfo: (field: keyof TrainingInfo, value: string) => void;
  isEditingTitle?: boolean;
  setIsEditingTitle?: (v: boolean) => void;
  selectedGroup?: TargetGroup;
}

export const TrainingHeaderBox: React.FC<TrainingHeaderBoxProps> = ({
  info,
  totalParticipants,
  onUpdateInfo,
  selectedGroup,
}) => {
  const getDocTitle = () => {
    if (info.title && info.title.trim()) {
      return info.title.trim();
    }
    if (selectedGroup === 'meeting') return '협 의 회 등 록 부';
    return '연 수 등 록 부';
  };

  // 연수명 길이에 따른 제목 글꼴 크기 및 자간 유동 조절
  const getHeaderTitleSizeClass = (text: string = '') => {
    const len = text.trim().length;
    if (len <= 14) return 'text-2xl sm:text-[26px] tracking-[0.2em]';
    if (len <= 22) return 'text-xl sm:text-2xl tracking-[0.08em]';
    if (len <= 32) return 'text-lg sm:text-xl tracking-normal leading-snug';
    return 'text-base sm:text-lg tracking-tight leading-snug';
  };

  return (
    <div className="w-full mb-3 sm:mb-3.5">
      {/* Document Title (명단 입력 및 관리에서 연수명 입력 시 자동 연동 및 표시) */}
      <div className="w-full text-center py-2 mb-1 sm:mb-1.5">
        <h1 className={`font-bold text-stone-950 pb-0.5 ${getHeaderTitleSizeClass(getDocTitle())}`}>
          {getDocTitle()}
        </h1>
      </div>

      {/* Meta Information Table */}
      <table className="print-table w-full border-collapse border border-stone-800 text-[12pt]">
        <tbody className="text-[12pt]">
          <tr className="border-b border-stone-800">
            <th className="w-20 sm:w-24 bg-stone-100/90 py-1 sm:py-1.5 px-2.5 font-semibold text-stone-800 text-left border-r border-stone-800 whitespace-nowrap text-[12pt]">
              일 &nbsp;&nbsp;&nbsp; 시
            </th>
            <td className="w-1/2 py-0.5 px-2 border-r border-stone-800 text-stone-900 text-[12pt]">
              <input
                id="meta-datetime-input"
                type="text"
                value={info.date}
                onChange={(e) => onUpdateInfo('date', e.target.value)}
                placeholder="2026년 9월 24일(목) 15:30 ~ 17:30"
                title={info.date}
                className="w-full bg-transparent focus:outline-none focus:bg-amber-50/50 py-0.5 px-1 rounded text-stone-900 transition-all text-[12pt]"
              />
            </td>
            <th className="w-20 sm:w-24 bg-stone-100/90 py-1 sm:py-1.5 px-2.5 font-semibold text-stone-800 text-left border-r border-stone-800 whitespace-nowrap text-[12pt]">
              장 &nbsp;&nbsp;&nbsp; 소
            </th>
            <td className="w-1/2 py-0.5 px-2 text-stone-900 text-[12pt]">
              <input
                id="meta-location-input"
                type="text"
                value={info.location}
                onChange={(e) => onUpdateInfo('location', e.target.value)}
                placeholder="연수 장소를 입력하세요"
                title={info.location}
                className="w-full bg-transparent focus:outline-none focus:bg-amber-50/50 py-0.5 px-1 rounded transition-all text-[12pt]"
              />
            </td>
          </tr>
          <tr>
            <th className="w-20 sm:w-24 bg-stone-100/90 py-1 sm:py-1.5 px-2.5 font-semibold text-stone-800 text-left border-r border-stone-800 whitespace-nowrap text-[12pt]">
              주관/담당
            </th>
            <td className="py-0.5 px-2 border-r border-stone-800 text-stone-900 text-[12pt]">
              <div className="flex items-center gap-2">
                <input
                  id="meta-organizer-input"
                  type="text"
                  value={info.organizer}
                  onChange={(e) => onUpdateInfo('organizer', e.target.value)}
                  placeholder="주관 부서 또는 담당자"
                  title={info.organizer}
                  className="w-full bg-transparent focus:outline-none focus:bg-amber-50/50 py-0.5 px-1 rounded transition-all text-[12pt]"
                />
              </div>
            </td>
            <th className="w-20 sm:w-24 bg-stone-100/90 py-1 sm:py-1.5 px-2.5 font-semibold text-stone-800 text-left border-r border-stone-800 whitespace-nowrap text-[12pt]">
              참석 현황
            </th>
            <td className="py-1 px-2.5 text-stone-900 text-[12pt]">
              <span>
                총원 <strong>{totalParticipants}</strong>명
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
