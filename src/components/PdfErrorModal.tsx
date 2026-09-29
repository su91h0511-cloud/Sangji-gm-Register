import React, { useState } from 'react';
import { AlertTriangle, Printer, RotateCcw, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface PdfErrorModalProps {
  isOpen: boolean;
  errorMessage: string;
  onClose: () => void;
  onRetry: () => void;
  onPrintFallback: () => void;
}

export const PdfErrorModal: React.FC<PdfErrorModalProps> = ({
  isOpen,
  errorMessage,
  onClose,
  onRetry,
  onPrintFallback,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      id="pdf-error-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-rose-50/80 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">PDF 다운로드 오류 안내</h3>
              <p className="text-xs text-rose-700 font-medium">
                일시적인 렌더링 문제 또는 브라우저 보안 제한
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-stone-700 leading-relaxed">
            브라우저 내 그래픽 변환 과정에서 일시적인 지연이나 보안 제한으로 인해 PDF 파일 자동 생성이 완료되지 못했습니다.
          </p>

          {/* Recommended Solution: Native Print-to-PDF */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-stone-800 space-y-2">
            <div className="font-bold text-amber-900 flex items-center gap-1.5 text-[13px]">
              <FileText className="w-4 h-4 text-amber-700" />
              가장 추천하는 해결 방법: [A4 인쇄]의 &lsquo;PDF로 저장&rsquo;
            </div>
            <p className="text-stone-700 leading-relaxed">
              아래 <strong>[A4 인쇄(PDF 저장) 바로 실행]</strong> 버튼을 누르신 후, 인쇄 창의 대상을 <strong>&lsquo;PDF로 저장&rsquo;</strong>으로 선택하시면 브라우저 기본 엔진으로 더욱 선명하고 완벽한 원본 A4 PDF 문서를 즉시 저장하실 수 있습니다.
            </p>
            <ul className="text-stone-600 list-disc list-inside space-y-0.5 pt-1 pl-1">
              <li>상단 날짜/제목 및 하단 주소 URL이 자동으로 깔끔하게 제거됩니다.</li>
              <li>A4 규격(위 15mm, 아래 10mm, 좌우 15mm)이 100% 정확하게 유지됩니다.</li>
            </ul>
          </div>

          {/* Technical Details Collapsible */}
          {errorMessage && (
            <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-stone-600 font-medium transition-colors"
              >
                <span>상세 오류 로그 확인</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showDetails && (
                <div className="p-3 bg-stone-900 text-stone-200 font-mono text-[11px] break-all max-h-32 overflow-y-auto whitespace-pre-wrap select-all">
                  {errorMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="px-3.5 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-white active:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            PDF 다시 시도
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 text-xs font-semibold transition-colors"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onPrintFallback();
              }}
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-98"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              A4 인쇄(PDF 저장) 바로 실행
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
