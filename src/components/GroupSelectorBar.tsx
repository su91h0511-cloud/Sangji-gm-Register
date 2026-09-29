import React from 'react';
import { TargetGroup, TARGET_GROUPS, AllGroupsData } from '../types';
import { GraduationCap, Building, Users, Briefcase, MessagesSquare, Check } from 'lucide-react';

interface GroupSelectorBarProps {
  selectedGroup: TargetGroup;
  onSelectGroup: (group: TargetGroup) => void;
  groupsData: AllGroupsData;
  className?: string;
  variant?: 'document' | 'roster';
}

export const GroupSelectorBar: React.FC<GroupSelectorBarProps> = ({
  selectedGroup,
  onSelectGroup,
  groupsData,
  className = '',
  variant = 'document',
}) => {
  const getIcon = (groupId: TargetGroup) => {
    switch (groupId) {
      case 'teacher':
        return <GraduationCap className="w-4 h-4 shrink-0" />;
      case 'staff':
        return <Building className="w-4 h-4 shrink-0" />;
      case 'parents':
        return <Users className="w-4 h-4 shrink-0" />;
      case 'other':
        return <Briefcase className="w-4 h-4 shrink-0" />;
      case 'meeting':
        return <MessagesSquare className="w-4 h-4 shrink-0" />;
      default:
        return <Users className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div
      id="group-selector-container"
      className={`no-print print:hidden bg-amber-50/90 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 shadow-xs transition-colors ${className}`}
    >
      <div className="flex flex-col gap-2.5">
        {/* Top: Description text */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="text-xs sm:text-sm font-bold text-amber-950 whitespace-nowrap flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-pulse shrink-0" />
            {variant === 'document' ? '등록부 대상 선택 (자동 로드):' : '작성 대상 그룹 선택:'}
          </span>
          <span className="text-xs text-amber-900/85 font-normal">
            {variant === 'document'
              ? '명단 입력 및 관리 바탕으로 자동 반영됨, 수기 작성 금지'
              : '교사, 교직원, 학부모, 교직원(강사포함), 협의회 등록부 각각의 기본 정보와 참가자 명단을 별도로 작성합니다.'}
          </span>
        </div>

        {/* Bottom: 5 Group Click Buttons placed cleanly below the text */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
          {TARGET_GROUPS.map((grp) => {
            const isSelected = selectedGroup === grp.id;
            const count = groupsData[grp.id]?.participants?.length ?? 0;

            return (
              <button
                key={grp.id}
                id={`btn-select-group-${grp.id}`}
                type="button"
                onClick={() => onSelectGroup(grp.id)}
                className={`relative flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs ring-2 ring-stone-900 ring-offset-2 ring-offset-amber-50'
                    : 'bg-white text-stone-700 hover:bg-amber-100/50 hover:text-stone-950 border border-amber-200/80 shadow-2xs'
                }`}
                title={grp.description}
              >
                {getIcon(grp.id)}
                <span>{grp.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                    isSelected ? 'bg-stone-700 text-stone-200' : 'bg-amber-100 text-amber-900 font-medium'
                  }`}
                >
                  {count}명
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 hidden sm:inline" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
