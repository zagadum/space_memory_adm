<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-badge">
        <div class="logo-icon">
          <img src="http://indigomental-sklep.pl/wp-content/uploads/2026/03/Edugls-logo.png" alt="GLS Logo" class="brand-logo" />
        </div>
        <div>
          <div class="logo-text">GLS Admin</div>
          <div class="logo-sub">Space Memory</div>
        </div>
      </div>
      <RouterLink to="/projects" class="school-pill-link" active-class="active">
        <div class="school-pill">
          <div class="school-dot"></div>
          <div>
            <div class="school-name">{{ t('sidebar.allProjects') }}</div>
            <div class="school-city">GLS Network</div>
          </div>
        </div>
      </RouterLink>
    </div>

    <nav class="sidebar-nav">
      <div 
        class="nav-standalone" 
        :class="{ active: activeItem === 'dashboard' }" 
        @click="setActive('dashboard')"
      >
        <span class="nav-icon">🏠</span> {{ t('sidebar.dashboard') }}
      </div>

      <div 
        class="nav-section" 
        :class="{ open: openSections.secretariat }" 
        @click="toggleSection('secretariat')"
      >
        <span class="nav-section-icon">🗂️</span>
        <span class="nav-section-label">{{ t('sidebar.secretariat') }}</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div class="nav-children" :class="{ open: openSections.secretariat }">
        
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'students' }" 
          @click="setActive('students')"
        >
          <span class="nav-icon">👩‍🚀</span> {{ t('sidebar.students') }}
          <span class="nav-badge green" v-if="listStore.totalStudents > 0">{{ listStore.totalStudents }}</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'groups' }" 
          @click="setActive('groups')"
        >
          <span class="nav-icon">🎓</span> {{ t('sidebar.groups') }}
          <span class="nav-badge blue">12</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'teachers' }" 
          @click="setActive('teachers')"
        >
          <span class="nav-icon">👨‍🏫</span> {{ t('sidebar.teachers') }}
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'docs' }" 
          @click="setActive('docs')"
        >
          <span class="nav-icon">📄</span> {{ t('sidebar.docs') }}
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'inpost' }" 
          @click="setActive('inpost')"
        >
          <span class="nav-icon">📦</span> {{ t('sidebar.inpost') }}
        </div>
      </div>

      <div 
        class="nav-section" 
        :class="{ open: openSections.finance }" 
        @click="toggleSection('finance')"
      >
        <span class="nav-section-icon">💫</span>
        <span class="nav-section-label">{{ t('sidebar.finance') }}</span>
        <span class="nav-section-badge nb-red">7</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div class="nav-children" :class="{ open: openSections.finance }">
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'returns' }" 
          @click="setActive('returns')"
        >
          <span class="nav-icon">🔙</span> {{ t('sidebar.returns') }}
          <span class="nav-badge cyan">2</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'projects' }" 
          @click="navigateTo('projects', '/projects')"
        >
          <span class="nav-icon">📁</span> {{ t('sidebar.projects') }}
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'settings' }" 
          @click="setActive('settings')"
        >
          <span class="nav-icon">⚙️</span> {{ t('sidebar.settings') }}
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'salary-demo' }" 
          @click="navigateTo('salary-demo', '/teacher/salary')"
        >
          <span class="nav-icon">👛</span> {{ t('sidebar.salaryDemo') }}
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'salary-calculator' }" 
          @click="navigateTo('salary-calculator', '/finance/salary-calculator')"
        >
          <span class="nav-icon">📊</span> {{ t('sidebar.salaryCalculator') }}
        </div>
      </div>

      <div 
        class="nav-section" 
        :class="{ open: openSections.analytics }" 
        @click="toggleSection('analytics')"
      >
        <span class="nav-section-icon">📉</span>
        <span class="nav-section-label">{{ t('sidebar.analytics') }}</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div class="nav-children" :class="{ open: openSections.analytics }">
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'performance-metrics' }" 
          @click="navigateTo('performance-metrics', '/analytics/performance')"
        >
          <span class="nav-icon">⚡</span> {{ t('sidebar.performanceMetrics') }}
        </div>
      </div>

      <div 
        class="nav-section" 
        :class="{ open: openSections.recruitment }" 
        @click="toggleSection('recruitment')"
      >
        <span class="nav-section-icon">🚀</span>
        <span class="nav-section-label">{{ t('sidebar.recruitment') }}</span>
        <span class="nav-section-badge nb-green">8</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div class="nav-children" :class="{ open: openSections.recruitment }">
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'new-students' }" 
          @click="setActive('new-students')"
        >
          <span class="nav-icon">🌟</span> {{ t('sidebar.newStudents') }}
          <span class="nav-badge green">8</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'leads' }" 
          @click="navigateTo('leads', '/recruitment/leads')"
        >
          <span class="nav-icon">📋</span> {{ t('sidebar.leads') }}
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'new-groups' }" 
          @click="navigateTo('new-groups', '/recruitment/new-groups')"
        >
          <span class="nav-icon">🎓</span> {{ t('sidebar.newGroups') }}
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'expelled' }" 
          @click="setActive('expelled')"
        >
          <span class="nav-icon">📤</span> {{ t('sidebar.expelled') }}
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'recruit-archive' }" 
          @click="setActive('recruit-archive')"
        >
          <span class="nav-icon">🗃️</span> {{ t('sidebar.archive') }}
        </div>
      </div>

    </nav>

    <div class="sidebar-lang">
      <select class="lang-select" :value="locale" @change="onLocale(($event.target as HTMLSelectElement).value)">
        <option value="ru">Русский</option>
        <option value="uk">🇺🇦 Українська</option>
        <option value="pl">🇵🇱 Polski</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>

    <div class="sidebar-bottom" v-if="authStore.user">
      <div class="user-card">
        <div class="user-avatar">{{ authStore.user?.initials || '??' }}</div>
        <div class="user-info">
          <div class="user-name">{{ authStore.user?.name || 'User' }}</div>
          <div class="user-role">{{ authStore.user?.role || 'Admin' }}</div>
        </div>
        <button class="logout-btn" @click.stop="handleLogout" :title="t('app.logout')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../app/i18n'

