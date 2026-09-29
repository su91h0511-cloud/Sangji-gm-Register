import React, { useMemo } from 'react';
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
  // Row height classes tailored for 'normal' (표준) and 'spacious' (넓게) to minimize bottom margin
  const getRowHeightClass = (isFirstPage: boolean) => {
    if (config.rowHeight === 'spacious') {
      return isFirstPage
        ? 'h-[58px] sm:h-[59px] text-xs sm:text-sm'
        : 'h-[59px] sm:h-[60px] text-xs sm:text-sm';
    }
    // 'normal' (표준)
    return isFirstPage
      ? 'h-[48px] sm:h-[49px] text-xs sm:text-sm'
      : 'h-[47px] sm:h-[48px] text-xs sm:text-sm';
  };

  // 페이지 서명칸 개수: 상단 여백(15mm) 및 하단 여백(10mm)에 맞추어 용지 전체를 꽉 채우도록 자동 설정
  // 표준: 1페이지 16줄, 2페이지부터 19줄 (하단 여백 10mm)
  // 넓게: 1페이지 13줄, 2페이지부터 15줄 (하단 여백 10mm)
  const getPageCapacity = (pageNum: number) => {
    const isSpacious = config.rowHeight === 'spacious';
    if (pageNum === 1) {
      return isSpacious ? 13 : 16;
    }
    return isSpacious ? 15 : 19;
  };

  interface PageRow {
    participant?: Participant;
    displayNo: number;
    isPlaceholder?: boolean;
  }

  // Split participants into pages with automatic capacity based on row height
  const pages: { pageIndex: number; rows: PageRow[] }[] = [];
  const shouldFillRows = config.fillEmptyRows !== false;

  if (participants.length === 0) {
    if (shouldFillRows) {
      const page1Capacity = getPageCapacity(1);
      pages.push({
        pageIndex: 1,
        rows: Array.from({ length: page1Capacity }, (_, i) => ({
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
      const pageSize = getPageCapacity(pageNum);
      const slice = participants.slice(currentIndex, currentIndex + pageSize);
      const pageRows: PageRow[] = slice.map((item, idx) => ({
        participant: item,
        displayNo: currentIndex + idx + 1,
        isPlaceholder: false,
      }));

      // Pad remaining rows up to page capacity if enabled
      if (shouldFillRows && pageRows.length < pageSize) {
        const remainingCount = pageSize - pageRows.length;
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

      currentIndex += pageSize;
      pageNum++;
    }
  }

  const totalPages = Math.max(pages.length, 1);
  const isParents = selectedGroup === 'parents';
  // 비고(복무사항 등)가 입력된 인원을 제외한 실제 참석 대상 인원 계산 (학부모는 전체 참가자 수)
  const effectiveTotal = isParents
    ? participants.length
    : participants.filter((p) => !p.remarks || p.remarks.trim() === '').length;

  // 입력 데이터 내용(길이)을 분석하여 최적의 열 너비(%) 자동 계산
  const columnWidths = useMemo(() => {
    let maxDept = 0;
    let maxPos = 0;
    let maxName = 0;
    let maxRemark = 0;

    participants.forEach((p) => {
      const d = (p.department || '').trim().length;
      const pos = (p.position || '').trim().length;
      const n = (p.name || '').trim().length;
      const r = (p.remarks || '').trim().length;

      if (d > maxDept) maxDept = d;
      if (pos > maxPos) maxPos = pos;
      if (n > maxName) maxName = n;
      if (r > maxRemark) maxRemark = r;
    });

    if (isParents) {
      // 학부모 등록부 열 너비 분배
      const noWidth = '6%';
      const gradeWidth = '7.5%';
      const classWidth = '7.5%';
      const fixedBase = 6 + 7.5 + 7.5; // 21%

      const remarkWeight = !config.showRemarks
        ? 0
        : maxRemark === 0
        ? 8
        : maxRemark <= 3
        ? 12
        : maxRemark <= 6
        ? 16
        : 20;

      const remaining = 100 - (fixedBase + remarkWeight);

      // 소속 칸 내용에 맞춘 폭 (maxDept 기반 유동 조절)
      let deptPct: number;
      if (maxDept === 0) {
        deptPct = 16;
      } else if (maxDept <= 2) {
        deptPct = 18;
      } else if (maxDept <= 4) {
        deptPct = 23;
      } else if (maxDept <= 6) {
        deptPct = 28;
      } else if (maxDept <= 8) {
        deptPct = 33;
      } else {
        deptPct = 37;
      }

      let namePct = maxName <= 3 ? 18 : maxName <= 4 ? 20 : 23;

      const minSignPct = 24;
      const maxAllocatable = remaining - minSignPct;

      if (deptPct + namePct > maxAllocatable) {
        const ratio = maxAllocatable / (deptPct + namePct);
        deptPct = Math.round(deptPct * ratio);
        namePct = Math.round(namePct * ratio);
      }

      const signPct = remaining - (deptPct + namePct);

      return {
        no: noWidth,
        dept: `${deptPct}%`,
        grade: gradeWidth,
        classNum: classWidth,
        name: `${namePct}%`,
        signature: `${signPct}%`,
        remarks: `${remarkWeight}%`,
      };
    } else {
      // 교직원/협의회/기타 등록부 열 너비 분배
      const noWidth = '6%';
      const remarkWeight = !config.showRemarks
        ? 0
        : maxRemark === 0
        ? 8
        : maxRemark <= 3
        ? 12
        : maxRemark <= 6
        ? 16
        : 20;

      const remaining = 100 - (6 + remarkWeight);

      // 소속 칸 내용(글자 수)에 맞춘 폭 조절
      let deptPct: number;
      if (maxDept === 0) {
        deptPct = 15;
      } else if (maxDept <= 2) {
        deptPct = 17;
      } else if (maxDept <= 4) {
        deptPct = 22;
      } else if (maxDept <= 6) {
        deptPct = 27;
      } else if (maxDept <= 8) {
        deptPct = 32;
      } else {
        deptPct = 36;
      }

      // 직위 칸 내용에 맞춘 폭
      let posPct = maxPos <= 2 ? 14 : maxPos <= 4 ? 17 : 20;

      // 성명 칸 내용에 맞춘 폭
      let namePct = maxName <= 3 ? 16 : maxName <= 4 ? 18 : 21;

      // 서명 칸 최소 너비 확보 및 정규화
      const minSignPct = 22;
      const maxAllocatable = remaining - minSignPct;
      let subtotal = deptPct + posPct + namePct;

      if (subtotal > maxAllocatable) {
        const ratio = maxAllocatable / subtotal;
        deptPct = Math.round(deptPct * ratio);
        posPct = Math.round(posPct * ratio);
        namePct = Math.round(namePct * ratio);
        subtotal = deptPct + posPct + namePct;
      }

      const signPct = remaining - subtotal;

      return {
        no: noWidth,
        dept: `${deptPct}%`,
        position: `${posPct}%`,
        name: `${namePct}%`,
        signature: `${signPct}%`,
        remarks: `${remarkWeight}%`,
      };
    }
  }, [participants, isParents, config.showRemarks]);

  // 표 안에 내용 pt 12 (12pt = 16px) 통일
  const getPositionFontSize = (_val: string = '') => 'text-[12pt]';
  const getDeptFontSize = (_val: string = '') => 'text-[12pt]';
  const getNameFontSize = (_val: string = '') => 'text-[12pt] font-semibold';
  const getGradeClassFontSize = (_val: string = '') => 'text-[12pt]';
  const getRemarksFontSize = (val: string = '') =>
    val.trim().length <= 3 ? 'text-[12pt] font-medium text-center' : 'text-[12pt] text-left';

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
            className="a4-page bg-white shadow-xl print:shadow-none border border-stone-200 print:border-none my-4 print:my-0 pt-[15mm] px-[15mm] pb-[10mm] print:pt-[15mm] print:px-[15mm] print:pb-[10mm] flex flex-col justify-between text-stone-900 transition-shadow"
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
                      {trainingInfo.title || (selectedGroup === 'meeting' ? '협의회 등록부' : selectedGroup === 'other' ? '교직원(강사포함) 등록부' : '연수 등록부')}
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
                <table className="print-table w-full table-fixed border-collapse border-2 border-stone-900 text-[12pt] text-center">
                  <colgroup>
                    <col style={{ width: columnWidths.no }} />
                    <col style={{ width: columnWidths.dept }} />
                    {isParents ? (
                      <>
                        <col style={{ width: columnWidths.grade }} />
                        <col style={{ width: columnWidths.classNum }} />
                      </>
                    ) : (
                      <col style={{ width: columnWidths.position }} />
                    )}
                    <col style={{ width: columnWidths.name }} />
                    <col style={{ width: columnWidths.signature }} />
                    {config.showRemarks && <col style={{ width: columnWidths.remarks }} />}
                  </colgroup>
                  <thead>
                    <tr className="bg-stone-100/90 text-stone-900 font-bold border-b-2 border-stone-900 h-9 sm:h-10 text-[12pt]">
                      <th className="border-r border-stone-800 py-1.5 px-1 whitespace-nowrap text-[12pt]">
                        연번
                      </th>
                      <th className="border-r border-stone-800 py-1.5 px-2 whitespace-nowrap text-[12pt]">
                        소속
                      </th>
                      {isParents ? (
                        <>
                          <th className="border-r border-stone-800 py-1.5 px-1 whitespace-nowrap text-[12pt]">
                            학년
                          </th>
                          <th className="border-r border-stone-800 py-1.5 px-1 whitespace-nowrap text-[12pt]">
                            반
                          </th>
                        </>
                      ) : (
                        <th className="border-r border-stone-800 py-1.5 px-1 whitespace-nowrap text-[12pt]">
                          직위
                        </th>
                      )}
                      <th className="border-r border-stone-800 py-1.5 px-2 whitespace-nowrap text-[12pt]">
                        {isParents ? '학생 이름' : '성명'}
                      </th>
                      <th className="border-r border-stone-800 py-1.5 px-2 whitespace-nowrap text-[12pt]">
                        {isParents ? '학부모 서명' : '서명'}
                      </th>
                      {config.showRemarks && (
                        <th className="border-r border-stone-800 py-1.5 px-2 whitespace-nowrap text-[12pt]">
                          비고
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="text-[12pt]">
                    {page.rows.map(({ participant, displayNo, isPlaceholder }, rowIndex) => {
                      const rowHeightClass = getRowHeightClass(isFirstPage);
                      const isEven = rowIndex % 2 === 1;

                      if (isPlaceholder || !participant) {
                        return (
                          <tr
                            key={`placeholder-${page.pageIndex}-${displayNo}`}
                            className={`border-b border-stone-400 ${rowHeightClass} ${
                              isEven ? 'bg-stone-50/30 print:bg-transparent' : ''
                            } text-[12pt]`}
                          >
                            <td className="border-r border-stone-400 font-medium text-stone-500 select-none text-[12pt]">
                              {displayNo}
                            </td>
                            <td className="border-r border-stone-400 p-0.5 text-center text-[12pt]"></td>
                            {isParents ? (
                              <>
                                <td className="border-r border-stone-400 p-0.5 text-center text-[12pt]"></td>
                                <td className="border-r border-stone-400 p-0.5 text-center text-[12pt]"></td>
                              </>
                            ) : (
                              <td className="border-r border-stone-400 p-0.5 text-center text-[12pt]"></td>
                            )}
                            <td className="border-r border-stone-400 p-0.5 text-center text-[12pt]"></td>
                            <td className="border-r border-stone-400 p-0.5 text-center text-[12pt]"></td>
                            {config.showRemarks && (
                              <td className="border-r border-stone-400 p-0.5 text-center text-[12pt]"></td>
                            )}
                          </tr>
                        );
                      }

                      return (
                        <tr
                          key={participant.id}
                          className={`group border-b border-stone-400 hover:bg-amber-50/20 print:hover:bg-transparent transition-colors ${rowHeightClass} ${
                            isEven ? 'bg-stone-50/40 print:bg-transparent' : ''
                          } text-[12pt]`}
                        >
                          {/* 1. 연번 */}
                          <td className="border-r border-stone-400 font-medium text-stone-700 select-none text-[12pt]">
                            {displayNo}
                          </td>

                          {/* 2. 소속 (직위와 동일한 글자 크기 + 가운데 정렬) */}
                          <td className="border-r border-stone-400 p-0.5 text-center">
                            <input
                              type="text"
                              value={participant.department}
                              onChange={(e) =>
                                onUpdateParticipant(participant.id, 'department', e.target.value)
                              }
                              placeholder={isParents ? '학부모회 등' : '소속 입력'}
                              title={participant.department}
                              className={`w-full h-full text-center bg-transparent border-none focus:outline-none focus:bg-white text-stone-900 px-1 py-1 transition-all ${getDeptFontSize(
                                participant.department
                              )}`}
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
                                  className={`w-full h-full text-center bg-transparent border-none focus:outline-none focus:bg-white text-stone-900 py-1 ${getGradeClassFontSize(
                                    participant.grade
                                  )}`}
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
                                  className={`w-full h-full text-center bg-transparent border-none focus:outline-none focus:bg-white text-stone-900 py-1 ${getGradeClassFontSize(
                                    participant.classNum
                                  )}`}
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
                                title={participant.position}
                                className={`w-full h-full text-center bg-transparent border-none focus:outline-none focus:bg-white text-stone-900 py-1 transition-all ${getPositionFontSize(
                                  participant.position
                                )}`}
                              />
                            </td>
                          )}

                          {/* 4. 성명 / 학생 이름 (글자 수에 따른 폰트 크기 자동 조절) */}
                          <td className="border-r border-stone-400 p-0.5 font-medium">
                            <input
                              type="text"
                              value={participant.name}
                              onChange={(e) =>
                                onUpdateParticipant(participant.id, 'name', e.target.value)
                              }
                              placeholder={isParents ? '학생 이름' : '성명'}
                              title={participant.name}
                              className={`w-full h-full text-center bg-transparent border-none focus:outline-none focus:bg-white text-stone-950 font-semibold py-1 transition-all ${getNameFontSize(
                                participant.name
                              )}`}
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
                                <span className="font-serif italic text-[12pt] font-semibold text-stone-900 tracking-wider">
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

                          {/* 6. 비고 (선택적: 글자 수에 따른 폰트 크기 및 정렬 자동 조절) */}
                          {config.showRemarks && (
                            <td className="border-r border-stone-400 p-0.5">
                              <input
                                type="text"
                                value={participant.remarks || ''}
                                onChange={(e) =>
                                  onUpdateParticipant(participant.id, 'remarks', e.target.value)
                                }
                                placeholder=""
                                title={participant.remarks || ''}
                                className={`w-full h-full bg-transparent border-none focus:outline-none focus:bg-white text-stone-700 px-1.5 py-1 transition-all ${getRemarksFontSize(
                                  participant.remarks
                                )}`}
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

            {/* Bottom Section: Divider line with small center-aligned institution name (minimized margin right below table) */}
            <div className="w-full mt-2 sm:mt-2.5 select-none">
              <div className="w-full border-t border-stone-800" />
              <div
                id={`footer-institution-${page.pageIndex}`}
                className="pt-1 sm:pt-1.5 text-center text-xs sm:text-[13px] text-stone-800 font-medium tracking-[0.25em]"
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
