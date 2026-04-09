<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useContractorsStore } from '@/stores/contractors.store';
import UiButton from '@/components/ui/UiButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiTable from '@/components/ui/UiTable.vue';
import UiBadge from '@/components/ui/UiBadge.vue';
import { useModal } from '@/composables/useModal';

const { t } = useI18n();
const store = useContractorsStore();
const { openModal } = useModal();

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
  openModal('CreateContractorModal', {
    onSuccess: () => fetch()
  });
};

const handleEditContractor = (contractor: any) => {
  openModal('CreateContractorModal', {
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
  <div class="contractors-page">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ t('sidebar.contractors') }}</h1>
        <p class="page-subtitle">{{ t('finance.contractorsSubtitle') }}</p>
      </div>
      <div class="header-actions">
        <UiButton type="primary" size="lg" @click="handleAddContractor">
          <span class="icon">➕</span> {{ t('common.add') }}
        </UiButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card shadow-sm">
      <div class="filter-group">
        <UiInput
          v-model="searchQuery"
          :placeholder="t('search.contractors')"
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>🔍</template>
        </UiInput>
        <UiButton type="secondary" @click="handleSearch">{{ t('common.search') }}</UiButton>
      </div>
    </div>

    <!-- List -->
    <div class="content-card shadow-sm">
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
            <th>{{ t('finance.taxId') }} (NIP)</th>
            <th>{{ t('finance.contactInfo') }}</th>
            <th>{{ t('finance.location') }}</th>
            <th>{{ t('common.status') }}</th>
            <th class="text-right">{{ t('common.actions') }}</th>
          </tr>
        </template>

        <template #row="{ item }">
          <tr>
            <td>
              <div class="contractor-info">
                <span class="contractor-name">{{ item.name }}</span>
                <span v-if="item.notes" class="contractor-notes">{{ item.notes }}</span>
              </div>
            </td>
            <td>
              <UiBadge type="neutral" bold>{{ item.tax_id || '—' }}</UiBadge>
            </td>
            <td>
              <div class="contact-details">
                <div v-if="item.email" class="detail"><span class="icon">📧</span> {{ item.email }}</div>
                <div v-if="item.phone" class="detail"><span class="icon">📞</span> {{ item.phone }}</div>
              </div>
            </td>
            <td>
              <div class="location-details">
                {{ item.city }}, {{ item.country }}
              </div>
            </td>
            <td>
              <UiBadge :type="item.is_active ? 'success' : 'danger'">
                {{ item.is_active ? t('common.active') : t('common.inactive') }}
              </UiBadge>
            </td>
            <td class="text-right">
              <div class="actions-group">
                <UiButton size="sm" type="ghost" @click="handleEditContractor(item)">✏️</UiButton>
                <UiButton size="sm" type="ghost" class="text-danger" @click="handleDeleteContractor(item.id)">🗑️</UiButton>
              </div>
            </td>
          </tr>
        </template>
      </UiTable>
    </div>
  </div>
</template>

<style scoped>
.contractors-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: var(--text-primary);
}

.page-subtitle {
  color: var(--text-secondary);
  margin: 0;
}

.filters-card {
  background: var(--bg-card);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-group {
  display: flex;
  gap: 8px;
  flex: 1;
  max-width: 600px;
}

.search-input {
  flex: 1;
}

.content-card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 8px;
  overflow: hidden;
}

.contractor-info {
  display: flex;
  flex-direction: column;
}

.contractor-name {
  font-weight: 600;
  color: var(--text-primary);
}

.contractor-notes {
  font-size: 12px;
  color: var(--text-secondary);
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}

.actions-group {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

/* Transitions */
.content-card :deep(tbody tr) {
  transition: background 0.2s ease;
}

.content-card :deep(tbody tr:hover) {
  background: var(--bg-hover);
}
</style>
