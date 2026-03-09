/**
 * GROUPS TAB API REFERENCE
 * Полный справочник по API и диалоговым окнам для вкладки "Группы"
 * 
 * Маршрут: /students/s_{studentId}/groups
 */

import type { Enrollment } from "@/api/mockDb";

/**
 * ОСНОВНЫЕ API МЕТОДЫ
 */

// 1. Получение групп студента
export interface GetStudentGroupsResponse {
  items: StudentGroup[];
}

export interface StudentGroup {
  school: string;              // Space Memory | Speedy Mind Indigo
  group: string;               // G1, G2, etc
  teacher: string;             // Имя тренера
  lessons: Lesson[];           // Список занятий
  enrollments: Enrollment[];   // История групп
}

// GET /api/student/groups?studentId={studentId}

// 2. Получение информации студента
export interface GetStudentInfoResponse {
  info: StudentInfo;
}

export interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  parentName?: string;
  parentPhone?: string;
  joinDate: string;
  status: string;  // active | inactive | suspended
}

// GET /api/student/info?studentId={studentId}

// 3. Получение посещаемости
export interface GetStudentAttendanceResponse {
  attendance: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  lessonId: string;
  date: string;
  mark: string;    // Присутствовал | Отсутствовал | Болел | Опоздал
  note?: string;
  markedBy: string;
  markedAt: string;
}

// GET /api/student/attendance?studentId={studentId}

// 4. Получение прогресса
export interface GetStudentProgressResponse {
  progress: ProgressData;
}

export interface ProgressData {
  totalLessons: number;
  attendedLessons: number;
  missedLessons: number;
  averageScore: number;
  improvementTrend: string;  // up | down | stable
}

// GET /api/student/progress?studentId={studentId}

// 5. Получение заметок
export interface GetStudentNotesResponse {
  items: StudentNote[];
}

export interface StudentNote {
  id: string;
  type: string;               // observation | improvement | warning | achievement
  direction: string;          // positive | neutral | negative
  category: string;
  status: string;
  tags: string[];
  text: string;
  createdBy: string;
  createdAt: string;
}

// GET /api/student/notes?studentId={studentId}

/**
 * ОПЕРАЦИИ (POST МЕТОДЫ)
 */

// 6. Изменение группы студента
export interface ChangeStudentGroupPayload {
  studentId: string;
  programId: string;
  fromGroup: string;
  toGroup: string;
  reason?: string;
}

export interface ChangeStudentGroupResponse {
  ok: boolean;
}

// POST /api/student/change-group

// 7. Установка отметки о посещении
export interface SetAttendanceMarkPayload {
  studentId: string;
  attendanceId: string;
  mark: string;              // Присутствовал | Отсутствовал | Болел | Опоздал
  note?: string;
}

export interface SetAttendanceMarkResponse {
  ok: boolean;
}

// POST /api/student/attendance

// 8. Установка присутствия тренера
export interface SetTrainerPresencePayload {
  studentId: string;
  groupId: string;
  trainerId: string;
  presence: string;          // present | absent | late | makeup
}

export interface SetTrainerPresenceResponse {
  ok: boolean;
}

// POST /api/student/trainer-presence

// 9. Обновление информации студента
export interface UpdateStudentInfoPayload {
  studentId: string;
  patch: Partial<StudentInfo>;
}

export interface UpdateStudentInfoResponse {
  ok: boolean;
  info: StudentInfo;
}

// POST /api/student/info

// 10. Создание заметки
export interface CreateStudentNotePayload {
  studentId: string;
  type: string;              // observation | improvement | warning | achievement
  direction: string;         // positive | neutral | negative
  category: string;
  status: string;
  tags: string[];
  text: string;
}

export interface CreateStudentNoteResponse {
  ok: boolean;
  note: StudentNote;
}

// POST /api/student/notes

/**
 * ТИПЫ ДИАЛОГОВЫХ ОКОН
 */

export interface GroupsModalPayloads {
  attendance: {
    enrollmentId: string;
    studentId: string;
    schoolName: string;
    lessonId: string;
    lessonNum: number;
    date: string;
    currentAttendance: string;
    history: AttendanceHistory[];
  };
  'attendance-status': {
    studentId: string;
    attendanceId: string;
    currentMark: string;
  };
  'trainer-presence': {
    group: GroupData;
    trainer: TrainerData;
  };
}

