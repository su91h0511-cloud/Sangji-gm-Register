import React from 'react';
import { TargetGroup, TARGET_GROUPS, AllGroupsData } from '../types';
import { GraduationCap, Building, Users2, Check } from 'lucide-react';

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
      case 'other':
      default:
        return <Users2 className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div
      id="group-selector-container"
      className={`no-print print:hidden bg-white border border-stone-200 rounded-xl p-2.5 sm:p-3 shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700 whitespace-nowrap flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {variant === 'document' ? '등록부 대상 선택 (자동 로드):' : '작성 대상 그룹 선택:'}
          </span>
          <span className="text-[11px] text-stone-500 hidden md:inline">
            {variant === 'document'
              ? '선택한 그룹의 연수 기본 정보와 명단이 등록부에 즉시 반영됩니다.'
              : '교사, 교직원, 학부모, 그 외 각각의 연수 기본 정보와 참가자 명단을 별도로 작성합니다.'}
          </span>
        </div>

        {/* 4 Group Buttons: 교사 / 교직원 / 학부모 / 그 외 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:flex items-center gap-1.5 sm:gap-2">
          {TARGET_GROUPS.map((grp) => {
            const isSelected = selectedGroup === grp.id;
            const count = groupsData[grp.id]?.participants?.length ?? 0;

            return (
              <button
                key={grp.id}
                id={`btn-select-group-${grp.id}`}
                type="button"
                onClick={() => onSelectGroup(grp.id)}
                className={`relative flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs ring-2 ring-stone-900 ring-offset-1'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                }`}
                title={grp.description}
              >
                {getIcon(grp.id)}
                <span>{grp.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-normal ${
                    isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-700'
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
