import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { Participant, TargetGroup } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  selectedGroup?: TargetGroup;
  onClose: () => void;
  onImport: (newParticipants: Participant[], mode: 'replace' | 'append') => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  selectedGroup,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('append');

  if (!isOpen) return null;

  const isParents = selectedGroup === 'parents';

  const parseLines = (): Participant[] => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed: Participant[] = [];

    lines.forEach((line, idx) => {
      // Check delimiter: tab, comma, or whitespace
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else {
        parts = line.split(/\s{2,}|\s/);
      }

      parts = parts.map((p) => p.trim());

      // Skip header if user copied headers like "구분 소속 직위 성명"
      if (idx === 0 && (parts.includes('성명') || parts.includes('이름') || parts.includes('소속') || parts.includes('학생 이름'))) {
        return;
      }

      let category = isParents ? '학부모' : '수강생';
      let department = '';
      let grade = '';
      let classNum = '';
      let position = '';
      let name = '';
      let remarks = '';

      if (isParents) {
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
            department = parts[1];
            name = parts[2];
          } else {
            department = parts[0];
            grade = parts[1];
            name = parts[2];
          }
        } else if (parts.length === 4) {
          if (/^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && /^\d+$/.test(parts[2])) {
            grade = parts[1];
            classNum = parts[2];
            name = parts[3];
          } else if (/^\d+$/.test(parts[0])) {
            department = parts[1];
            grade = parts[2];
            name = parts[3];
          } else {
            department = parts[0];
            grade = parts[1];
            classNum = parts[2];
            name = parts[3];
          }
        } else if (parts.length >= 5) {
          if (/^\d+$/.test(parts[0])) {
            department = parts[1];
            grade = parts[2];
            classNum = parts[3];
            name = parts[4];
            remarks = parts.slice(5).join(' ');
          } else {
            department = parts[0];
            grade = parts[1];
            classNum = parts[2];
            name = parts[3];
            remarks = parts.slice(4).join(' ');
          }
        }
      } else {
        if (parts.length >= 4) {
          category = parts[0] || '수강생';
          department = parts[1] || '';
          position = parts[2] || '';
          name = parts[3] || '';
          remarks = parts.slice(4).join(' ') || '';
        } else if (parts.length === 3) {
          department = parts[0] || '';
          position = parts[1] || '';
          name = parts[2] || '';
          category = '수강생';
        } else if (parts.length === 2) {
          department = parts[0] || '';
          name = parts[1] || '';
          category = '수강생';
        } else if (parts.length === 1 && parts[0]) {
          name = parts[0];
          category = '수강생';
        }
      }

      if (name) {
        parsed.push({
          id: `imp-${Date.now()}-${idx}`,
          category,
          department,
          grade,
          classNum,
          position,
          name,
          signature: '',
          remarks,
        });
      }
    });

    return parsed;
  };

  const parsedList = parseLines();

  const handleApply = () => {
    if (parsedList.length === 0) return;
    onImport(parsedList, importMode);
    setRawText('');
    onClose();
  };

  const sampleTemplate = isParents
    ? `학부모회\t1\t1\t김민준\n학부모회\t1\t2\t이서아\n학부모회\t2\t1\t최지우\n학부모회\t2\t2\t정도현`
    : `수강생\t전략기획실\t과장\t홍길동\t
수강생\t인사총무팀\t대리\t김영희\t
강사\t교육기획원\t수석연구원\t이철수\t오전강의`;

  return (
    <div id="bulk-import-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div id="bulk-import-modal-card" className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-800">
                {isParents ? '학부모 명단 일괄 붙여넣기' : '엑셀 / 명단 일괄 붙여넣기'}
              </h3>
              <p className="text-xs text-stone-500">엑셀이나 한글에서 복사한 명단을 그대로 붙여넣으세요.</p>
            </div>
          </div>
          <button
            id="bulk-import-modal-close-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">열 순서 안내 (탭 또는 쉼표 구분):</p>
              {isParents ? (
                <p className="text-amber-700">
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">소속 / 학년 / 반 / 학생 이름</code> 또는{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">학년 / 반 / 학생 이름</code>
                </p>
              ) : (
                <p className="text-amber-700">
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">소속 / 직위 / 성명 / 비고</code> 또는{' '}
                  <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">소속 / 직위 / 성명</code>
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="bulk-import-textarea" className="text-xs font-semibold text-stone-700">명단 텍스트 입력</label>
              <button
                id="bulk-import-sample-fill-btn"
                type="button"
                onClick={() => setRawText(sampleTemplate)}
                className="text-[11px] text-stone-500 hover:text-stone-800 underline"
              >
                예시 텍스트 입력해보기
              </button>
            </div>
            <textarea
              id="bulk-import-textarea"
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                isParents
                  ? "엑셀에서 복사한 셀 데이터를 여기에 붙여넣으세요 (Ctrl + V)\n예시:\n학부모회\t1\t1\t김민준\n학부모회\t1\t2\t이서아"
                  : "엑셀에서 복사한 셀 데이터를 여기에 붙여넣으세요 (Ctrl + V)\n예시:\n수강생\t전략기획실\t팀장\t홍길동\n수강생\t디지털개발팀\t대리\t김철수"
              }
              className="w-full text-xs font-mono p-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-stone-50/50"
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-stone-700">적용 방식:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="text-stone-900 focus:ring-stone-500"
                />
                <span className="text-stone-600">기존 명단 뒤에 추가</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-stone-900 focus:ring-stone-500"
                />
                <span className="text-stone-600">기존 명단 대체</span>
              </label>
            </div>

            <span className="text-stone-500 font-medium">
              인식된 인원: <strong className="text-stone-900">{parsedList.length}</strong>명
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-stone-50 border-t border-stone-200">
          <button
            id="bulk-import-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-200/50 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            id="bulk-import-apply-btn"
            type="button"
            disabled={parsedList.length === 0}
            onClick={handleApply}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            {parsedList.length > 0 ? `${parsedList.length}명 등록하기` : '데이터 등록'}
          </button>
        </div>
      </div>
    </div>
  );
};
