<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useContractorsStore } from '../../stores/contractors.store';
import UiButton from '../../components/ui/UiButton.vue';
import UiInput from '../../components/ui/UiInput.vue';
import UiTable from '../../components/ui/UiTable.vue';
import UiBadge from '../../components/ui/UiBadge.vue';
import { useModalStore } from '../../stores/modal.store';

const { t } = useI18n();
const store = useContractorsStore();
const modal = useModalStore();

const searchQuery = ref('');
const currentPage = ref(1);

const fetch = () => {
  store.fetchContractors({
    page: currentPage.value,
    search: searchQuery.value,
    per_page: 20
  });
};

const handleSearch = () => {
  currentPage.value = 1;
  fetch();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetch();
};

const handleAddContractor = () => {
  modal.open('create-contractor', {
    onSuccess: () => fetch()
  });
};

const handleEditContractor = (contractor: any) => {
  modal.open('create-contractor', {
    contractor,
    onSuccess: () => fetch()
  });
};

const handleDeleteContractor = async (id: number) => {
  if (confirm(t('common.confirmDelete'))) {
    try {
      await store.deleteContractor(id);
    } catch (err) {
      alert(t('common.error'));
    }
  }
};

onMounted(() => {
  fetch();
});
</script>

<template>
  <div class="content">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ t('sidebar.contractors') }}</h1>
        <p class="page-subtitle">{{ t('finance.contractorsSubtitle') }}</p>
      </div>
      <div class="header-actions">
        <UiButton variant="primary" @click="handleAddContractor">
          ➕ {{ t('common.add') }}
        </UiButton>
      </div>
    </header>

    <!-- Filters -->
    <div class="toolbar-section">
      <div class="search-box">
        <UiInput
          v-model="searchQuery"
          :placeholder="t('search.contractors')"
          @keyup.enter="handleSearch"
        >
          <template #prefix>🔍</template>
        </UiInput>
      </div>
      <UiButton variant="secondary" @click="handleSearch">{{ t('common.search') }}</UiButton>
    </div>

    <!-- List Section -->
    <UiCard class="table-card">
      <UiTable
        :loading="store.isLoading"
        :items="store.contractors"
        :total="store.total"
        :page="currentPage"
        :per-page="20"
        @page-change="handlePageChange"
      >
        <template #head>
          <tr>
            <th>{{ t('finance.contractorName') }}</th>
            <th>{{ t('finance.taxId') }}</th>
            <th>{{ t('finance.contactInfo') }}</th>
            <th>{{ t('finance.location') }}</th>
            <th>{{ t('common.status') }}</th>
            <th class="actions-col"></th>
          </tr>
        </template>

        <template #row="{ item }">
          <tr class="table-row">
            <td>
              <div class="contractor-cell">
                <span class="contractor-name">{{ item.name }}</span>
                <span v-if="item.notes" class="contractor-notes">{{ item.notes }}</span>
              </div>
            </td>
            <td>
              <UiBadge variant="default" bold>{{ item.tax_id || '—' }}</UiBadge>
            </td>
            <td>
              <div class="contact-details">
                <div v-if="item.email" class="detail">📧 {{ item.email }}</div>
                <div v-if="item.phone" class="detail">📞 {{ item.phone }}</div>
              </div>
            </td>
            <td>
              <div class="location-cell">
                <span class="location-text">{{ item.city }}, {{ item.country }}</span>
              </div>
            </td>
            <td>
              <UiBadge :variant="item.is_active ? 'success' : 'danger'">
                {{ item.is_active ? t('common.active') : t('common.inactive') }}
              </UiBadge>
            </td>
            <td class="actions-col">
              <div class="actions-group">
                <UiButton size="sm" variant="ghost" @click="handleEditContractor(item)">✏️</UiButton>
                <UiButton size="sm" variant="ghost" class="text-danger" @click="handleDeleteContractor(item.id)">🗑️</UiButton>
              </div>
            </td>
          </tr>
        </template>
      </UiTable>
    </UiCard>
  </div>
</template>

<style scoped>
.content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--app-text-main);
  margin: 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--app-text-dim);
  margin-top: 4px;
}

/* Toolbar */
.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  width: 320px;
}

/* Table Section */
.table-card { padding: 0 !important; }

.contractor-cell { display: flex; flex-direction: column; gap: 2px; }
.contractor-name { font-weight: 700; color: var(--app-text-main); font-size: 14px; font-family: 'Outfit', sans-serif; }
.contractor-notes { font-size: 11px; color: var(--app-text-dim); }

.contact-details { display: flex; flex-direction: column; gap: 2px; }
.detail { font-size: 13px; color: var(--app-text-dim); }

.location-cell { display: flex; align-items: center; }
.location-text { font-size: 13px; color: var(--app-text-main); font-weight: 500; }

.actions-col { text-align: right; width: 120px; }
.actions-group { display: flex; justify-content: flex-end; gap: 4px; }

:deep(.ui-badge.bold) { font-family: 'Space Mono', monospace; letter-spacing: 0.05em; font-size: 12px; }
</style>
