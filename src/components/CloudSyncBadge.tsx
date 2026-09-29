import React, { useEffect, useState } from 'react';
import { Cloud, Check, RefreshCw, AlertCircle, CloudOff } from 'lucide-react';
import { SyncStatus } from '../hooks/useCloudSync';

interface CloudSyncBadgeProps {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  errorMessage?: string | null;
  onForceSave: () => void;
}

export const CloudSyncBadge: React.FC<CloudSyncBadgeProps> = ({
  status,
  lastSyncedAt,
  errorMessage,
  onForceSave,
}) => {
  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    if (status === 'saved') {
      setIsHighlighting(true);
      const timer = setTimeout(() => {
        setIsHighlighting(false);
      }, 1600);
      return () => clearTimeout(timer);
    } else {
      setIsHighlighting(false);
    }
  }, [status, lastSyncedAt]);

  const formatTime = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-2">
      {status === 'saving' && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
          <span>클라우드 저장 중...</span>
        </div>
      )}

      {status === 'saved' && (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${
            isHighlighting
              ? 'sync-badge-saved-highlight bg-emerald-100 text-emerald-950 border-emerald-400 ring-2 ring-emerald-400/80 shadow-md shadow-emerald-500/20'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-600 text-white shadow-2xs">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
          <span>클라우드 저장 완료</span>
          {lastSyncedAt && (
            <span className="text-[10px] text-emerald-800/80 font-mono">
              ({formatTime(lastSyncedAt)})
            </span>
          )}
        </div>
      )}

      {status === 'connected' && (
        <button
          type="button"
          onClick={onForceSave}
          title="모든 기기에서 실시간 동기화 중입니다. 클릭 시 즉시 수동 동기화합니다."
          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Cloud className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-800" />
          <span>실시간 클라우드 공유</span>
          {lastSyncedAt && (
            <span className="text-[10px] text-stone-600 font-mono hidden lg:inline">
              {formatTime(lastSyncedAt)}
            </span>
          )}
        </button>
      )}

      {status === 'connecting' && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
          <RefreshCw className="w-3 h-3 animate-spin text-stone-400" />
          <span>클라우드 연결 중...</span>
        </div>
      )}

      {status === 'error' && (
        <button
          type="button"
          onClick={onForceSave}
          title={errorMessage || '동기화 오류가 발생했습니다. 클릭하여 다시 시도하세요.'}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>클라우드 재연결</span>
        </button>
      )}

      {status === 'offline' && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200">
          <CloudOff className="w-3.5 h-3.5" />
          <span>로컬 모드</span>
        </div>
      )}
    </div>
  );
};
