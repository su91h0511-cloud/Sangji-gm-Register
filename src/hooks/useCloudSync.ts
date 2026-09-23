import { useState, useEffect, useRef, useCallback } from 'react';
import { db, doc, onSnapshot, setDoc, getDoc } from '../lib/firebase';
import { AllGroupsData, FormConfig } from '../types';
import { initialGroupsData, defaultFormConfig } from '../data/initialData';

export type SyncStatus = 'connecting' | 'connected' | 'saving' | 'saved' | 'error' | 'offline';

export function useCloudSync() {
  const [groupsData, setGroupsData] = useState<AllGroupsData>(initialGroupsData);
  const [formConfig, setFormConfig] = useState<FormConfig>(defaultFormConfig);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Flags to avoid infinite echo loops between onSnapshot and setDoc
  const isInitialLoadDone = useRef(false);
  const isRemoteUpdate = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Firestore document reference
  const docRef = useRef(doc(db, 'training_sessions', 'default'));

  // 1. Listen for real-time changes
  useEffect(() => {
    setSyncStatus('connecting');

    const unsubscribe = onSnapshot(
      docRef.current,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.groupsData) {
            isRemoteUpdate.current = true;
            // Ensure all 4 groups exist in groupsData even if older doc had fewer
            const mergedGroups: AllGroupsData = {
              teacher: data.groupsData.teacher || initialGroupsData.teacher,
              staff: data.groupsData.staff || initialGroupsData.staff,
              parents: data.groupsData.parents || initialGroupsData.parents,
              other: data.groupsData.other || initialGroupsData.other,
            };
            setGroupsData(mergedGroups);

            if (data.formConfig) {
              setFormConfig((prev) => ({ ...prev, ...data.formConfig }));
            }

            setLastSyncedAt(new Date());
            setSyncStatus('connected');
            setErrorMessage(null);
          }
        } else {
          // Document doesn't exist yet, seed initial data
          setDoc(docRef.current, {
            groupsData: initialGroupsData,
            formConfig: defaultFormConfig,
            updatedAt: new Date().toISOString(),
          })
            .then(() => {
              setLastSyncedAt(new Date());
              setSyncStatus('connected');
            })
            .catch((err) => {
              console.error('Error seeding initial Firestore doc:', err);
              setSyncStatus('error');
              setErrorMessage('클라우드 초기화 실패');
            });
        }
        isInitialLoadDone.current = true;
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error);
        setSyncStatus('error');
        setErrorMessage(error.message || '클라우드 연결 오류');
        isInitialLoadDone.current = true;
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Debounced auto-save function to Firestore when user edits locally
  const triggerAutoSave = useCallback(
    (newGroupsData: AllGroupsData, newFormConfig: FormConfig) => {
      if (!isInitialLoadDone.current) return;
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }

      setSyncStatus('saving');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await setDoc(docRef.current, {
            groupsData: newGroupsData,
            formConfig: newFormConfig,
            updatedAt: new Date().toISOString(),
          });
          setSyncStatus('saved');
          setLastSyncedAt(new Date());
          setErrorMessage(null);

          // After 2.5 seconds, return to 'connected'
          setTimeout(() => {
            setSyncStatus((current) => (current === 'saved' ? 'connected' : current));
          }, 2500);
        } catch (err: unknown) {
          console.error('Failed to save to Firestore:', err);
          setSyncStatus('error');
          const msg = err instanceof Error ? err.message : '저장 실패';
          setErrorMessage(msg);
        }
      }, 600); // 600ms debounce
    },
    []
  );

  // Manual immediate save
  const forceSave = useCallback(async () => {
    setSyncStatus('saving');
    try {
      await setDoc(docRef.current, {
        groupsData,
        formConfig,
        updatedAt: new Date().toISOString(),
      });
      setSyncStatus('saved');
      setLastSyncedAt(new Date());
      setErrorMessage(null);
      setTimeout(() => {
        setSyncStatus((current) => (current === 'saved' ? 'connected' : current));
      }, 2000);
    } catch (err: unknown) {
      console.error('Manual save failed:', err);
      setSyncStatus('error');
      const msg = err instanceof Error ? err.message : '저장 실패';
      setErrorMessage(msg);
    }
  }, [groupsData, formConfig]);

  // Wrapper for updating groupsData
  const updateGroupsData = useCallback(
    (updater: (prev: AllGroupsData) => AllGroupsData) => {
      setGroupsData((prev) => {
        const next = updater(prev);
        triggerAutoSave(next, formConfig);
        return next;
      });
    },
    [formConfig, triggerAutoSave]
  );

  // Wrapper for updating formConfig
  const updateFormConfig = useCallback(
    (updater: (prev: FormConfig) => FormConfig) => {
      setFormConfig((prev) => {
        const next = updater(prev);
        triggerAutoSave(groupsData, next);
        return next;
      });
    },
    [groupsData, triggerAutoSave]
  );

  return {
    groupsData,
    formConfig,
    syncStatus,
    lastSyncedAt,
    errorMessage,
    setGroupsData: updateGroupsData,
    setFormConfig: updateFormConfig,
    forceSave,
  };
}
