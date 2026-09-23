import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, PenLine, Stamp, Sparkles } from 'lucide-react';
import { createSignatureSvg } from '../utils/signatures';

interface SignatureModalProps {
  isOpen: boolean;
  participantName: string;
  isParent?: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  participantName,
  isParent = false,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signMode, setSignMode] = useState<'draw' | 'stamp' | 'auto'>('auto');

  useEffect(() => {
    if (isOpen && signMode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }
  }, [isOpen, signMode]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const autoSvg = createSignatureSvg(participantName || '서명');

  const handleSave = () => {
    if (signMode === 'auto') {
      onSave(autoSvg);
    } else if (signMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        onSave(autoSvg);
      } else {
        onSave(canvas.toDataURL('image/png'));
      }
    } else {
      onSave(`[${participantName || '서명'}]`);
    }
    onClose();
  };

  return (
    <div id="signature-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div id="signature-modal-card" className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 className="text-base font-bold text-stone-800">
              {isParent ? '학부모 서명 입력' : '서명 입력'}{' '}
              {participantName ? (isParent ? `(학생: ${participantName})` : `(${participantName})`) : ''}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">정서 필기체 서명, 직접 그리기, 또는 전자 확인 도장을 선택할 수 있습니다.</p>
          </div>
          <button
            id="signature-modal-close-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex rounded-lg bg-stone-100 p-1 text-xs font-medium">
            <button
              id="signature-mode-auto-btn"
              type="button"
              onClick={() => setSignMode('auto')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                signMode === 'auto'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              정서 필기 서명
            </button>
            <button
              id="signature-mode-draw-btn"
              type="button"
              onClick={() => setSignMode('draw')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                signMode === 'draw'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              직접 그리기
            </button>
            <button
              id="signature-mode-stamp-btn"
              type="button"
              onClick={() => setSignMode('stamp')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
                signMode === 'stamp'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Stamp className="w-3.5 h-3.5" />
              도장 날인
            </button>
          </div>

          {signMode === 'auto' ? (
            <div className="py-6 flex flex-col items-center justify-center gap-3 bg-stone-50/80 rounded-lg border border-stone-200">
              <div className="p-3 bg-white rounded-md shadow-2xs border border-stone-200/60">
                <img
                  src={autoSvg}
                  alt="자동 서명 미리보기"
                  className="h-12 max-w-[160px] object-contain"
                />
              </div>
              <p className="text-xs text-stone-600">
                <strong>{participantName || '참석자'}</strong> 님의 정서 필기체 서명이 적용됩니다.
              </p>
            </div>
          ) : signMode === 'draw' ? (
            <div className="space-y-2">
              <div className="relative border-2 border-dashed border-stone-300 rounded-lg bg-stone-50/50 flex items-center justify-center overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair w-full h-[150px] touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute pointer-events-none text-stone-400 text-xs flex items-center gap-1">
                    <PenLine className="w-3.5 h-3.5" />
                    이곳에 서명을 그려주세요
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>※ 마우스나 손가락으로 드래그</span>
                <button
                  id="signature-clear-btn"
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-stone-600 hover:text-red-600 px-2 py-1 rounded hover:bg-stone-100 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  지우기
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center gap-3 bg-stone-50 rounded-lg border border-stone-200">
              <div className="w-20 h-20 rounded-full border-2 border-red-500 flex flex-col items-center justify-center text-red-500 font-bold tracking-widest shadow-xs bg-red-50/30">
                <span className="text-[10px] tracking-normal">확인</span>
                <span className="text-sm font-black">{participantName || '참석'}</span>
                <span className="text-[9px] tracking-tight">날인</span>
              </div>
              <p className="text-xs text-stone-600">
                <strong>{participantName || '참석자'}</strong> 서명란에 전자 확인 날인이 입력됩니다.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-stone-50 border-t border-stone-200">
          <button
            id="signature-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-200/50 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            id="signature-save-btn"
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            서명 등록
          </button>
        </div>
      </div>
    </div>
  );
};
