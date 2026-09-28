import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Cloud, X } from 'lucide-react';
import { SyncStatus } from '../hooks/useCloudSync';

interface SyncStatusToastProps {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export const SyncStatusToast: React.FC<SyncStatusToastProps> = ({
  status,
  lastSyncedAt,
  errorMessage,
  onRetry,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevStatusRef = useRef<SyncStatus>(status);

  // Format time (e.g., 17:14:22)
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  useEffect(() => {
    // Clear previous timer whenever status changes
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    // Reset dismissed state on status change
    setIsDismissed(false);

    if (status === 'saving') {
      setIsVisible(true);
    } else if (status === 'saved') {
      setIsVisible(true);
      // Automatically fade out after 2.8 seconds
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 2800);
    } else if (status === 'error') {
      setIsVisible(true);
    } else if (status === 'connected') {
      // If transitioned from saving/connecting, keep visible briefly then hide
      if (prevStatusRef.current === 'saving' || prevStatusRef.current === 'connecting') {
        setIsVisible(true);
        hideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      } else {
        // Idle connected state: hide toast to keep screen clean
        setIsVisible(false);
      }
    } else if (status === 'connecting') {
      setIsVisible(true);
    }

    prevStatusRef.current = status;

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [status, lastSyncedAt]);

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <aside
      aria-label="데이터 동기화 상태 알림"
      id="sync-status-toast"
      className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-300 ease-out transform"
    >
      <div
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-medium shadow-2xl backdrop-blur-md border transition-all duration-200 select-none ${
          status === 'saving'
            ? 'bg-stone-900/95 text-stone-100 border-amber-500/40 shadow-amber-950/20 ring-1 ring-amber-500/20'
            : status === 'saved'
            ? 'bg-stone-900/95 text-stone-100 border-emerald-500/40 shadow-emerald-950/20 ring-1 ring-emerald-500/20'
            : status === 'error'
            ? 'bg-rose-950/95 text-rose-100 border-rose-500/50 shadow-rose-950/30 ring-1 ring-rose-500/30'
            : 'bg-stone-900/95 text-stone-200 border-stone-700/60 shadow-black/30'
        }`}
      >
        {/* Status Indicator Icon */}
        {status === 'saving' && (
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span className="font-semibold tracking-tight text-amber-300">실시간 저장 중...</span>
          </div>
        )}

        {status === 'saved' && (
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold tracking-tight text-emerald-300">저장 완료</span>
            {lastSyncedAt && (
              <span className="text-[11px] text-stone-400 font-mono pl-0.5">
                ({formatTime(lastSyncedAt)})
              </span>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-1.5 text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-semibold tracking-tight">저장 실패</span>
            <span className="text-[11px] text-rose-200/80 max-w-[160px] truncate">
              {errorMessage || '네트워크 확인 필요'}
            </span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="ml-1 px-2 py-0.5 rounded bg-rose-800/80 hover:bg-rose-700 text-white text-[11px] font-semibold underline underline-offset-2 transition-colors"
              >
                재시도
              </button>
            )}
          </div>
        )}

        {status === 'connecting' && (
          <div className="flex items-center gap-1.5 text-stone-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-400" />
            <span>동기화 서버 연결 중...</span>
          </div>
        )}

        {status === 'connected' && (
          <div className="flex items-center gap-1.5 text-stone-300">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>클라우드 실시간 동기화됨</span>
          </div>
        )}

        {/* Small dismiss button */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="ml-1 p-0.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 rounded-full transition-colors"
          title="알림 닫기"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
