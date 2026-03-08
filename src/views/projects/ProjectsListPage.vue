<template>
  <div class="projects-page">
    <div class="page-hdr">
      <div>
        <div class="page-title">{{ t('projects.title') }}</div>
        <div class="page-sub">{{ t('projects.subTitle') }}</div>
      </div>
      <div class="hdr-actions">
        <button class="btn btn-ghost btn-sm">↓ {{ t('common.export') || 'Eksport' }}</button>
        <button class="btn btn-primary" @click="handleNewProject">＋ {{ t('projects.newProject') }}</button>
      </div>
    </div>

    <div class="tabs">
      <div 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ t(`projects.tabs.${tab.id}`) }}
        <span class="tab-count" v-if="tab.count !== undefined">({{ tab.count }})</span>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-wrap">
        <span class="si">🔍</span>
        <input type="text" v-model="searchQuery" :placeholder="t('common.search') || 'Szukaj projektu...'">
      </div>
      <select class="fsel" v-model="statusFilter">
        <option value="all">{{ t('common.allStatuses') || 'Wszystkie statusy' }}</option>
        <option value="active">{{ t('common.active') || 'Aktywne' }}</option>
        <option value="inactive">{{ t('common.inactive') || 'Nieaktywne' }}</option>
      </select>
    </div>

    <div class="proj-grid">
      <ProjectCard 
        v-for="project in filteredProjects" 
        :key="project.id" 
        :project="project"
        @edit="handleEditProject"
      />

      <div class="add-card" @click="handleNewProject">
        <div class="add-ico">＋</div>
        <div class="add-lbl">{{ t('projects.newProject') }}</div>
        <div class="add-sub" v-html="t('projects.newProjectSub')"></div>
      </div>
    </div>

    <!-- MODALS -->
    <ProjectModal :is-open="isAddModalOpen" @close="isAddModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectsStore } from '../../stores/projects.store';
import ProjectCard from '../../components/projects/ProjectCard.vue';
import ProjectModal from '../../components/projects/ProjectModal.vue';
import type { Project } from '../../types/projects';

const { t } = useI18n();
const projectsStore = useProjectsStore();

const activeTab = ref('all');
const searchQuery = ref('');
const statusFilter = ref('all');
const isAddModalOpen = ref(false);

const tabs = computed(() => [
  { id: 'all', count: projectsStore.projects.length },
  { id: 'recurring', count: projectsStore.recurringProjects.length },
  { id: 'onetime', count: projectsStore.oneTimeProjects.length },
  { id: 'archive', count: projectsStore.archivedProjects.length }
]);

const filteredProjects = computed(() => {
  return projectsStore.projects.filter(p => {
    // Tab filter
    if (activeTab.value !== 'all' && p.type !== activeTab.value && activeTab.value !== 'archive') return false;
    if (activeTab.value === 'archive' && p.status !== 'archive') return false;
    if (activeTab.value !== 'archive' && p.status === 'archive') return false;

    // Search filter
    if (searchQuery.value && !p.name.toLowerCase().includes(searchQuery.value.toLowerCase())) return false;

    // Status filter
    if (statusFilter.value !== 'all' && p.status !== statusFilter.value) return false;

    return true;
  });
});

const handleNewProject = () => {
  isAddModalOpen.value = true;
};

const handleEditProject = (project: Project) => {
  console.log('Edit project', project);
};
</script>

<style scoped>
.projects-page {
  padding: 24px 20px 80px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-hdr {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: var(--white);
}
.page-sub {
  font-size: 13px;
  color: var(--dim);
  margin-top: 4px;
}

.hdr-actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-primary {
  background: linear-gradient(135deg, #4f6ef7, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 16px rgba(79, 110, 247, 0.3);
}
.btn-primary:hover {
  box-shadow: 0 6px 24px rgba(79, 110, 247, 0.5);
  transform: translateY(-1px);
}
.btn-ghost {
  background: rgba(255, 255, 255, 0.035);
  color: var(--dim);
  border: 1px solid var(--b);
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--white);
}
.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--b);
  margin-bottom: 22px;
}
.tab {
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dim);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
  white-space: nowrap;
}
.tab:hover { color: var(--white); }
.tab.active {
  color: var(--blue);
  border-bottom-color: var(--blue);
  font-weight: 700;
}
.tab-count {
  opacity: 0.6;
  margin-left: 6px;
  font-size: 11px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.search-wrap {
  flex: 1;
  min-width: 240px;
  position: relative;
}
.search-wrap input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  background: var(--card);
  border: 1px solid var(--b);
  border-radius: 10px;
  font-size: 13px;
  color: var(--white);
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: all 0.2s;
}
.search-wrap input:focus { border-color: rgba(79, 110, 247, 0.4); box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1); }
.si {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--dim);
}
.fsel {
  padding: 9px 14px;
  background: var(--card);
  border: 1px solid var(--b);
  border-radius: 10px;
  font-size: 13px;
  color: var(--white);
  font-family: 'Outfit', sans-serif;
  outline: none;
  cursor: pointer;
  min-width: 160px;
}

.proj-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.add-card {
  background: transparent;
  border: 1.5px dashed rgba(79, 110, 247, 0.25);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 24px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 240px;
  box-sizing: border-box;
}
.add-card:hover {
  border-color: rgba(79, 110, 247, 0.6);
  background: rgba(79, 110, 247, 0.05);
  transform: translateY(-2px);
}
.add-ico {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(79, 110, 247, 0.12);
  border: 1px solid rgba(79, 110, 247, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--blue);
}
.add-lbl {
  font-size: 15px;
  font-weight: 700;
  color: var(--blue);
}
.add-sub {
  font-size: 12px;
  color: var(--dim);
  text-align: center;
  line-height: 1.6;
  max-width: 240px;
}

@media(max-width: 640px) {
  .proj-grid { grid-template-columns: 1fr; gap: 16px; }
  .projects-page { padding: 16px 14px 60px; }
}
</style>
