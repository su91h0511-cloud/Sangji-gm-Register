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

export type TargetGroup = 'teacher' | 'staff' | 'parents' | 'other';

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
    label: '그 외',
    shortLabel: '그 외',
    description: '학교운영위원회, 지역사회 자문위원, 외부 강사 및 지원인력 연수',
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
