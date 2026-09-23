import { useState } from 'react';
import {
  TrainingInfo,
  Participant,
  TargetGroup,
  TARGET_GROUPS,
} from './types';
import {
  initialGroupsData,
  createBlankParticipants,
} from './data/initialData';
import { createSignatureSvg } from './utils/signatures';
import { exportTableToPdf } from './utils/exportPdf';
import { Toolbar } from './components/Toolbar';
import { RegistrationTable } from './components/RegistrationTable';
import { ParticipantRosterTab } from './components/ParticipantRosterTab';
import { SignatureModal } from './components/SignatureModal';
import { BulkImportModal } from './components/BulkImportModal';
import { PrintGuideModal } from './components/PrintGuideModal';
import { CloudSyncBadge } from './components/CloudSyncBadge';
import { useCloudSync } from './hooks/useCloudSync';
import { FileText, Users, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'document' | 'roster'>('roster');
  const [selectedGroup, setSelectedGroup] = useState<TargetGroup>('teacher');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Real-time Cloud Sync with Firestore
  const {
    groupsData,
    formConfig,
    syncStatus,
    lastSyncedAt,
    errorMessage,
    setGroupsData,
    setFormConfig,
    forceSave,
  } = useCloudSync();

  // Active dataset derived from selectedGroup
  const currentGroupData = groupsData[selectedGroup] || initialGroupsData.teacher;
  const trainingInfo = currentGroupData.trainingInfo;
  const participants = currentGroupData.participants;

  // PDF Export state
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');

  // Modals state
  const [activeSignParticipant, setActiveSignParticipant] = useState<Participant | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPrintGuideOpen, setIsPrintGuideOpen] = useState(false);

  // Switch active group (교사 / 교직원 / 그 외)
  const handleSelectGroup = (group: TargetGroup) => {
    setSelectedGroup(group);
  };

  // Update training header info for the currently selected group
  const handleUpdateInfo = (field: keyof TrainingInfo, value: string) => {
    setGroupsData((prev) => ({
      ...prev,
      [selectedGroup]: {
        ...prev[selectedGroup],
        trainingInfo: {
          ...prev[selectedGroup].trainingInfo,
          [field]: value,
        },
      },
    }));
  };

  // Update participant single field for current group
  const handleUpdateParticipant = (id: string, field: keyof Participant, value: string) => {
    setGroupsData((prev) => ({
      ...prev,
      [selectedGroup]: {
        ...prev[selectedGroup],
        participants: prev[selectedGroup].participants.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  // Delete participant from current group
  const handleDeleteParticipant = (id: string) => {
    setGroupsData((prev) => ({
      ...prev,
      [selectedGroup]: {
        ...prev[selectedGroup],
        participants: prev[selectedGroup].participants.filter((item) => item.id !== id),
      },
    }));
  };

  // Insert row below in current group
  const handleInsertRowBelow = (id: string) => {
    setGroupsData((prev) => {
      const currentList = prev[selectedGroup].participants;
      const index = currentList.findIndex((p) => p.id === id);
      if (index === -1) return prev;
      const newRow: Participant = {
        id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        category: '수강생',
        department: '',
        position: '',
        name: '',
        signature: '',
        remarks: '',
      };
      const next = [...currentList];
      next.splice(index + 1, 0, newRow);
      return {
        ...prev,
        [selectedGroup]: {
          ...prev[selectedGroup],
          participants: next,
        },
      };
    });
  };

  // Move row within current group
  const handleMoveRow = (id: string, direction: 'up' | 'down') => {
    setGroupsData((prev) => {
      const currentList = prev[selectedGroup].participants;
      const index = currentList.findIndex((p) => p.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === currentList.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const next = [...currentList];
      const [movedItem] = next.splice(index, 1);
      next.splice(targetIndex, 0, movedItem);

      return {
        ...prev,
        [selectedGroup]: {
          ...prev[selectedGroup],
          participants: next,
        },
      };
    });
  };

  // Add multiple rows to current group
  const handleAddRows = (count: number) => {
    setGroupsData((prev) => ({
      ...prev,
      [selectedGroup]: {
        ...prev[selectedGroup],
        participants: [
          ...prev[selectedGroup].participants,
          ...createBlankParticipants(count, prev[selectedGroup].participants.length + 1),
        ],
      },
    }));
  };

  // Clear all rows in current group
  const handleClearAll = () => {
    const currentGroupLabel =
      TARGET_GROUPS.find((g) => g.id === selectedGroup)?.label || '선택된 대상';
    if (window.confirm(`'${currentGroupLabel}' 명단을 모두 지우시겠습니까?`)) {
      setGroupsData((prev) => ({
        ...prev,
        [selectedGroup]: {
          ...prev[selectedGroup],
          participants: [],
        },
      }));
    }
  };

  // Load initial sample data for currently selected group
  const handleLoadSample = () => {
    setGroupsData((prev) => ({
      ...prev,
      [selectedGroup]: {
        trainingInfo: { ...initialGroupsData[selectedGroup].trainingInfo },
        participants: [...initialGroupsData[selectedGroup].participants],
      },
    }));
  };

  // Make blank form for on-site pen signing for current group
  const handleMakeBlankForm = () => {
    setGroupsData((prev) => ({
      ...prev,
      [selectedGroup]: {
        ...prev[selectedGroup],
        participants: createBlankParticipants(15, 1),
      },
    }));
  };

  // Fill all participants in current group with realistic signatures
  const handleFillAllSignatures = () => {
    setGroupsData((prev) => ({
      ...prev,
      [selectedGroup]: {
        ...prev[selectedGroup],
        participants: prev[selectedGroup].participants.map((p, idx) => ({
          ...p,
          signature: p.signature || createSignatureSvg(p.name || `참가자${idx + 1}`, idx),
        })),
      },
    }));
  };

  // Clear all signatures in current group (for clean manual on-site signing)
  const handleClearAllSignatures = () => {
    setGroupsData((prev) => ({
      ...prev,
      [selectedGroup]: {
        ...prev[selectedGroup],
        participants: prev[selectedGroup].participants.map((p) => ({
          ...p,
          signature: '',
        })),
      },
    }));
  };

  // Bulk import into current group
  const handleImportParticipants = (newItems: Participant[], mode: 'replace' | 'append') => {
    setGroupsData((prev) => ({
      ...prev,
      [selectedGroup]: {
        ...prev[selectedGroup],
        participants:
          mode === 'replace'
            ? newItems
            : [...prev[selectedGroup].participants, ...newItems],
      },
    }));
  };

  // Save signature from modal
  const handleSaveSignature = (signatureData: string) => {
    if (!activeSignParticipant) return;
    handleUpdateParticipant(activeSignParticipant.id, 'signature', signatureData);
  };

  // Print handler
  const handlePrint = () => {
    setActiveTab('document');
    setTimeout(() => {
      window.print();
    }, 50);
  };

  // PDF Export handler using jsPDF + html2canvas
  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      setPdfProgressText('문서 준비 중...');

      // If currently on roster tab, switch to document tab first so the A4 pages are visible in DOM
      if (activeTab !== 'document') {
        setActiveTab('document');
        // Give time for DOM layout to settle
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      const currentGroupLabel =
        TARGET_GROUPS.find((g) => g.id === selectedGroup)?.label || '등록부';
      const rawTitle = trainingInfo.title || '연수등록부';
      const cleanTitle = rawTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `${cleanTitle}_[${currentGroupLabel}]_상지여자중학교_${dateStr}.pdf`;

      await exportTableToPdf({
        filename,
        onProgress: (_current, _total, text) => {
          setPdfProgressText(text);
        },
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF 생성 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsDownloadingPdf(false);
      setPdfProgressText('');
    }
  };

  const currentGroupLabel =
    TARGET_GROUPS.find((g) => g.id === selectedGroup)?.label || '교사';

  return (
    <div className="min-h-screen bg-stone-100/90 text-stone-900 flex flex-col font-sans">
      {/* Top action toolbar (Hidden in print) */}
      <Toolbar
        config={formConfig}
        onChangeConfig={(newCfg) => setFormConfig((prev) => ({ ...prev, ...newCfg }))}
        selectedGroup={selectedGroup}
        cloudSyncSlot={
          <CloudSyncBadge
            status={syncStatus}
            lastSyncedAt={lastSyncedAt}
            errorMessage={errorMessage}
            onForceSave={forceSave}
          />
        }
        onAddRows={handleAddRows}
        onClearAll={handleClearAll}
        onLoadSample={handleLoadSample}
        onMakeBlankForm={handleMakeBlankForm}
        onFillAllSignatures={handleFillAllSignatures}
        onClearAllSignatures={handleClearAllSignatures}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenPrintGuide={() => setIsPrintGuideOpen(true)}
        onPrint={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        pdfProgressText={pdfProgressText}
        totalParticipants={participants.length}
      />

      {/* Main Tab Navigation Header (Hidden in print) */}
      <div className="no-print print:hidden w-full bg-white border-b border-stone-200 sticky top-[57px] z-20 shadow-2xs">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 flex items-center justify-between">
          <div className="flex space-x-1 sm:space-x-2 py-2">
            <button
              id="tab-roster-input-btn"
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'roster'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'roster' ? 'text-amber-400' : 'text-stone-500'}`} />
              <span>명단 입력 및 관리</span>
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80 font-normal">
                교사·교직원·학부모·교직원(강사포함)·협의회 구분
              </span>
            </button>

            <button
              id="tab-document-view-btn"
              type="button"
              onClick={() => setActiveTab('document')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'document'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeTab === 'document' ? 'text-amber-400' : 'text-stone-500'}`} />
              <span>등록부</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'document' ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-700'}`}>
                {currentGroupLabel} {participants.length}명
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-stone-600">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>현재 선택: <strong>{currentGroupLabel}</strong></span>
              <span className="text-stone-400">|</span>
              <span>{participants.length}명</span>
            </div>
            <span className="hidden md:inline">하단 기관: <strong>{trainingInfo.institution || '상지여자중학교'}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 print:p-0 print:m-0 print:max-w-none">
        {/* Tab 1: A4 Registration Document (Always active for print) */}
        <div className={activeTab === 'document' ? 'block' : 'hidden print:block'}>
          <RegistrationTable
            participants={participants}
            trainingInfo={trainingInfo}
            config={formConfig}
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
            groupsData={groupsData}
            onUpdateParticipant={handleUpdateParticipant}
            onDeleteParticipant={handleDeleteParticipant}
            onInsertRowBelow={handleInsertRowBelow}
            onMoveRow={handleMoveRow}
            onOpenSignatureModal={(p) => setActiveSignParticipant(p)}
            onUpdateInfo={handleUpdateInfo}
            isEditingTitle={isEditingTitle}
            setIsEditingTitle={setIsEditingTitle}
          />
        </div>

        {/* Tab 2: Roster & Training Info Input and Management */}
        {activeTab === 'roster' && (
          <div className="animate-in fade-in duration-150">
            <ParticipantRosterTab
              participants={participants}
              trainingInfo={trainingInfo}
              selectedGroup={selectedGroup}
              onSelectGroup={handleSelectGroup}
              groupsData={groupsData}
              onUpdateParticipant={handleUpdateParticipant}
              onDeleteParticipant={handleDeleteParticipant}
              onInsertRowBelow={handleInsertRowBelow}
              onMoveRow={handleMoveRow}
              onAddRow={() => handleAddRows(1)}
              onClearAll={handleClearAll}
              onLoadSangjiSample={handleLoadSample}
              onImportBulk={handleImportParticipants}
              onSwitchToDocument={() => setActiveTab('document')}
              onUpdateInfo={handleUpdateInfo}
              onDownloadPdf={handleDownloadPdf}
              onOpenSignatureModal={(p) => setActiveSignParticipant(p)}
            />
          </div>
        )}
      </main>

      {/* Interactive Modals */}
      <SignatureModal
        isOpen={Boolean(activeSignParticipant)}
        participantName={activeSignParticipant?.name || ''}
        isParent={selectedGroup === 'parents'}
        onClose={() => setActiveSignParticipant(null)}
        onSave={handleSaveSignature}
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        selectedGroup={selectedGroup}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportParticipants}
      />

      <PrintGuideModal
        isOpen={isPrintGuideOpen}
        onClose={() => setIsPrintGuideOpen(false)}
        onPrintNow={handlePrint}
      />

      {/* PDF Export Progress Overlay Modal */}
      {isDownloadingPdf && (
        <div
          id="pdf-downloading-overlay"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-stone-200 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">A4 PDF 문서 생성 중</h3>
              <p className="text-xs text-stone-500 mt-1">
                {pdfProgressText || 'A4 규격 페이지를 렌더링하고 있습니다...'}
              </p>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-rose-600 h-full w-full animate-pulse"></div>
            </div>
            <p className="text-[11px] text-stone-400">
              잠시만 기다려주시면 자동으로 다운로드됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
