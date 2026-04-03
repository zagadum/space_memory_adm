# Access Control: что заполнить в БД

Документ описывает минимальный seed для RBAC c режимами `active | read-only | hidden`.

## 1) Роли (`gls_role`)

```sql
insert into gls_role (code, name, is_system)
values
  ('super-admin', 'Super Admin', true),
  ('admin', 'Admin', true),
  ('teacher', 'Teacher', true),
  ('sales', 'Sales', true),
  ('quality', 'Quality', true),
  ('finance', 'Finance', true),
  ('secretariat', 'Secretariat', true),
  ('hr', 'HR', true)
on conflict (code) do nothing;
```

## 2) Ресурсы (`gls_access_resource`)

Используем единый `resource_key` (он же ключ фронта для роутов и sidebar).

```sql
insert into gls_access_resource (resource_key, resource_name, resource_type, route_name, section_key)
values
  ('dashboard', 'Dashboard', 'route', 'dashboard', null),
  ('my-cabinet', 'My Cabinet', 'route', 'my-cabinet', null),

  ('secretariat', 'Secretariat section', 'section', null, 'secretariat'),
  ('students', 'Students', 'route', 'students-list', 'secretariat'),
  ('groups', 'Groups', 'route', 'groups-list', 'secretariat'),
  ('teachers', 'Teachers', 'route', 'teachers-list', 'secretariat'),
  ('course-endings', 'Course Endings', 'route', 'course-endings', 'secretariat'),

  ('recruitment', 'Recruitment section', 'section', null, 'recruitment'),
  ('new-students', 'New Students', 'route', 'new-students', 'recruitment'),
  ('leads', 'Leads', 'route', 'leads', 'recruitment'),
  ('target-mail', 'Target Mail', 'route', 'target-mail', 'recruitment'),
  ('expelled', 'Expelled Students', 'route', 'expelled-students', 'recruitment'),
  ('new-groups', 'New Groups', 'route', 'new-groups', 'recruitment'),
  ('archived', 'Archived Students', 'route', 'archived-students', 'recruitment'),
  ('import-db', 'Import DB', 'route', 'import-db', 'recruitment'),

  ('finance', 'Finance section', 'section', null, 'finance'),
  ('student-finance', 'Finance Students', 'route', 'finance-students', 'finance'),
  ('debtors', 'Debtors', 'route', 'finance-debtors', 'finance'),
  ('nadplaty', 'Overpayments', 'route', 'finance-nadplaty', 'finance'),
  ('settings', 'Finance Settings', 'route', 'settings', 'finance'),

  ('accounting', 'Accounting section', 'section', null, 'accounting'),
  ('faktury', 'Invoices', 'route', 'accounting-faktury', 'accounting'),
  ('returns', 'Returns', 'route', 'finance-returns', 'accounting'),
  ('projects', 'Projects', 'route', 'projects-list', 'accounting'),
  ('salary-calculator', 'Salary Calculator', 'route', 'salary-calculator', 'accounting'),
  ('finance-ustawienia', 'Accounting Settings', 'route', 'finance-ustawienia', 'accounting'),

  ('hr', 'HR section', 'section', null, 'hr'),
  ('hr-active', 'HR Active', 'route', 'hr-active', 'hr'),
  ('hr-training', 'HR Training', 'route', 'hr-training', 'hr'),
  ('hr-pipeline', 'HR Pipeline', 'route', 'hr-pipeline', 'hr'),
  ('hr-personal', 'HR Personal', 'route', 'hr-personal', 'hr'),
  ('hr-analytics', 'HR Analytics', 'route', 'hr-analytics', 'hr'),

  ('trainer', 'Trainer section', 'section', null, 'trainer'),
  ('trainer-dashboard', 'Trainer Dashboard', 'route', 'trainer-dashboard', 'trainer'),
  ('trainer-students', 'Trainer Students', 'route', 'trainer-students', 'trainer'),
  ('trainer-groups', 'Trainer Groups', 'route', 'trainer-groups', 'trainer'),
  ('lesson-tracker', 'Lesson Tracker', 'route', 'lesson-tracker', 'trainer'),
  ('salary-demo', 'Teacher Salary', 'route', 'teacher-salary', 'trainer'),
  ('trainer-materials', 'Trainer Materials', 'route', 'trainer-materials', 'trainer'),
  ('trainer-exam', 'Trainer Exam', 'route', 'trainer-exam', 'trainer'),
  ('trainer-mail', 'Trainer Mail', 'route', 'trainer-mail', 'trainer'),

  ('quality', 'Quality section', 'section', null, 'quality'),
  ('rezygnacje', 'Resignations', 'route', 'quality-rezygnacje', 'quality'),
  ('holidays-return', 'Holidays Return', 'route', 'quality-holidays', 'quality'),
  ('quality-monitoring', 'Quality Monitoring', 'route', 'quality-monitoring', 'quality'),
  ('quality-analytics', 'Quality Analytics', 'route', 'quality-analytics', 'quality'),
  ('trial-lessons-qd', 'Trial Lessons', 'route', 'quality-trial', 'quality'),
  ('quality-zaliczenia', 'Quality Exams', 'route', 'quality-zaliczenia', 'quality'),
  ('quality-olimpiad', 'Quality Olympiad', 'route', 'quality-olimpiad', 'quality'),
  ('spotkania', 'Meetings', 'route', 'quality-spotkania', 'quality'),
  ('sciezka', 'Path', 'route', 'quality-sciezka', 'quality'),
  ('quality-materials', 'Quality Materials', 'route', 'quality-materials', 'quality'),
  ('zaliczenia-calendar', 'Exam Calendar', 'route', 'quality-zcalendar', 'quality'),
  ('all-tasks', 'All Tasks', 'route', 'quality-all-tasks', 'quality'),
  ('quality-stats', 'Quality Stats', 'route', 'quality-stats', 'quality'),

  ('settings-section', 'Settings section', 'section', null, 'settings-section'),
  ('access-control', 'Access Control', 'route', 'access-control', 'settings-section'),
  ('integrations', 'Integrations', 'route', 'integrations', 'settings-section'),
  ('reports', 'Reports', 'route', 'reports', 'settings-section')
on conflict (resource_key) do nothing;
```

