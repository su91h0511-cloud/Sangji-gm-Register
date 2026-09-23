export interface TrainingInfo {
  title: string;
  date: string; // 날짜와 시간을 구분 없이 자유롭게 입력 (예: 2026년 9월 24일(목) 15:30 ~ 17:30)
  time?: string;
  location: string;
  organizer: string;
  instructor: string;
  notes: string;
  institution?: string; // 하단 기관명 (예: 상지여자중학교)
}

export interface Participant {
  id: string;
  category: string;     // 구분 (예: 강사, 진행, 수강생, 일반, 학부모)
  department: string;   // 소속 부서 / 학부모회 등
  grade?: string;       // 학년 (학부모 연수 시)
  classNum?: string;    // 반 (학부모 연수 시)
  position: string;     // 직위 (예: 팀장, 수석연구원, 대리)
  name: string;         // 이름 / 성명 / 학생 이름
  signature?: string;   // 서명 / 학부모 서명 (이미지 데이터 또는 텍스트/공란)
  remarks?: string;     // 비고
}

export type RowHeight = 'compact' | 'normal' | 'spacious';
export type FormStyle = 'clean' | 'navy' | 'classic';

export type TargetGroup = 'teacher' | 'staff' | 'parents' | 'other' | 'meeting';

export interface GroupConfig {
  id: TargetGroup;
  label: string;
  shortLabel: string;
  description: string;
}

export const TARGET_GROUPS: GroupConfig[] = [
  {
    id: 'teacher',
    label: '교사',
    shortLabel: '교사',
    description: '수업 및 학생지도 담당 교과·담임·부장교사 연수',
  },
  {
    id: 'staff',
    label: '교직원',
    shortLabel: '교직원',
    description: '교원 및 행정실·교육공무직 등 학교 전체 교직원 연수',
  },
  {
    id: 'parents',
    label: '학부모',
    shortLabel: '학부모',
    description: '학부모회, 학부모 아카데미, 학교설명회 및 상담 연수',
  },
  {
    id: 'other',
    label: '교직원(강사포함)',
    shortLabel: '교직원(강사포함)',
    description: '교직원 및 외부·초빙강사, 산학겸임강사 포함 직무연수 및 교육',
  },
  {
    id: 'meeting',
    label: '협의회 등록부',
    shortLabel: '협의회',
    description: '교과 협의회, 학년 협의회, 부서 및 각종 위원회 회의·협의회 등록부',
  },
];

export interface GroupDataset {
  trainingInfo: TrainingInfo;
  participants: Participant[];
}

export type AllGroupsData = Record<TargetGroup, GroupDataset>;

export interface FormConfig {
  rowsPerPage: number;
  rowHeight: RowHeight;
  style: FormStyle;
  showRemarks: boolean;
  showAdminColumn: boolean;
  paperOrientation: 'portrait' | 'landscape';
  fillEmptyRows?: boolean;
}
