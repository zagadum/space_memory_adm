<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-badge">
        <div class="logo-icon">🌌</div>
        <div>
          <div class="logo-text">GLS Admin</div>
          <div class="logo-sub">Space Memory</div>
        </div>
      </div>
      <div class="school-pill">
        <div class="school-dot"></div>
        <div>
          <div class="school-name">Warsaw — Centrum</div>
          <div class="school-city">ul. Marszałkowska 10</div>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div 
        class="nav-standalone" 
        :class="{ active: activeItem === 'dashboard' }" 
        @click="setActive('dashboard')"
      >
        <span class="nav-icon">🏠</span> Дашборд
      </div>

      <div 
        class="nav-section" 
        :class="{ open: openSections.secretariat }" 
        @click="toggleSection('secretariat')"
      >
        <span class="nav-section-icon">🗂️</span>
        <span class="nav-section-label">Секретариат</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div class="nav-children" :class="{ open: openSections.secretariat }">
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'students' }" 
          @click="setActive('students')"
        >
          <span class="nav-icon">👩‍🚀</span> Ученики
          <span class="nav-badge green">42</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'groups' }" 
          @click="setActive('groups')"
        >
          <span class="nav-icon">🎓</span> Группы
          <span class="nav-badge blue">12</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'teachers' }" 
          @click="setActive('teachers')"
        >
          <span class="nav-icon">👨‍🏫</span> Учителя
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'docs' }" 
          @click="setActive('docs')"
        >
          <span class="nav-icon">📄</span> Документы / шаблоны
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'inpost' }" 
          @click="setActive('inpost')"
        >
          <span class="nav-icon">📦</span> Заказы InPost
        </div>
      </div>

      <div 
        class="nav-section" 
        :class="{ open: openSections.finance }" 
        @click="toggleSection('finance')"
      >
        <span class="nav-section-icon">💫</span>
        <span class="nav-section-label">Финансы</span>
        <span class="nav-section-badge nb-red">7</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div class="nav-children" :class="{ open: openSections.finance }">
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'returns' }" 
          @click="setActive('returns')"
        >
          <span class="nav-icon">🔙</span> Возвраты
          <span class="nav-badge cyan">2</span>
        </div>
      </div>

      <div 
        class="nav-section" 
        :class="{ open: openSections.recruitment }" 
        @click="toggleSection('recruitment')"
      >
        <span class="nav-section-icon">🚀</span>
        <span class="nav-section-label">Рекрутация</span>
        <span class="nav-section-badge nb-green">8</span>
        <span class="nav-section-arrow">›</span>
      </div>
      <div class="nav-children" :class="{ open: openSections.recruitment }">
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'new-students' }" 
          @click="setActive('new-students')"
        >
          <span class="nav-icon">🌟</span> Новые ученики
          <span class="nav-badge green">8</span>
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'new-groups' }" 
          @click="navigateTo('new-groups', '/recruitment/new-groups')"
        >
          <span class="nav-icon">🎓</span> Новые группы
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'expelled' }" 
          @click="setActive('expelled')"
        >
          <span class="nav-icon">📤</span> Выписанные ученики
        </div>
        <div 
          class="nav-item" 
          :class="{ active: activeItem === 'recruit-archive' }" 
          @click="setActive('recruit-archive')"
        >
          <span class="nav-icon">🗃️</span> Архив
        </div>
      </div>

    </nav>

    <div class="sidebar-bottom">
      <div class="user-card">
        <div class="user-avatar">АР</div>
        <div class="user-info">
          <div class="user-name">Артём</div>
          <div class="user-role">Отдел продаж</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const openSections = ref<Record<string, boolean>>({
  secretariat: true,
  finance: false,
  recruitment: false,
})

const activeItem = ref('students')

watch(() => route.path, (path) => {
  if (path.startsWith('/recruitment/new-groups')) {
    activeItem.value = 'new-groups'
    openSections.value.recruitment = true
  } else if (path.startsWith('/students')) {
    activeItem.value = 'students'
  }
}, { immediate: true })

const toggleSection = (section: string) => {
  openSections.value[section] = !openSections.value[section]
}

const setActive = (item: string) => {
  activeItem.value = item
  if (item === 'students') {
    router.push('/students')
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
.logo-badge { display: flex; align-items: center; gap: 10px; }
.logo-icon { 
  width: 36px; height: 36px; background: linear-gradient(135deg, #4f6ef7, #8b5cf6); 
  border-radius: 10px; display: flex; align-items: center; justify-content: center; 
  font-size: 18px; box-shadow: 0 0 20px rgba(79,110,247,0.4); flex-shrink: 0; 
}
.logo-text { font-size: 15px; font-weight: 800; color: #e8eeff; letter-spacing: 0.01em; }
.logo-sub { font-size: 9.5px; color: #8892b0; font-family: 'Space Mono', monospace; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 1px; }

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

.sidebar-bottom { padding: 14px 10px; border-top: 1px solid var(--space-border, rgba(100,120,255,0.15)); flex-shrink: 0; }
.user-card { display: flex; align-items: center; gap: 9px; padding: 7px 8px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.user-card:hover { background: rgba(255,255,255,0.04); }
.user-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: white; flex-shrink: 0; }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 12px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 10px; color: #8892b0; }
</style>