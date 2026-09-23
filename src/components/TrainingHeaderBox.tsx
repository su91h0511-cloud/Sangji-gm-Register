import React from 'react';
import { TrainingInfo, FormConfig, TargetGroup } from '../types';

interface TrainingHeaderBoxProps {
  info: TrainingInfo;
  config: FormConfig;
  totalParticipants: number;
  onUpdateInfo: (field: keyof TrainingInfo, value: string) => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (v: boolean) => void;
  selectedGroup?: TargetGroup;
}

export const TrainingHeaderBox: React.FC<TrainingHeaderBoxProps> = ({
  info,
  config,
  totalParticipants,
  onUpdateInfo,
  isEditingTitle,
  setIsEditingTitle,
  selectedGroup,
}) => {
  const getDocTitle = () => {
    if (info.title) return info.title;
    if (selectedGroup === 'meeting') return '협 의 회 등 록 부';
    return '연 수 등 록 부';
  };

  const getTitleLabel = () => {
    if (selectedGroup === 'other') return '제 \u00a0\u00a0\u00a0 목';
    if (selectedGroup === 'meeting') return '협의회명';
    return '연 수 명';
  };

  const getTitlePlaceholder = () => {
    if (selectedGroup === 'other') return '제목을 입력하세요';
    if (selectedGroup === 'meeting') return '협의회명을 입력하세요';
    return '연수명을 입력하세요';
  };

  return (
    <div className="w-full mb-3 sm:mb-3.5">
      {/* Document Title (Centered, Approval box removed) */}
      <div className="w-full text-center py-2 mb-1 sm:mb-1.5">
        {isEditingTitle ? (
          <input
            id="header-title-input"
            type="text"
            value={info.title}
            onChange={(e) => onUpdateInfo('title', e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            autoFocus
            className="text-2xl sm:text-[26px] font-bold tracking-wider text-center w-full border-b-2 border-stone-800 focus:outline-none bg-stone-50 py-1"
          />
        ) : (
          <div
            id="header-title-display"
            onClick={() => setIsEditingTitle(true)}
            className="cursor-pointer group relative inline-block text-center"
            title="클릭하여 제목 변경"
          >
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-[0.25em] text-stone-950 pb-0.5 border-b-2 border-transparent group-hover:border-stone-400 transition-colors">
              {getDocTitle()}
            </h1>
            <span className="no-print absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              (클릭하여 수정)
            </span>
          </div>
        )}
      </div>

      {/* Meta Information Table */}
      <table className="print-table w-full border-collapse border border-stone-800 text-xs sm:text-[13px]">
        <tbody>
          <tr className="border-b border-stone-800">
            <th className="w-20 sm:w-24 bg-stone-100/90 py-1 sm:py-1.5 px-2.5 font-semibold text-stone-800 text-left border-r border-stone-800 whitespace-nowrap">
              {getTitleLabel()}
            </th>
            <td colSpan={3} className="py-0.5 px-2 border-r border-stone-800 font-medium text-stone-900">
              <input
                id="meta-title-input"
                type="text"
                value={info.title}
                onChange={(e) => onUpdateInfo('title', e.target.value)}
                placeholder={getTitlePlaceholder()}
                className="w-full bg-transparent focus:outline-none focus:bg-amber-50/50 py-0.5 px-1 rounded"
              />
            </td>
          </tr>
          <tr className="border-b border-stone-800">
            <th className="w-20 sm:w-24 bg-stone-100/90 py-1 sm:py-1.5 px-2.5 font-semibold text-stone-800 text-left border-r border-stone-800 whitespace-nowrap">
              일 &nbsp;&nbsp;&nbsp; 시
            </th>
            <td className="w-1/2 py-0.5 px-2 border-r border-stone-800 text-stone-900">
              <input
                id="meta-datetime-input"
                type="text"
                value={info.date}
                onChange={(e) => onUpdateInfo('date', e.target.value)}
                placeholder="2026년 9월 24일(목) 15:30 ~ 17:30"
                className="w-full bg-transparent focus:outline-none focus:bg-amber-50/50 py-0.5 px-1 rounded text-stone-900"
              />
            </td>
            <th className="w-20 sm:w-24 bg-stone-100/90 py-1 sm:py-1.5 px-2.5 font-semibold text-stone-800 text-left border-r border-stone-800 whitespace-nowrap">
              장 &nbsp;&nbsp;&nbsp; 소
            </th>
            <td className="w-1/2 py-0.5 px-2 text-stone-900">
              <input
                id="meta-location-input"
                type="text"
                value={info.location}
                onChange={(e) => onUpdateInfo('location', e.target.value)}
                placeholder="연수 장소를 입력하세요"
                className="w-full bg-transparent focus:outline-none focus:bg-amber-50/50 py-0.5 px-1 rounded"
              />
            </td>
          </tr>
          <tr>
            <th className="w-20 sm:w-24 bg-stone-100/90 py-1 sm:py-1.5 px-2.5 font-semibold text-stone-800 text-left border-r border-stone-800 whitespace-nowrap">
              주관/담당
            </th>
            <td className="py-0.5 px-2 border-r border-stone-800 text-stone-900">
              <div className="flex items-center gap-2">
                <input
                  id="meta-organizer-input"
                  type="text"
                  value={info.organizer}
                  onChange={(e) => onUpdateInfo('organizer', e.target.value)}
                  placeholder="주관 부서 또는 담당자"
                  className="w-full bg-transparent focus:outline-none focus:bg-amber-50/50 py-0.5 px-1 rounded"
                />
              </div>
            </td>
            <th className="w-20 sm:w-24 bg-stone-100/90 py-1 sm:py-1.5 px-2.5 font-semibold text-stone-800 text-left border-r border-stone-800 whitespace-nowrap">
              참석 현황
            </th>
            <td className="py-1 px-2.5 text-stone-900">
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
