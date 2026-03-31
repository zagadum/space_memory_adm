<template>
  <div class="leads-page">
    <header class="leads-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('sidebar.leads') }}</h1>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="openInviteModal()">＋ {{ t('recruitment.inviteLead') }}</button>
      </div>
    </header>

    <div class="kanban-board">
      <div 
        v-for="column in columns" 
        :key="column.id" 
        class="kanban-column"
        @dragover.prevent
        @drop="onDrop(column.id as LeadStatus)"
      >
        <div class="column-header">
          <h2 class="column-title">
            {{ t(`leads.columns.${column.id}`) }}
            <span class="column-count">{{ getLeadsByStatus(column.id as LeadStatus).length }}</span>
          </h2>
          <button class="column-more">•••</button>
        </div>

        <div class="column-cards">
          <div 
            v-for="lead in getLeadsByStatus(column.id as LeadStatus)" 
            :key="lead.id" 
            class="lead-card"
            draggable="true"
            @dragstart="onDragStart(lead.id)"
          >
            <div class="card-header">
              <span class="lead-name">{{ lead.name }}</span>
              <span class="lead-date">{{ lead.createdAt }}</span>
            </div>
            <div class="card-body">
              <div class="card-info">
                <span class="info-label">{{ t('leads.card.phone') }}</span>
                <span class="info-value">{{ lead.phone }}</span>
              </div>
              <div class="card-info">
                <span class="info-label">{{ t('leads.card.subject') }}</span>
                <span class="info-value subject-tag">{{ lead.subject }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="lead-avatar">{{ lead.name && lead.name.split(' ').map(n => n[0]).join('') }}</div>
              <div class="action-btns">
                <button class="icon-btn" :title="t('recruitment.inviteLead')" @click="openInviteModal(lead)">✉️</button>
                <button class="icon-btn">📞</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useLeadsStore, type LeadStatus } from '../../stores/leads.store';
import { useGlobalSearchStore } from '../../stores/globalSearch.store';
import { useModalStore } from '../../stores/modal.store';
import type { RecruitmentBackend } from '../../api/http';

const { t } = useI18n();
const route = useRoute();
const leadsStore = useLeadsStore();
const searchStore = useGlobalSearchStore();
const modalStore = useModalStore();
const recruitmentBackend = computed<RecruitmentBackend>(() => route.meta.recruitmentBackend === 'indigo' ? 'indigo' : 'default');

const columns = [
  { id: 'new' },
  { id: 'in_progress' },
  { id: 'trial' },
  { id: 'decision' }
];

const getLeadsByStatus = (status: LeadStatus) => {
  const q = searchStore.queryLower;
  return leadsStore.leads.filter(l => {
    if (l.status !== status) return false;
    if (q && !l.name.toLowerCase().includes(q)
         && !(l.phone || '').toLowerCase().includes(q)
         && !(l.subject || '').toLowerCase().includes(q)) return false;
    return true;
  });
};

const openInviteModal = (lead?: any) => {
  modalStore.open('invite-lead', { lead });
};

watch(recruitmentBackend, () => {
  leadsStore.fetchLeads(recruitmentBackend.value);
}, { immediate: true });

// Drag & Drop Logic
let draggedLeadId: string | null = null;

const onDragStart = (id: string) => {
  draggedLeadId = id;
};

const onDrop = (newStatus: LeadStatus) => {
  if (draggedLeadId) {
    leadsStore.moveLead(draggedLeadId, newStatus, recruitmentBackend.value);
    draggedLeadId = null;
  }
};
</script>

<style scoped>
.leads-page {
  padding: 24px;
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.leads-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--app-text-main);
  margin: 0 0 8px 0;
}

.dot.blue { background: #4f6ef7; box-shadow: 0 0 8px rgba(79,110,247,0.4); }

/* Kanban Board */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  flex: 1;
  min-height: 0; /* Important for inner scrolling */
}

@media (max-width: 1024px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kanban-board {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
  .leads-page {
    height: auto;
    min-height: calc(100vh - 64px);
  }
}

.kanban-column {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.column-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--app-border);
}

.column-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--app-text-main);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-count {
  font-size: 11px;
  background: var(--status-info-bg);
  padding: 2px 6px;
  border-radius: 10px;
  color: var(--blue);
}

.column-more {
  background: none;
  border: none;
  color: var(--app-text-dim);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.column-cards {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-cards::-webkit-scrollbar { width: 4px; }
.column-cards::-webkit-scrollbar-thumb { background: rgba(79, 110, 247, 0.2); border-radius: 2px; }

/* Lead Card */
.lead-card {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 16px;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--app-shadow);
}

.lead-card:hover {
  transform: translateY(-2px);
  border-color: var(--blue);
  background: var(--app-card);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.lead-card:active {
  cursor: grabbing;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.lead-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--app-text-main);
}

.lead-date {
  font-size: 10px;
  color: var(--app-text-dim);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.card-info {
  display: flex;
  gap: 6px;
  font-size: 12px;
}

.info-label {
  color: #8892b0;
}

.info-value {
  color: #e8eeff;
}

.subject-tag {
  background: rgba(79, 110, 247, 0.15);
  color: #4f6ef7;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--app-border);
}

.lead-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f6ef7, #8b5cf6);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  font-size: 12px;
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--status-info-bg);
  border-color: var(--blue);
}

/* Dragging state */
.lead-card[draggable="true"] {
  user-select: none;
}
</style>
