# 🔧 Готовое решение: использование studentId из URL

Это готовый код для передачи `studentId` через URL параметры.

## 1. Обновить router.ts

```typescript
import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "../layouts/AppLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import PaymentsTab from "../tabs/PaymentsTab.vue";
import GroupsTab from "../tabs/GroupsTab.vue";
import InfoTab from "../tabs/InfoTab.vue";
import AttendanceTab from "../tabs/AttendanceTab.vue";
import ProgressTab from "../tabs/ProgressTab.vue";
import NotesTab from "../tabs/NotesTab.vue";
import SignInPage from "../tabs/SignInPage.vue";
import { useAuthStore } from "../stores/auth.store";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/auth",
      component: AuthLayout,
      meta: { public: true },
      children: [{ path: "sign-in", name: "sign-in", component: SignInPage }],
    },
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "", redirect: to => ({ name: "payments", params: { studentId: "s_1" } }) },
        { path: "payments/:studentId", name: "payments", component: PaymentsTab },
        { path: "groups/:studentId", name: "groups", component: GroupsTab },
        { path: "info/:studentId", name: "info", component: InfoTab },
        { path: "attendance/:studentId", name: "attendance", component: AttendanceTab },
        { path: "progress/:studentId", name: "progress", component: ProgressTab },
        { path: "notes/:studentId", name: "notes", component: NotesTab },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/payments/s_1" },
  ],
});

router.beforeEach((to) => {
  if (to.meta.public) return true;
  const auth = useAuthStore();
  if (!auth.isAuthenticated) return { name: "sign-in" };
  return true;
});
```

## 2. Обновить PaymentsTab.vue

Добавить на строку после `const modal = useModalStore();`:

```typescript
import { useRoute } from "vue-router";

// ...

const route = useRoute();
const studentId = route.params.studentId as string;

onMounted(() => {
  const sid = route.params.studentId as string || "s_1";
  if (!payments.student) payments.loadStudent(sid);
});

// Если нужно следить за изменением studentId:
watch(() => route.params.studentId, (newId) => {
  if (newId) payments.loadStudent(newId);
});
```

## 3. Аналогично обновить остальные табы

**GroupsTab.vue:**
```typescript
import { useRoute } from "vue-router";
// ...
const route = useRoute();

onMounted(async () => {
  const studentId = route.params.studentId as string;
  // используйте studentId вместо "s_1"
});
```

**InfoTab.vue:**
```typescript
import { useRoute } from "vue-router";
// ...
const route = useRoute();

onMounted(async () => {
  const studentId = route.params.studentId as string;
  // используйте studentId вместо "s_1"
});
```

И так далее для других табов...

## 4. Обновить AppHeader.vue (если показывает информацию студента)

```typescript
import { useRoute } from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const studentId = route.params.studentId as string;
    
    // используйте studentId для отображения информации
    return { studentId };
  }
}
```

## Тестирование

**URL примеры:**
- `/payments/s_1` - платежи студента s_1
- `/groups/s_1` - группы студента s_1
- `/payments/s_2` - платежи студента s_2
- `/info/student_123` - информация любого студента

**В коде (программная навигация):**
```typescript
import { useRouter } from "vue-router";

const router = useRouter();

// Перейти на профиль другого студента
router.push({ 
  name: "payments", 
  params: { studentId: "s_2" } 
});

// Или через URL
router.push("/payments/s_2");
```

---

**Готово!** Теперь `studentId` передается через URL параметры. 🎉

