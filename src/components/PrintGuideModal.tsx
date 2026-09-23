import React from 'react';
import { X, Printer, CheckCircle2, HelpCircle } from 'lucide-react';

interface PrintGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintNow: () => void;
}

export const PrintGuideModal: React.FC<PrintGuideModalProps> = ({
  isOpen,
  onClose,
  onPrintNow,
}) => {
  if (!isOpen) return null;

  return (
    <div id="print-guide-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div id="print-guide-modal-card" className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-800">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-800">A4 인쇄 최적화 설정 팁</h3>
              <p className="text-xs text-stone-500">인쇄 대화상자에서 아래 옵션을 확인해주세요.</p>
            </div>
          </div>
          <button
            id="print-guide-close-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs text-stone-600">
          <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-lg border border-stone-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-800 block">용지 크기: A4 선택</strong>
              <span>대화상자의 용지 크기 옵션이 &apos;A4 (210 x 297mm)&apos;로 되어 있는지 확인합니다.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-lg border border-stone-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-800 block">여백 설정: 기본(Default) 또는 없음(None)</strong>
              <span>서식 자체에 적정 규격 여백이 지정되어 있어 기본값 또는 최소 여백을 권장합니다.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-lg border border-stone-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-800 block">배경 그래픽 인쇄: 체크 권장</strong>
              <span>헤더 표 음영과 라인이 깔끔하게 출력되도록 &apos;배경 그래픽&apos; 옵션을 켜주세요.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-lg border border-stone-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-800 block">배율(확축): 100% 또는 &apos;용지에 맞춤&apos;</strong>
              <span>표가 밀리거나 2페이지로 넘어가지 않도록 100% 비율을 권장합니다.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-50 border-t border-stone-200">
          <span className="text-[11px] text-stone-400">PDF로 저장도 가능합니다.</span>
          <div className="flex items-center gap-2">
            <button
              id="print-guide-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800 hover:bg-stone-200/50 rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              id="print-guide-print-btn"
              type="button"
              onClick={() => {
                onClose();
                onPrintNow();
              }}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              지금 인쇄하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
