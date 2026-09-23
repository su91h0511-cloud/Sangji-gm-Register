import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building2,
  Calendar,
  MapPin,
  Users,
  PenLine,
} from 'lucide-react';
import { Participant, TrainingInfo, TargetGroup, AllGroupsData, TARGET_GROUPS } from '../types';
import { GroupSelectorBar } from './GroupSelectorBar';

interface ParticipantRosterTabProps {
  participants: Participant[];
  trainingInfo: TrainingInfo;
  selectedGroup: TargetGroup;
  onSelectGroup: (group: TargetGroup) => void;
  groupsData: AllGroupsData;
  onUpdateParticipant: (id: string, field: keyof Participant, value: string) => void;
  onDeleteParticipant: (id: string) => void;
  onInsertRowBelow: (id: string) => void;
  onMoveRow: (id: string, direction: 'up' | 'down') => void;
  onAddRow: () => void;
  onClearAll: () => void;
  onLoadSangjiSample: () => void;
  onImportBulk: (items: Participant[], mode: 'replace' | 'append') => void;
  onSwitchToDocument?: () => void;
  onUpdateInfo: (field: keyof TrainingInfo, value: string) => void;
  onDownloadPdf?: () => void;
  onOpenSignatureModal?: (participant: Participant) => void;
}

