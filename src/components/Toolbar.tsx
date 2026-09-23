import React from 'react';
import {
  Printer,
  HelpCircle,
  Download,
  Loader2,
  Trash2,
} from 'lucide-react';
import { FormConfig, RowHeight, TargetGroup } from '../types';

interface ToolbarProps {
  config: FormConfig;
  onChangeConfig: (newConfig: Partial<FormConfig>) => void;
  selectedGroup?: TargetGroup;
  cloudSyncSlot?: React.ReactNode;
  onAddRows: (count: number) => void;
  onClearAll: () => void;
  onLoadSample?: () => void;
  onMakeBlankForm?: () => void;
  onFillAllSignatures?: () => void;
  onClearAllSignatures?: () => void;
  onOpenImportModal?: () => void;
  onOpenPrintGuide: () => void;
  onPrint: () => void;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
  pdfProgressText?: string;
  totalParticipants: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  config,
  onChangeConfig,
  cloudSyncSlot,
  onAddRows,
  onClearAll,
  onFillAllSignatures,
  onClearAllSignatures,
  onOpenPrintGuide,
  onPrint,
  onDownloadPdf,
  isDownloadingPdf,
  pdfProgressText,
  totalParticipants,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 w-full bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3">
        {/* Main action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand / App Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-sm shadow-xs font-serif">
              상
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm font-bold text-stone-900">상지여자중학교 연수 등록부</h1>
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  A4 공문서 규격
                </span>
                {cloudSyncSlot}
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                명단 자동 불러오기 · 등록부 실시간 연동 · A4 인쇄 최적화
              </p>
            </div>
          </div>

          {/* Core Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Print Settings Guide */}
            <button
              id="toolbar-print-guide-btn"
              type="button"
              onClick={onOpenPrintGuide}
              className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title="A4 인쇄 팁 및 브라우저 설정 안내"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Download as PDF Button */}
            {onDownloadPdf && (
              <button
                id="toolbar-download-pdf-btn"
                type="button"
                onClick={onDownloadPdf}
                disabled={isDownloadingPdf}
                className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 active:scale-98 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                title="등록부를 A4 규격 PDF 파일로 저장합니다"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{pdfProgressText || 'PDF 생성 중...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF 다운로드</span>
                  </>
                )}
              </button>
            )}

            {/* Print Button */}
            <button
              id="toolbar-print-btn"
              type="button"
              onClick={onPrint}
              className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 active:scale-98 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>A4 인쇄하기</span>
            </button>
          </div>
        </div>

        {/* Secondary options row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-2 border-t border-stone-100 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-3">
            {/* Add row options */}
            <div className="flex items-center gap-1">
              <span className="text-stone-500 text-[11px]">행 추가:</span>
              <button
                id="toolbar-add-1-row-btn"
                type="button"
                onClick={() => onAddRows(1)}
                className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[11px] font-medium transition-colors"
              >
                +1줄
              </button>
              <button
                id="toolbar-add-5-rows-btn"
                type="button"
                onClick={() => onAddRows(5)}
                className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[11px] font-medium transition-colors"
              >
                +5줄
              </button>
              <button
                id="toolbar-add-10-rows-btn"
                type="button"
                onClick={() => onAddRows(10)}
                className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-[11px] font-medium transition-colors"
              >
                +10줄
              </button>
            </div>

            <div className="h-3 w-px bg-stone-200" />

            {/* Row height selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 text-[11px]">행 높이:</span>
              {(['compact', 'normal', 'spacious'] as RowHeight[]).map((height) => (
                <button
                  key={height}
                  id={`toolbar-row-height-${height}-btn`}
                  type="button"
                  onClick={() => onChangeConfig({ rowHeight: height })}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    config.rowHeight === height
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {height === 'compact' ? '좁게' : height === 'normal' ? '표준(15줄)' : '넓게'}
                </button>
              ))}
            </div>

            <div className="h-3 w-px bg-stone-200" />

            {/* Signature Actions */}
            {onFillAllSignatures && (
              <div className="flex items-center gap-1">
                <span className="text-stone-500 text-[11px]">서명:</span>
                <button
                  id="toolbar-fill-signatures-btn"
                  type="button"
                  onClick={onFillAllSignatures}
                  className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[11px] font-medium transition-colors"
                  title="모든 참가자에게 정서 서명을 일괄 입력합니다"
                >
                  전체 서명
                </button>
                {onClearAllSignatures && (
                  <button
                    id="toolbar-clear-signatures-btn"
                    type="button"
                    onClick={onClearAllSignatures}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] font-medium transition-colors"
                    title="서명란을 모두 비웁니다 (수기 인쇄용)"
                  >
                    서명 비우기
                  </button>
                )}
              </div>
            )}

            <div className="h-3 w-px bg-stone-200" />

            {/* Toggle Remarks Column */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px]">
              <input
                id="toolbar-toggle-remarks-col"
                type="checkbox"
                checked={config.showRemarks}
                onChange={(e) => onChangeConfig({ showRemarks: e.target.checked })}
                className="rounded text-stone-800 focus:ring-stone-400"
              />
              <span>비고란 표시</span>
            </label>

            <div className="h-3 w-px bg-stone-200" />

            {/* Toggle 15 rows fill */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px]" title="한 장당 15줄 양식을 유지하여 빈칸을 자동으로 채웁니다">
              <input
                id="toolbar-toggle-fill-15-rows"
                type="checkbox"
                checked={config.fillEmptyRows !== false}
                onChange={(e) => onChangeConfig({ fillEmptyRows: e.target.checked })}
                className="rounded text-stone-800 focus:ring-stone-400"
              />
              <span>15줄 양식 채우기</span>
            </label>
          </div>

          {/* Right side info & clear */}
          <div className="flex items-center gap-3">
            <span className="text-stone-500 text-[11px]">
              등록 인원: <strong className="text-stone-800">{totalParticipants}</strong>명
            </span>
            <button
              id="toolbar-clear-all-btn"
              type="button"
              onClick={onClearAll}
              className="text-[11px] text-stone-400 hover:text-red-600 flex items-center gap-1 transition-colors"
              title="모든 행을 비웁니다"
            >
              <Trash2 className="w-3 h-3" />
              <span>전체 비우기</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