## 3) Привязка пользователей (`gls_user`, `gls_user_role`)

```sql
-- Пример: backend user с id=1001
insert into gls_user (user_type, source_id, is_active)
values ('admin_user', 1001, true)
on conflict (user_type, source_id) do update set is_active = excluded.is_active;

insert into gls_user_role (gls_user_id, gls_role_id, is_primary)
select u.id, r.id, true
from gls_user u
join gls_role r on r.code = 'admin'
where u.user_type = 'admin_user' and u.source_id = 1001
on conflict (gls_user_id, gls_role_id) do nothing;
```

## 4) Матрица роли (`gls_role_access`)

Базово: `hidden` по умолчанию, потом дозаполнение `active/read-only`.

```sql
-- Шаг A: создать hidden для всех role x resource
insert into gls_role_access (gls_role_id, gls_access_resource_id, access_mode)
select r.id, ar.id, 'hidden'
from gls_role r
cross join gls_access_resource ar
on conflict (gls_role_id, gls_access_resource_id) do nothing;

-- Шаг B: супер-админу дать active на всё
update gls_role_access ra
set access_mode = 'active'
from gls_role r
where ra.gls_role_id = r.id and r.code = 'super-admin';

-- Шаг C: admin (без settings-section)
update gls_role_access ra
set access_mode = 'active'
from gls_role r
join gls_access_resource ar on ar.id = ra.gls_access_resource_id
where ra.gls_role_id = r.id
  and r.code = 'admin'
  and ar.resource_key not in ('settings-section', 'access-control', 'integrations', 'reports');

-- Пример read-only для finance на students
update gls_role_access ra
set access_mode = 'read-only'
from gls_role r
join gls_access_resource ar on ar.id = ra.gls_access_resource_id
where ra.gls_role_id = r.id
  and r.code = 'finance'
  and ar.resource_key in ('students');
```

## 5) Overrides (`gls_user_access_override`)

```sql
-- Временный override: конкретному пользователю открыть reports до конца месяца
insert into gls_user_access_override (
  gls_user_id,
  gls_access_resource_id,
  access_mode,
  expires_at
)
select u.id, ar.id, 'active', date_trunc('month', now()) + interval '1 month' - interval '1 second'
from gls_user u
join gls_access_resource ar on ar.resource_key = 'reports'
where u.user_type = 'admin_user' and u.source_id = 1001
on conflict (gls_user_id, gls_access_resource_id)
do update set access_mode = excluded.access_mode, expires_at = excluded.expires_at;
```

## 6) Ревизии матрицы (`gls_access_matrix_revision`)

```sql
insert into gls_access_matrix_revision (version, changed_by_gls_user_id, payload)
values (
  1,
  (select id from gls_user where user_type = 'admin_user' and source_id = 1001),
  jsonb_build_object('source', 'initial-seed')
)
on conflict (version) do nothing;
```

## 7) Контракт API, который должен отдавать backend

`GET /me/access-control`

```json
{
  "role": "finance",
  "version": 12,
  "matrix": {
    "dashboard": "active",
    "students": "read-only",
    "settings": "hidden"
  },
  "overrides": {
    "reports": "active"
  }
}
```

`GET /settings/access-control`

```json
{
  "version": 12,
  "matrix": {
    "students": {
      "super-admin": "active",
      "admin": "active",
      "finance": "read-only"
    }
  }
}
```

`POST /settings/access-control`

```json
{
  "version": 12,
  "matrix": {
    "students": {
      "super-admin": "active",
      "admin": "active",
      "finance": "read-only"
    }
  }
}
```

Response:

```json
{ "ok": true, "version": 13, "savedAt": "2026-04-03T10:30:00Z" }
```