export const ParticipantRosterTab: React.FC<ParticipantRosterTabProps> = ({
  participants,
  trainingInfo,
  selectedGroup,
  onSelectGroup,
  groupsData,
  onUpdateParticipant,
  onDeleteParticipant,
  onInsertRowBelow,
  onMoveRow,
  onAddRow,
  onClearAll,
  onLoadSangjiSample,
  onImportBulk,
  onUpdateInfo,
  onOpenSignatureModal,
}) => {
  const [showQuickPaste, setShowQuickPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteMode, setPasteMode] = useState<'replace' | 'append'>('append');
  const [pasteError, setPasteError] = useState('');

  // Target group label
  const currentGroupConfig = TARGET_GROUPS.find((g) => g.id === selectedGroup) || TARGET_GROUPS[0];
  const isParents = selectedGroup === 'parents';

  // 비고(복무사항)가 없는 실제 참석 대상 인원 (학부모는 복무사항이 없으므로 전체 인원)
  const effectiveCount = isParents
    ? participants.length
    : participants.filter((p) => !p.remarks || p.remarks.trim() === '').length;

  // Handle Quick Paste parsing
  const handleParsePaste = () => {
    setPasteError('');
    if (!pasteText.trim()) {
      setPasteError('텍스트를 입력해주세요.');
      return;
    }

    const lines = pasteText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setPasteError('유효한 데이터가 없습니다.');
      return;
    }

    const parsed: Participant[] = [];

    lines.forEach((line, index) => {
      // Split by tab, comma, or multiple spaces
      let parts = line.includes('\t')
        ? line.split('\t')
        : line.includes(',')
        ? line.split(',')
        : line.split(/\s{2,}/);

      parts = parts.map((p) => p.trim());

      let category = isParents ? '학부모' : '수강생';
      let department = '';
      let grade = '';
      let classNum = '';
      let position = '';
      let name = '';
      let remarks = '';

      if (isParents) {
        // 학부모: [소속] [학년] [반] [학생이름] / [학년] [반] [학생이름] / [소속] [학생이름] / [학생이름]
        if (parts.length === 1) {
          name = parts[0];
        } else if (parts.length === 2) {
          department = parts[0];
          name = parts[1];
        } else if (parts.length === 3) {
          if (/^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
            grade = parts[0];
            classNum = parts[1];
            name = parts[2];
          } else if (/^\d+$/.test(parts[0])) {
            // [연번] [소속] [학생이름]
            department = parts[1];
            name = parts[2];
          } else {
            department = parts[0];
            grade = parts[1];
            name = parts[2];
          }
        } else if (parts.length === 4) {
          if (/^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && /^\d+$/.test(parts[2])) {
            // [연번] [학년] [반] [학생이름]
            grade = parts[1];
            classNum = parts[2];
            name = parts[3];
          } else if (/^\d+$/.test(parts[0])) {
            // [연번] [소속] [학년] [학생이름]
            department = parts[1];
            grade = parts[2];
            name = parts[3];
          } else {
            // [소속] [학년] [반] [학생이름]
            department = parts[0];
            grade = parts[1];
            classNum = parts[2];
            name = parts[3];
          }
        } else if (parts.length >= 5) {
          if (/^\d+$/.test(parts[0])) {
            // [연번] [소속] [학년] [반] [학생이름] [비고...]
            department = parts[1];
            grade = parts[2];
            classNum = parts[3];
            name = parts[4];
            remarks = parts.slice(5).join(' ');
          } else {
            // [소속] [학년] [반] [학생이름] [비고...]
            department = parts[0];
            grade = parts[1];
            classNum = parts[2];
            name = parts[3];
            remarks = parts.slice(4).join(' ');
          }
        }
      } else {
        if (parts.length === 1) {
          name = parts[0];
        } else if (parts.length === 2) {
          // [부서/구분] [성명]
          department = parts[0];
          name = parts[1];
        } else if (parts.length === 3) {
          // [부서] [직위] [성명]
          department = parts[0];
          position = parts[1];
          name = parts[2];
        } else if (parts.length === 4) {
          // [구분] [부서] [직위] [성명]
          category = parts[0];
          department = parts[1];
          position = parts[2];
          name = parts[3];
        } else if (parts.length >= 5) {
          // Might include leading index number
          if (/^\d+$/.test(parts[0])) {
            category = parts[1] || '수강생';
            department = parts[2] || '';
            position = parts[3] || '';
            name = parts[4] || '';
            remarks = parts[5] || '';
          } else {
            category = parts[0];
            department = parts[1];
            position = parts[2];
            name = parts[3];
            remarks = parts[4];
          }
        }
      }

      parsed.push({
        id: `paste-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        category: category || '수강생',
        department: department || '',
        grade: grade || '',
        classNum: classNum || '',
        position: position || '',
        name: name || `참가자${index + 1}`,
        signature: '',
        remarks: remarks || '',
      });
    });

    onImportBulk(parsed, pasteMode);
    setPasteText('');
    setShowQuickPaste(false);
  };

  return (
    <div className="w-full space-y-5 pb-16">
      {/* 5 Target Groups Selector Bar (교사 / 교직원 / 학부모 / 교직원(강사포함) / 협의회 등록부) */}
      <GroupSelectorBar
        selectedGroup={selectedGroup}
        onSelectGroup={onSelectGroup}
        groupsData={groupsData}
        variant="roster"
      />

      {/* Top Banner: Real-time sync notification */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500/10 text-amber-900 rounded-lg shrink-0 mt-0.5">
            <ClipboardList className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900">
                [{currentGroupConfig.label}] 명단 입력 및 {selectedGroup === 'meeting' ? '협의회' : '연수'} 정보 관리
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                등록부 실시간 자동 연동
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              현재 <strong>&apos;{currentGroupConfig.label}&apos;</strong> 그룹을 편집하고 있습니다. 여기서 수정한 기본 정보와 참가자 명단은 <strong>[📄 등록부]</strong>의 &apos;{currentGroupConfig.label}&apos; 등록부에 즉시 자동 불러와집니다.
            </p>
          </div>
        </div>
      </div>

      {/* Summary & Training Header Quick-check Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-stone-500" />
              <span>[{currentGroupConfig.label}] {selectedGroup === 'meeting' ? '협의회 기본 정보' : '연수 기본 정보'}</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                {currentGroupConfig.description}
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              교사, 교직원, 학부모, 교직원(강사포함), 협의회 등록부 그룹별로 제목·일시·장소·주관부서가 각각 따로 저장됩니다.
            </p>
          </div>
          <span className="text-xs text-stone-500">
            하단 표기: <strong>{trainingInfo.institution || '상지여자중학교'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-stone-500 font-medium mb-1">
              {selectedGroup === 'other' ? '제목' : selectedGroup === 'meeting' ? '협의회명' : '연수명'}
            </label>
            <input
              type="text"
              value={trainingInfo.title}
              onChange={(e) => onUpdateInfo('title', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:bg-white focus:border-stone-800"
              placeholder={
                selectedGroup === 'other'
                  ? '제목 입력'
                  : selectedGroup === 'meeting'
                  ? '협의회명 입력'
                  : '연수명 입력'
              }
            />
          </div>
          <div>
            <label className="block text-stone-500 font-medium mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              일시 (구분없이 자유 입력)
            </label>
            <input
              type="text"
              value={trainingInfo.date}
              onChange={(e) => onUpdateInfo('date', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:bg-white focus:border-stone-800"
              placeholder="2026년 9월 24일(목) 15:30 ~ 17:30"
            />
          </div>
          <div>
            <label className="block text-stone-500 font-medium mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400" />
              장소
            </label>
            <input
              type="text"
              value={trainingInfo.location}
              onChange={(e) => onUpdateInfo('location', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:bg-white focus:border-stone-800"
              placeholder="장소 입력"
            />
          </div>
          <div>
            <label className="block text-stone-500 font-medium mb-1">주관 / 담당부서</label>
            <input
              type="text"
              value={trainingInfo.organizer}
              onChange={(e) => onUpdateInfo('organizer', e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:bg-white focus:border-stone-800"
              placeholder="교육연구부 등"
            />
          </div>
        </div>
      </div>

      {/* Roster Controls & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-stone-600" />
            등록 인원 <span className="text-amber-700 font-mono text-base">{participants.length}</span>명
          </span>
          {!isParents && (
            <span className="text-xs text-stone-500">
              (복무 입력 제외 참석 대상: <strong className="text-stone-800">{effectiveCount}</strong>명)
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {/* Add single row */}
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>행 추가</span>
          </button>

          {/* Quick paste button */}
          <button
            type="button"
            onClick={() => setShowQuickPaste(!showQuickPaste)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-300 text-stone-700 rounded-md hover:bg-stone-100 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>엑셀/한글 일괄 붙여넣기</span>
          </button>

          {/* Load Group Sample */}
          <button
            type="button"
            onClick={onLoadSangjiSample}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-md hover:bg-amber-100 transition-colors"
            title={`${currentGroupConfig.label} 기본 예시 명단과 연수 정보를 불러옵니다`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>[{currentGroupConfig.label}] 예시 명단</span>
          </button>

          {/* Clear all rows */}
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3 h-3 text-red-500" />
            <span>명단 비우기</span>
          </button>
        </div>
      </div>

      {/* Quick Paste Modal/Card (Conditional) */}
      {showQuickPaste && (
        <div className="bg-amber-50/50 border-2 border-amber-200 rounded-xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-700" />
              엑셀 또는 한글 표 복사 후 붙여넣기 (빠른 대량 등록)
            </h4>
            <button
              type="button"
              onClick={() => setShowQuickPaste(false)}
              className="text-stone-400 hover:text-stone-700 text-xs px-2 py-1"
            >
              닫기 ✕
            </button>
          </div>

          <p className="text-xs text-stone-600 mb-3 leading-relaxed">
            {isParents ? (
              <>
                엑셀이나 한글 문서의 학부모 명단 표를 드래그 복사(Ctrl+C)한 뒤, 아래 상자에 붙여넣기(Ctrl+V) 하세요.<br />
                형식 예시: <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">소속 / 학년 / 반 / 학생 이름</code> 또는 <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">학년 / 반 / 학생 이름</code>
              </>
            ) : (
              <>
                엑셀이나 한글 문서의 참가자 명단 표를 드래그 복사(Ctrl+C)한 뒤, 아래 상자에 붙여넣기(Ctrl+V) 하세요.<br />
                형식 예시: <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">소속 / 직위 / 성명 / 비고</code> 또는 <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200">소속 / 직위 / 성명</code>
              </>
            )}
          </p>

          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
            placeholder={
              isParents
                ? `예시:\n학부모회\t1\t1\t김민준\n학부모회\t1\t2\t이서아\n학부모회\t2\t1\t최지우`
                : `예시:\n교무기획부\t부장교사\t이민호\t\n교육연구부\t교사\t박서현\t\n학생생활부\t교사\t정유진\t`
            }
            className="w-full p-3 font-mono text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />

          {pasteError && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {pasteError}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="pasteMode"
                  checked={pasteMode === 'append'}
                  onChange={() => setPasteMode('append')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>기존 명단 뒤에 추가</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="pasteMode"
                  checked={pasteMode === 'replace'}
                  onChange={() => setPasteMode('replace')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>기존 명단 대체하기</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQuickPaste(false)}
                className="px-3 py-1.5 bg-white border border-stone-300 text-stone-600 rounded-md text-xs hover:bg-stone-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleParsePaste}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md text-xs shadow-xs"
              >
                파싱하여 명단에 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Roster Input Table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-300 text-stone-700 font-bold">
                <th className="w-12 text-center py-2.5 px-2 border-r border-stone-200">연번</th>
                <th className={`${isParents ? 'w-44' : 'w-48'} py-2.5 px-3 border-r border-stone-200`}>
                  소속
                </th>
                {isParents && (
                  <>
                    <th className="w-20 text-center py-2.5 px-2 border-r border-stone-200">학년</th>
                    <th className="w-20 text-center py-2.5 px-2 border-r border-stone-200">반</th>
                  </>
                )}
                {!isParents && (
                  <th className="w-36 py-2.5 px-3 border-r border-stone-200">직위</th>
                )}
                <th className={`${isParents ? 'w-44' : 'w-40'} py-2.5 px-3 border-r border-stone-200`}>
                  {isParents ? '학생 이름' : '성명'}
                </th>
                {isParents && (
                  <th className="w-36 text-center py-2.5 px-2 border-r border-stone-200 text-stone-800">
                    학부모 서명
                  </th>
                )}
                <th className={`py-2.5 px-3 border-r border-stone-200 ${isParents ? 'w-48 text-stone-700 font-bold' : 'text-amber-950 font-bold bg-amber-50/50'}`}>
                  {isParents ? '비고' : '비고(복무사항 입력)'}
                </th>
                <th className="w-28 text-center py-2.5 px-2">순서 / 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {participants.map((p, index) => (
                <tr key={p.id} className="hover:bg-amber-50/30 transition-colors group">
                  {/* 연번 */}
                  <td className="text-center py-2 px-2 text-stone-500 font-mono font-medium border-r border-stone-200 bg-stone-50/50">
                    {index + 1}
                  </td>

                  {/* 소속 부서 / 학부모회 */}
                  <td className="p-1 border-r border-stone-200">
                    <input
                      type="text"
                      value={p.department}
                      onChange={(e) => onUpdateParticipant(p.id, 'department', e.target.value)}
                      placeholder={isParents ? '학부모회 등' : '교무기획부, 교육연구부 등'}
                      className="w-full px-2 py-1 bg-transparent hover:bg-stone-100/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 rounded text-stone-900"
                    />
                  </td>

                  {/* 학년 & 반 (학부모) */}
                  {isParents && (
                    <>
                      <td className="p-1 border-r border-stone-200">
                        <input
                          type="text"
                          value={p.grade || ''}
                          onChange={(e) => onUpdateParticipant(p.id, 'grade', e.target.value)}
                          placeholder="학년"
                          className="w-full text-center px-1 py-1 bg-transparent hover:bg-stone-100/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 rounded text-stone-900"
                        />
                      </td>
                      <td className="p-1 border-r border-stone-200">
                        <input
                          type="text"
                          value={p.classNum || ''}
                          onChange={(e) => onUpdateParticipant(p.id, 'classNum', e.target.value)}
                          placeholder="반"
                          className="w-full text-center px-1 py-1 bg-transparent hover:bg-stone-100/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 rounded text-stone-900"
                        />
                      </td>
                    </>
                  )}

                  {/* 직위 (학부모 제외) */}
                  {!isParents && (
                    <td className="p-1 border-r border-stone-200">
                      <input
                        type="text"
                        value={p.position}
                        onChange={(e) => onUpdateParticipant(p.id, 'position', e.target.value)}
                        placeholder="부장교사, 교사 등"
                        className="w-full px-2 py-1 bg-transparent hover:bg-stone-100/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 rounded text-stone-900"
                      />
                    </td>
                  )}

                  {/* 학생 이름 (학부모) / 성명 (교직원 등) */}
                  <td className="p-1 border-r border-stone-200">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => onUpdateParticipant(p.id, 'name', e.target.value)}
                      placeholder={isParents ? '학생 이름' : '성명'}
                      className="w-full px-2 py-1 bg-transparent hover:bg-stone-100/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 rounded font-semibold text-stone-950"
                    />
                  </td>

                  {/* 학부모 서명 (학부모) */}
                  {isParents && (
                    <td className="p-1 border-r border-stone-200 text-center">
                      {p.signature ? (
                        <div
                          onClick={() => onOpenSignatureModal?.(p)}
                          className="cursor-pointer inline-flex items-center justify-center p-0.5 rounded hover:bg-amber-100/60 transition-colors"
                          title="클릭하여 학부모 서명 수정"
                        >
                          {p.signature.startsWith('data:image') ? (
                            <img
                              src={p.signature}
                              alt="학부모 서명"
                              className="h-6 max-w-[80px] object-contain filter contrast-125"
                            />
                          ) : p.signature.startsWith('[') ? (
                            <span className="inline-flex items-center justify-center border border-red-600 text-red-600 rounded px-1.5 py-0.5 text-[11px] font-bold bg-red-50/50">
                              {p.signature.replace(/[\[\]]/g, '')} 印
                            </span>
                          ) : (
                            <span className="font-serif italic text-xs font-semibold text-stone-900">
                              {p.signature}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenSignatureModal?.(p)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-stone-300 text-stone-500 hover:border-amber-500 hover:text-amber-800 hover:bg-amber-50/50 transition-colors"
                          title="학부모 서명 입력"
                        >
                          <PenLine className="w-3 h-3 text-stone-400" />
                          학부모 서명
                        </button>
                      )}
                    </td>
                  )}

                  {/* 비고란 */}
                  <td className="p-1 border-r border-stone-200">
                    <input
                      type="text"
                      value={p.remarks || ''}
                      onChange={(e) => onUpdateParticipant(p.id, 'remarks', e.target.value)}
                      placeholder={
                        isParents
                          ? '비고 입력'
                          : '출장, 조퇴, 연가 등 복무사항 입력 (입력 시 등록부 참석 현황 총원에서 제외)'
                      }
                      className={`w-full px-2 py-1 bg-transparent hover:bg-stone-100/80 focus:bg-white focus:outline-none focus:ring-1 rounded ${
                        isParents
                          ? 'focus:ring-stone-400 text-stone-800'
                          : 'focus:ring-amber-500 text-stone-800'
                      }`}
                    />
                  </td>

                  {/* 순서 이동 & 관리 버튼 */}
                  <td className="p-1 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onMoveRow(p.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 rounded"
                        title="위로 이동"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveRow(p.id, 'down')}
                        disabled={index === participants.length - 1}
                        className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 rounded"
                        title="아래로 이동"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onInsertRowBelow(p.id)}
                        className="p-1 text-stone-400 hover:text-emerald-700 rounded"
                        title="바로 아래 행 추가"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteParticipant(p.id)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded"
                        title="행 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {participants.length === 0 && (
                <tr>
                  <td colSpan={isParents ? 8 : 6} className="py-12 text-center text-stone-400">
                    <p className="text-sm">입력된 참가자가 없습니다.</p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={onAddRow}
                        className="px-3 py-1.5 bg-stone-900 text-white rounded-md text-xs font-medium"
                      >
                        + 첫 번째 행 추가
                      </button>
                      <button
                        type="button"
                        onClick={onLoadSangjiSample}
                        className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-md text-xs font-medium"
                      >
                        {currentGroupConfig.label} 예시 명단 불러오기
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer bar */}
        <div className="bg-stone-50 border-t border-stone-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>총 <strong>{participants.length}</strong>명의 참가자가 등록부에 자동 반영됩니다.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddRow}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-stone-800 text-white rounded-md hover:bg-stone-700 font-medium shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 행 추가</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