// Подключаем сторы
import { useStudentsListStore } from '../../stores/studentsList.store'
import { useAuthStore } from '../../stores/auth.store'

const router = useRouter()
const route = useRoute()
const { locale, t } = useI18n()

// Инициализируем сторы
const listStore = useStudentsListStore()
const authStore = useAuthStore()

// Логика смены языка
function onLocale(l: string) {
  setLocale(l as any)
}

// Функция выхода
const handleLogout = () => {
  if (authStore.logout) {
    authStore.logout()
  }
  router.push('/auth/sign-in')
}

const openSections = ref<Record<string, boolean>>({
  secretariat: true,
  finance: false,
  analytics: false,
  recruitment: false,
})

const activeItem = ref('students')

watch(() => route.path, (path) => {
  if (path.startsWith('/recruitment/leads')) {
    activeItem.value = 'leads'
    openSections.value.recruitment = true
  } else if (path.startsWith('/recruitment/new-groups')) {
    activeItem.value = 'new-groups'
    openSections.value.recruitment = true
  } else if (path.startsWith('/projects')) {
    activeItem.value = 'projects'
    openSections.value.finance = true
  } else if (path.startsWith('/students')) {
    activeItem.value = 'students'
  } else if (path.startsWith('/teacher/salary')) {
    activeItem.value = 'salary-demo'
    openSections.value.finance = true
  } else if (path.startsWith('/finance/salary-calculator')) {
    activeItem.value = 'salary-calculator'
    openSections.value.finance = true
  } else if (path.startsWith('/analytics/performance')) {
    activeItem.value = 'performance-metrics'
    openSections.value.analytics = true
  } else if (path === '/' || path === '/dashboard') {
    activeItem.value = 'dashboard'
  }
}, { immediate: true })

const toggleSection = (section: string) => {
  openSections.value[section] = !openSections.value[section]
}

const setActive = (item: string) => {
  activeItem.value = item
  if (item === 'dashboard') {
    router.push('/')
  } else if (item === 'students') {
    router.push('/students')
  } else if (item === 'settings') {
    router.push('/finance/settings')
  }
}

const navigateTo = (item: string, path: string) => {
  activeItem.value = item
  router.push(path)
}
</script>