export interface AttendanceHistory {
  author: string;
  date: string;
  action: string;
}

export interface GroupData {
  id: string;
  school: string;
  group: string;
  programTitle: string;
  trainers: TrainerData[];
}

export interface TrainerData {
  id: string;
  name: string;
  presence?: string;
}

/**
 * ДИАЛОГОВЫЕ ОКНА (MODALS)
 * 
 * Все модальные окна используют useModalStore():
 * 
 * import { useModalStore } from "@/stores/modal.store";
 * const modal = useModalStore();
 * 
 * modal.openModal(modalId, payload);
 * modal.close();
 */

export const GROUPS_MODALS = {
  ATTENDANCE: 'attendance',           // Отметить явку
  ATTENDANCE_STATUS: 'attendance-status', // Статус явки
  TRAINER_PRESENCE: 'trainer-presence',   // Присутствие тренера
} as const;

/**
 * КОМПОНЕНТЫ, ИСПОЛЬЗУЮЩИЕ ГРУППОВЫЕ API
 */

export const GROUPS_COMPONENTS = {
  // Основной компонент вкладки
  GroupsTab: 'src/views/students/components/profile-tabs/GroupsTab.vue',
} as const;

/**
 * МОДАЛЬНЫЕ ОКНА
 */

export const GROUPS_MODAL_COMPONENTS = {
  AttendanceModal: 'src/modals/templates/AttendanceModal.vue',
  AttendanceStatusModal: 'src/modals/templates/AttendanceStatusModal.vue',
  TrainerPresenceModal: 'src/modals/templates/TrainerPresenceModal.vue',
} as const;

/**
 * ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
 */

export const GROUPS_API_EXAMPLES = {
  /**
   * Пример 1: Получить группы студента
   */
  getGroupsExample: `
    import { getStudentGroups } from '@/api/studentApi';
    
    const groups = await getStudentGroups('s_2');
    console.log(groups.items);
    
    // Результат:
    // [{
    //   school: 'Space Memory',
    //   group: 'G1',
    //   teacher: 'John Doe',
    //   lessons: [...],
    //   enrollments: [...]
    // }, ...]
  `,

  /**
   * Пример 2: Отметить явку студента
   */
  setAttendanceExample: `
    import { setAttendanceMark } from '@/api/studentApi';
    
    await setAttendanceMark({
      studentId: 's_2',
      attendanceId: 'att_001',
      mark: 'Присутствовал',
      note: 'Был внимателен'
    });
  `,

  /**
   * Пример 3: Отметить присутствие тренера
   */
  setTrainerPresenceExample: `
    import { setTrainerPresence } from '@/api/studentApi';
    
    await setTrainerPresence({
      studentId: 's_2',
      groupId: 'grp_001',
      trainerId: 'tr_001',
      presence: 'present'
    });
  `,

  /**
   * Пример 4: Переводить студента в другую группу
   */
  changeGroupExample: `
    import { changeStudentGroup } from '@/api/studentApi';
    
    await changeStudentGroup({
      studentId: 's_2',
      programId: 'prog_001',
      fromGroup: 'G1',
      toGroup: 'G2',
      reason: 'Student request'
    });
  `,

  /**
   * Пример 5: Открыть модаль явки
   */
  openAttendanceModalExample: `
    import { useModalStore } from '@/stores/modal.store';
    
    const modal = useModalStore();
    
    modal.openModal('attendance', {
      enrollmentId: 'Space Memory',
      studentId: 's_2',
      schoolName: 'Space Memory',
      lessonId: 'lesson_001',
      lessonNum: 10,
      date: '2026-03-06',
      currentAttendance: 'Присутствовал',
      history: [
        {
          author: 'John Doe',
          date: '2026-03-06',
          action: 'Отмечено: Присутствовал'
        }
      ]
    });
  `,
} as const;

/**
 * ПОТОК ДАННЫХ
 */

