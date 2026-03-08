<template>
  <div class="leads-page">
    <header class="leads-header">
      <div class="header-left">
        <h1 class="page-title">{{ t('leads.title') }}</h1>
        <div class="leads-stats">
          <span class="stat-item"><span class="dot blue"></span> {{ leadsStore.leads.length }} {{ t('dashboard.stats.newLeads') }}</span>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-primary">＋ {{ t('dashboard.quickActions.addStudent') }}</button>
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
              <div class="lead-avatar">{{ lead.name.split(' ').map(n => n[0]).join('') }}</div>
              <div class="action-btns">
                <button class="icon-btn">📞</button>
                <button class="icon-btn">💬</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useLeadsStore, type LeadStatus } from '../../stores/leads.store';

const { t } = useI18n();
const leadsStore = useLeadsStore();

const columns = [
  { id: 'new' },
  { id: 'in_progress' },
  { id: 'trial' },
  { id: 'decision' }
];

const getLeadsByStatus = (status: LeadStatus) => {
  return leadsStore.leads.filter(l => l.status === status);
};

// Drag & Drop Logic
let draggedLeadId: string | null = null;

const onDragStart = (id: string) => {
  draggedLeadId = id;
};

const onDrop = (newStatus: LeadStatus) => {
  if (draggedLeadId) {
    leadsStore.moveLead(draggedLeadId, newStatus);
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
  color: var(--white, #fff);
  margin: 0 0 8px 0;
}

.leads-stats {
  font-size: 13px;
  color: var(--dim, #8892b0);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
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

.kanban-column {
  background: rgba(12, 12, 36, 0.4);
  border: 1px solid rgba(100, 120, 255, 0.1);
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
  border-bottom: 1px solid rgba(100, 120, 255, 0.05);
}

.column-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-count {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: 10px;
  color: #8892b0;
}

.column-more {
  background: none;
  border: none;
  color: #8892b0;
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
  background: rgba(20, 20, 50, 0.8);
  border: 1px solid rgba(100, 120, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.lead-card:hover {
  transform: translateY(-2px);
  border-color: rgba(79, 110, 247, 0.4);
  background: rgba(30, 30, 70, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  color: #fff;
}

.lead-date {
  font-size: 10px;
  color: #8892b0;
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
  border-top: 1px solid rgba(100, 120, 255, 0.05);
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
  background: rgba(255, 255, 255, 0.05);
  border: none;
  font-size: 12px;
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Dragging state */
.lead-card[draggable="true"] {
  user-select: none;
}
</style>
