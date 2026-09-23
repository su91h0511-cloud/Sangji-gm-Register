import React from 'react';
import { Participant, TrainingInfo, FormConfig, TargetGroup, AllGroupsData } from '../types';
import { TrainingHeaderBox } from './TrainingHeaderBox';
import { GroupSelectorBar } from './GroupSelectorBar';
import { PenLine } from 'lucide-react';

interface RegistrationTableProps {
  participants: Participant[];
  trainingInfo: TrainingInfo;
  config: FormConfig;
  selectedGroup?: TargetGroup;
  onSelectGroup?: (group: TargetGroup) => void;
  groupsData?: AllGroupsData;
  onUpdateParticipant: (id: string, field: keyof Participant, value: string) => void;
  onDeleteParticipant?: (id: string) => void;
  onInsertRowBelow?: (id: string) => void;
  onMoveRow?: (id: string, direction: 'up' | 'down') => void;
  onOpenSignatureModal: (participant: Participant) => void;
  onUpdateInfo: (field: keyof TrainingInfo, value: string) => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (v: boolean) => void;
}

export const RegistrationTable: React.FC<RegistrationTableProps> = ({
  participants,
  trainingInfo,
  config,
  selectedGroup,
  onSelectGroup,
  groupsData,
  onUpdateParticipant,
  onDeleteParticipant,
  onInsertRowBelow,
  onMoveRow,
  onOpenSignatureModal,
  onUpdateInfo,
  isEditingTitle,
  setIsEditingTitle,
}) => {
  // Row height classes tailored for 15 rows per A4 sheet
  const getRowHeightClass = () => {
    switch (config.rowHeight) {
      case 'compact':
        return 'h-9 sm:h-9.5 text-xs';
      case 'spacious':
        return 'h-12 sm:h-[50px] text-xs sm:text-sm';
      case 'normal':
      default:
        return 'h-[44px] sm:h-[45px] text-xs sm:text-sm';
    }
  };

  // Fixed at 15 rows per sheet as requested ("한장에 15개씩")
  const ROWS_PER_PAGE = 15;

  interface PageRow {
    participant?: Participant;
    displayNo: number;
    isPlaceholder?: boolean;
  }

  // Split participants into pages (15 items per page)
  const pages: { pageIndex: number; rows: PageRow[] }[] = [];
  const shouldFill15 = config.fillEmptyRows !== false;

  if (participants.length === 0) {
    if (shouldFill15) {
      pages.push({
        pageIndex: 1,
        rows: Array.from({ length: ROWS_PER_PAGE }, (_, i) => ({
          displayNo: i + 1,
          isPlaceholder: true,
        })),
      });
    } else {
      pages.push({ pageIndex: 1, rows: [] });
    }
  } else {
    let currentIndex = 0;
    let pageNum = 1;

    while (currentIndex < participants.length) {
      const slice = participants.slice(currentIndex, currentIndex + ROWS_PER_PAGE);
      const pageRows: PageRow[] = slice.map((item, idx) => ({
        participant: item,
        displayNo: currentIndex + idx + 1,
        isPlaceholder: false,
      }));

      // Pad remaining rows up to 15 if enabled so the sheet stays a complete 15-row form
      if (shouldFill15 && pageRows.length < ROWS_PER_PAGE) {
        const remainingCount = ROWS_PER_PAGE - pageRows.length;
        const startNo = currentIndex + pageRows.length + 1;
        for (let i = 0; i < remainingCount; i++) {
          pageRows.push({
            displayNo: startNo + i,
            isPlaceholder: true,
          });
        }
      }

      pages.push({
        pageIndex: pageNum,
        rows: pageRows,
      });

      currentIndex += ROWS_PER_PAGE;
      pageNum++;
    }
  }

  const totalPages = Math.max(pages.length, 1);
  const isParents = selectedGroup === 'parents';
  // 비고(복무사항 등)가 입력된 인원을 제외한 실제 참석 대상 인원 계산 (학부모는 전체 참가자 수)
  const effectiveTotal = isParents
    ? participants.length
    : participants.filter((p) => !p.remarks || p.remarks.trim() === '').length;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Group Selector Bar for Document View (Hidden in print) */}
      {selectedGroup && onSelectGroup && groupsData && (
        <div className="w-full max-w-[210mm] px-4 pt-4 pb-1 no-print print:hidden">
          <GroupSelectorBar
            selectedGroup={selectedGroup}
            onSelectGroup={onSelectGroup}
            groupsData={groupsData}
            variant="document"
          />
        </div>
      )}

      <div className="a4-page-wrapper w-full flex flex-col items-center py-4 print:py-0">
        {pages.map((page) => {
          const isFirstPage = page.pageIndex === 1;

        return (
          <div
            key={`page-${page.pageIndex}`}
            className="a4-page bg-white shadow-xl print:shadow-none border border-stone-200 print:border-none my-4 print:my-0 px-7 py-6 sm:px-9 sm:py-7 print:p-0 flex flex-col justify-between text-stone-900 transition-shadow"
          >
            {/* Top section: Header & Info */}
            <div className="w-full">
              {isFirstPage ? (
                <TrainingHeaderBox
                  info={trainingInfo}
                  config={config}
                  totalParticipants={effectiveTotal}
                  onUpdateInfo={onUpdateInfo}
                  isEditingTitle={isEditingTitle}
                  setIsEditingTitle={setIsEditingTitle}
                  selectedGroup={selectedGroup}
                />
              ) : (
                /* Sub-page header */
                <div className="w-full flex items-center justify-between border-b-2 border-stone-800 pb-2 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm tracking-wider">
                      {trainingInfo.title || (selectedGroup === 'meeting' ? '협의회 등록부' : '연수 등록부')}
                    </span>
                    <span className="text-stone-500 font-medium">({trainingInfo.date})</span>
                  </div>
                  <div className="text-stone-600 font-medium">
                    (계속: {page.pageIndex} / {totalPages} 페이지)
                  </div>
                </div>
              )}

              {/* Main Registration Table */}
              <div className="w-full overflow-x-auto print:overflow-visible">
                <table className="print-table w-full border-collapse border-2 border-stone-900 text-xs sm:text-sm text-center">
                  <thead>
                    <tr className="bg-stone-100/90 text-stone-900 font-bold border-b-2 border-stone-900 h-9 sm:h-10">
                      <th className="w-12 border-r border-stone-800 py-1.5 px-1 whitespace-nowrap">
                        연번
                      </th>
                      <th className={`${isParents ? 'w-36 sm:w-44' : 'w-40 sm:w-52'} border-r border-stone-800 py-1.5 px-2 whitespace-nowrap`}>
                        소속
                      </th>
                      {isParents ? (
                        <>
                          <th className="w-16 sm:w-20 border-r border-stone-800 py-1.5 px-1 whitespace-nowrap">
                            학년
                          </th>
                          <th className="w-16 sm:w-20 border-r border-stone-800 py-1.5 px-1 whitespace-nowrap">
                            반
                          </th>
                        </>
                      ) : (
                        <th className="w-24 sm:w-28 border-r border-stone-800 py-1.5 px-1 whitespace-nowrap">
                          직위
                        </th>
                      )}
                      <th className={`${isParents ? 'w-32 sm:w-40' : 'w-28 sm:w-32'} border-r border-stone-800 py-1.5 px-2 whitespace-nowrap`}>
                        {isParents ? '학생 이름' : '성명'}
                      </th>
                      <th className={`${isParents ? 'w-36 sm:w-48' : 'w-32 sm:w-36'} border-r border-stone-800 py-1.5 px-2 whitespace-nowrap`}>
                        {isParents ? '학부모 서명' : '서명'}
                      </th>
                      {config.showRemarks && (
                        <th className="border-r border-stone-800 py-1.5 px-2 whitespace-nowrap">
                          비고
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {page.rows.map(({ participant, displayNo, isPlaceholder }, rowIndex) => {
                      const rowHeightClass = getRowHeightClass();
                      const isEven = rowIndex % 2 === 1;

                      if (isPlaceholder || !participant) {
                        return (
                          <tr
                            key={`placeholder-${page.pageIndex}-${displayNo}`}
                            className={`border-b border-stone-400 ${rowHeightClass} ${
                              isEven ? 'bg-stone-50/30 print:bg-transparent' : ''
                            }`}
                          >
                            <td className="border-r border-stone-400 font-medium text-stone-500 select-none">
                              {displayNo}
                            </td>
                            <td className="border-r border-stone-400 p-0.5 text-center"></td>
                            {isParents ? (
                              <>
                                <td className="border-r border-stone-400 p-0.5 text-center"></td>
                                <td className="border-r border-stone-400 p-0.5 text-center"></td>
                              </>
                            ) : (
                              <td className="border-r border-stone-400 p-0.5 text-center"></td>
                            )}
                            <td className="border-r border-stone-400 p-0.5 text-center"></td>
                            <td className="border-r border-stone-400 p-0.5 text-center"></td>
                            {config.showRemarks && (
                              <td className="border-r border-stone-400 p-0.5 text-center"></td>
                            )}
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={participant.id}
                          className={`group border-b border-stone-400 hover:bg-amber-50/20 print:hover:bg-transparent transition-colors ${rowHeightClass} ${
                            isEven ? 'bg-stone-50/40 print:bg-transparent' : ''
                          }`}
                        >
                          {/* 1. 연번 */}
                          <td className="border-r border-stone-400 font-medium text-stone-700 select-none">
                            {displayNo}
                          </td>

                          {/* 2. 소속 */}
                          <td className="border-r border-stone-400 p-0.5 text-left">
                            <input
                              type="text"
                              value={participant.department}
                              onChange={(e) =>
                                onUpdateParticipant(participant.id, 'department', e.target.value)
                              }
                              placeholder={isParents ? '학부모회 등' : '소속 입력'}
                              className="w-full h-full bg-transparent border-none focus:outline-none focus:bg-white text-stone-900 px-2 py-1"
                            />
                          </td>

                          {/* 3. 학년 & 반 (학부모) OR 직위 (그 외) */}
                          {isParents ? (
                            <>
                              <td className="border-r border-stone-400 p-0.5">
                                <input
                                  type="text"
                                  value={participant.grade || ''}
                                  onChange={(e) =>
                                    onUpdateParticipant(participant.id, 'grade', e.target.value)
                                  }
                                  placeholder="학년"
                                  className="w-full h-full text-center bg-transparent border-none focus:outline-none focus:bg-white text-stone-900 py-1"
                                />
                              </td>
                              <td className="border-r border-stone-400 p-0.5">
                                <input
                                  type="text"
                                  value={participant.classNum || ''}
                                  onChange={(e) =>
                                    onUpdateParticipant(participant.id, 'classNum', e.target.value)
                                  }
                                  placeholder="반"
                                  className="w-full h-full text-center bg-transparent border-none focus:outline-none focus:bg-white text-stone-900 py-1"
                                />
                              </td>
                            </>
                          ) : (
                            <td className="border-r border-stone-400 p-0.5">
                              <input
                                type="text"
                                value={participant.position}
                                onChange={(e) =>
                                  onUpdateParticipant(participant.id, 'position', e.target.value)
                                }
                                placeholder="직위"
                                className="w-full h-full text-center bg-transparent border-none focus:outline-none focus:bg-white text-stone-900 py-1"
                              />
                            </td>
                          )}

                          {/* 4. 성명 / 학생 이름 */}
                          <td className="border-r border-stone-400 p-0.5 font-medium">
                            <input
                              type="text"
                              value={participant.name}
                              onChange={(e) =>
                                onUpdateParticipant(participant.id, 'name', e.target.value)
                              }
                              placeholder={isParents ? '학생 이름' : '성명'}
                              className="w-full h-full text-center bg-transparent border-none focus:outline-none focus:bg-white text-stone-950 font-semibold py-1"
                            />
                          </td>

                          {/* 5. 서명 / 학부모 서명 (보이게 표시) */}
                          <td
                            className="border-r border-stone-400 p-0.5 relative cursor-pointer group/sign select-none"
                            onClick={() => onOpenSignatureModal(participant)}
                            title={isParents ? '클릭하여 학부모 서명 입력' : '클릭하여 전자 서명 또는 도장 입력'}
                          >
                            {participant.signature ? (
                              participant.signature.startsWith('data:image') ? (
                                <img
                                  src={participant.signature}
                                  alt={isParents ? '학부모 서명' : '서명'}
                                  className="h-8 max-w-[105px] mx-auto object-contain filter contrast-125"
                                />
                              ) : participant.signature.startsWith('[') ? (
                                <span className="inline-flex items-center justify-center border border-red-600 text-red-600 rounded px-1.5 py-0.5 text-xs font-bold tracking-widest bg-red-50/50">
                                  {participant.signature.replace(/[\[\]]/g, '')} 印
                                </span>
                              ) : (
                                <span className="font-serif italic text-sm font-semibold text-stone-900 tracking-wider">
                                  {participant.signature}
                                </span>
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="no-print print:hidden opacity-0 group-hover/sign:opacity-100 text-[10px] text-stone-400 flex items-center gap-1 transition-opacity">
                                  <PenLine className="w-3 h-3" />
                                  {isParents ? '학부모 서명' : '서명하기'}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 6. 비고 (선택적) */}
                          {config.showRemarks && (
                            <td className="border-r border-stone-400 p-0.5 text-left">
                              <input
                                type="text"
                                value={participant.remarks || ''}
                                onChange={(e) =>
                                  onUpdateParticipant(participant.id, 'remarks', e.target.value)
                                }
                                placeholder=""
                                className="w-full h-full bg-transparent border-none focus:outline-none focus:bg-white text-stone-700 px-2 py-1 text-xs"
                              />
                            </td>
                          )}
                        </tr>
                      );
                    })}

                    {page.rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={isParents ? (config.showRemarks ? 7 : 6) : (config.showRemarks ? 6 : 5)}
                          className="py-12 text-center text-stone-400 text-sm"
                        >
                          등록된 참가자가 없습니다. 상단 [명단 입력 및 관리] 탭에서 참가자를 등록해주세요.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Section: Divider line with small center-aligned institution name */}
            <div className="w-full mt-4 sm:mt-5 select-none">
              <div className="w-full border-t border-stone-800" />
              <div
                id={`footer-institution-${page.pageIndex}`}
                className="pt-2 text-center text-xs sm:text-[13px] text-stone-800 font-medium tracking-[0.25em]"
              >
                {trainingInfo.institution || '상지여자중학교'}
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