<style scoped>
.sidebar { 
  position: fixed; left: 0; top: 0; bottom: 0; width: 240px; 
  background: rgba(7,7,32,0.97); border-right: 1px solid var(--space-border, rgba(100,120,255,0.15)); 
  z-index: 100; display: flex; flex-direction: column; backdrop-filter: blur(20px); 
}
.sidebar-logo { padding: 20px 16px 16px; border-bottom: 1px solid var(--space-border, rgba(100,120,255,0.15)); flex-shrink: 0; }
.logo-badge { display: flex; align-items: center; gap: 12px; }
.logo-icon { 
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; 
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
}
.logo-text { font-size: 15px; font-weight: 800; color: #e8eeff; letter-spacing: 0.01em; }
.logo-sub { font-size: 9.5px; color: #8892b0; font-family: 'Space Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 1px; }
.brand-logo {
  height: 42px;
  width: auto;
  object-fit: contain;
  background: transparent !important;
}

.school-pill { margin-top: 10px; display: flex; align-items: center; gap: 7px; padding: 6px 9px; background: rgba(79,110,247,0.07); border: 1px solid rgba(79,110,247,0.18); border-radius: 8px; }
.school-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px #10b981; flex-shrink: 0; }
.school-name { font-size: 11.5px; font-weight: 600; color: #e8eeff; }
.school-city { font-size: 10px; color: #8892b0; }

.sidebar-nav { padding: 10px; flex: 1; overflow-y: auto; }
.sidebar-nav::-webkit-scrollbar { width: 3px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(79,110,247,0.2); border-radius: 2px; }

.nav-section { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 9px; cursor: pointer; margin-top: 3px; margin-bottom: 1px; transition: all 0.18s; position: relative; user-select: none; }
.nav-section:hover { background: rgba(79,110,247,0.07); }
.nav-section.open { background: rgba(79,110,247,0.1); }
.nav-section-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
.nav-section-label { font-size: 12.5px; font-weight: 700; color: #e8eeff; flex: 1; }
.nav-section-arrow { font-size: 10px; color: #8892b0; transition: transform 0.2s; flex-shrink: 0; }
.nav-section.open .nav-section-arrow { transform: rotate(90deg); }

.nav-children { overflow: hidden; max-height: 0; transition: max-height 0.28s cubic-bezier(0.4,0,0.2,1); padding-left: 12px; }
.nav-children.open { max-height: 500px; }

.nav-item, .nav-standalone { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-radius: 7px; cursor: pointer; transition: all 0.15s; color: #8892b0; font-size: 12.5px; font-weight: 400; margin-bottom: 1px; position: relative; }
.nav-item:hover, .nav-standalone:hover { background: rgba(79,110,247,0.09); color: #e8eeff; }
.nav-item.active, .nav-standalone.active { background: linear-gradient(90deg, rgba(79,110,247,0.2), rgba(139,92,246,0.1)); color: #e8eeff; border: 1px solid rgba(79,110,247,0.28); }
.nav-item.active::before, .nav-standalone.active::before { content: ''; position: absolute; left: 0; top: 20%; bottom: 20%; width: 3px; background: linear-gradient(180deg, #4f6ef7, #8b5cf6); border-radius: 2px; }

.nav-icon { font-size: 13px; width: 16px; text-align: center; flex-shrink: 0; }
.nav-badge { margin-left: auto; color: white; font-size: 9.5px; font-weight: 700; font-family: 'Space Mono', monospace; padding: 1px 5px; border-radius: 8px; }
.nav-badge.green { background: #10b981; }
.nav-badge.blue { background: #4f6ef7; }
.nav-badge.red { background: #ef4444; }
.nav-badge.cyan { background: #06b6d4; }
.nav-section-badge { font-size: 9.5px; font-weight: 700; padding: 1px 5px; border-radius: 8px; margin-right: 5px; }
.nb-red { background: #ef4444; color: #fff; }
.nb-green { background: #10b981; color: #fff; }

/* === Стили для селекта языка === */
.sidebar-lang { padding: 0 16px 10px; flex-shrink: 0; }
.lang-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(100, 120, 255, 0.15);
  color: #8892b0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.lang-select:hover {
  background: rgba(79, 110, 247, 0.08);
  color: #e8eeff;
  border-color: rgba(120, 140, 255, 0.35);
}
.lang-select option {
  background: #0d0d2b;
  color: #e8eeff;
}

.sidebar-bottom { padding: 14px 10px; border-top: 1px solid var(--space-border, rgba(100,120,255,0.15)); flex-shrink: 0; }
.user-card { display: flex; align-items: center; gap: 9px; padding: 7px 8px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.user-card:hover { background: rgba(255,255,255,0.04); }
.user-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: white; flex-shrink: 0; }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 12px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 10px; color: #8892b0; }

.logout-btn { background: transparent; border: none; color: #8892b0; cursor: pointer; padding: 8px; border-radius: 8px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; margin-left: auto; }
.logout-btn svg { transition: transform 0.2s ease; }
.logout-btn:hover { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
.logout-btn:hover svg { transform: translateX(2px); }
</style>