export const GROUPS_DATA_FLOW = `
1. ИНИЦИАЛИЗАЦИЯ (GroupsTab.vue)
   ↓
   useStudentTabsStore() инициализируется
   ↓
   getStudentGroups(studentId)
   ↓
   GET /api/student/groups?studentId={studentId}
   ↓
   Заполнение store данными

2. ОТОБРАЖЕНИЕ
   ↓
   Для каждой группы:
   ├── Статистика посещений
   ├── Таблица занятий
   ├── История групп
   └── Точки явки (интерактивные)

3. ДЕЙСТВИЕ: Отметить явку
   ↓
   Клик на точку явки
   ↓
   openAttendanceModal(enrollment, lesson, lessonNum)
   ↓
   AttendanceModal.vue отображается
   ↓
   Пользователь выбирает статус
   ↓
   Клик "Сохранить"
   ↓
   lesson.attendance = новый статус (локально)
   ↓
   modal.closeModal()
   ↓
   UI обновляется
`;

/**
 * КОНТРОЛЬНЫЙ СПИСОК ДЛЯ РАЗРАБОТЧИКА
 */

export const DEVELOPMENT_CHECKLIST = [
  '[ ] Добавить метод в src/api/studentApi.ts',
  '[ ] Создать Modal компонент (если нужно)',
  '[ ] Добавить ID модали в stores/modal.store.ts',
  '[ ] Добавить импорт и условие в ModalHost.vue',
  '[ ] Добавить кнопку/триггер в компонент',
  '[ ] Добавить локализованные тексты в locales/*.json',
  '[ ] Реализовать валидацию формы',
  '[ ] Добавить обработку ошибок (try-catch)',
  '[ ] Добавить await tabs.loadGroups(studentId) после успеха',
  '[ ] Добавить modal.close() после успешной операции',
  '[ ] Тестировать с VITE_USE_MOCK=true',
  '[ ] Тестировать с реальным API',
  '[ ] Проверить типизацию TypeScript',
];

/**
 * ПОЛЕЗНЫЕ ССЫЛКИ И РЕСУРСЫ
 */

export const RESOURCES = {
  // API
  apiFile: 'src/api/studentApi.ts',
  mockDbFile: 'src/api/mockDb.ts',
  httpFile: 'src/api/http.ts',

  // Stores
  studentTabsStore: 'src/stores/studentTabs.store.ts',
  modalStore: 'src/stores/modal.store.ts',

  // Components
  groupsTabFile: 'src/views/students/components/profile-tabs/GroupsTab.vue',
  modalsDir: 'src/modals/templates/',

  // Config
  localesDir: 'src/locales/',
  envFile: '.env.local',

  // Documentation
  documentationFile: 'API_GROUPS_GUIDE.md',
  routerFile: 'src/app/router.ts',
};

/**
 * СТАТУСЫ ЯВКИ
 */

export const ATTENDANCE_STATUSES = {
  PRESENT: 'Присутствовал',
  ABSENT: 'Отсутствовал',
  FUTURE: 'Будет',
  SICK: 'Болел',
  LATE: 'Опоздал',
} as const;

/**
 * СТАТУСЫ ПЛАТЕЖЕЙ
 */

export const PAYMENT_STATUSES = {
  PAID: 'Оплачено',
  PENDING: 'Ожидает',
  MAKEUP: 'Отработка',
} as const;

/**
 * СТАТУСЫ ПРИСУТСТВИЯ ТРЕНЕРА
 */

export const TRAINER_PRESENCE_STATUSES = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  MAKEUP: 'makeup',
} as const;

/**
 * ТИПЫ ШКОЛ
 */

export const SCHOOL_TYPES = {
  SPACE_MEMORY: 'Space Memory',
  SPEEDY_MIND_INDIGO: 'Speedy Mind Indigo',
} as const;

/**
 * ТИПЫ ЗАМЕТОК
 */

export const NOTE_TYPES = {
  OBSERVATION: 'observation',
  IMPROVEMENT: 'improvement',
  WARNING: 'warning',
  ACHIEVEMENT: 'achievement',
} as const;

/**
 * НАПРАВЛЕНИЯ ЗАМЕТОК
 */

export const NOTE_DIRECTIONS = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
} as const;

