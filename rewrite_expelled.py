import re

def rewrite_page():
    with open('src/views/recruitment/ExpelledStudentsPage.vue', 'r') as f:
        content = f.read()

    template = """<template>
  <div class="content">

    <!-- Заголовок страницы (в table-toolbar) -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          📤 {{ t('expelled.pageTitle') }}
          <span class="section-count">инструмент повторных продаж · дозакрытие</span>
        </div>
      </div>
    </div>

    <!-- 4 карточки статистики -->
    <div class="stats-grid">
      <div class="stat-card blue">
        <div class="stat-label">{{ t('expelled.stats.total') }}</div>
        <div class="stat-value">{{ store.stats?.total ?? 0 }}</div>
        <div class="stat-sub">{{ t('expelled.stats.totalSub') }}</div>
        <div class="stat-icon">📞</div>
      </div>

      <div class="stat-card amber">
        <div class="stat-label">{{ t('expelled.stats.hot') }}</div>
        <div class="stat-value">{{ store.stats?.hot ?? 0 }}</div>
        <div class="stat-sub"><span class="warn">{{ t('expelled.stats.hotSub') }}</span></div>
        <div class="stat-icon">🔥</div>
      </div>

      <div class="stat-card cyan">
        <div class="stat-label">{{ t('expelled.stats.none') }}</div>
        <div class="stat-value">{{ store.stats?.none ?? 0 }}</div>
        <div class="stat-sub">{{ t('expelled.stats.noneSub') }}</div>
        <div class="stat-icon">📵</div>
      </div>

      <div class="stat-card green">
        <div class="stat-label">{{ t('expelled.stats.unpaid') }}</div>
        <div class="stat-value">{{ store.stats?.unpaid ?? 0 }}</div>
        <div class="stat-sub"><span class="up">{{ t('expelled.stats.unpaidSub') }}</span></div>
        <div class="stat-icon">💳</div>
      </div>
    </div>

    <!-- Bulk-бар -->
    <div v-if="store.selectedIds.length > 0" class="table-toolbar" style="background: var(--status-info-bg); padding: 12px; border-radius: 12px; border: 1px solid var(--border);">
      <div class="toolbar-left">
        <span style="font-weight: bold; color: var(--blue);">{{ store.selectedIds.length }} {{ t('expelled.bulk.selected') }}</span>
      </div>
      <div class="toolbar-right">
        <button class="btn btn-ghost" @click="showBulkAssignModal = true">👤 {{ t('expelled.bulk.assign') }}</button>
        <button class="btn btn-danger" @click="openBulkArchive">🗃️ {{ t('expelled.bulk.archive') }}</button>
        <button class="btn btn-ghost" @click="store.clearSelection()">✕ {{ t('expelled.bulk.deselect') }}</button>
      </div>
    </div>

    <!-- Тулбар с фильтрами -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <div class="section-title">
          СПИСОК
          <span class="section-count">{{ filtered.length }}</span>
        </div>
      </div>
      <div class="toolbar-right">
        <!-- Поиск -->
        <div class="search-box">
          <input v-model="search" type="text"
            class="dropdown-filter-btn"
            style="min-width: 200px;"
            :placeholder="t('expelled.filter.search')" />
        </div>

        <!-- Фильтр: Ответственный -->
        <select v-model="filterManager" class="dropdown-filter-btn">
          <option value="all">{{ t('expelled.filter.allManagers') }}</option>
          <option value="__none__">{{ t('expelled.filter.noManager') }}</option>
          <option v-for="m in managerOptions" :key="m" :value="m">{{ m }}</option>
        </select>

        <!-- Фильтр: Группа -->
        <select v-model="filterGroup" class="dropdown-filter-btn">
          <option value="all">{{ t('expelled.filter.allGroups') }}</option>
          <option v-for="g in groupOptions" :key="g" :value="g">{{ g }}</option>
        </select>

        <!-- Фильтр: Последний контакт -->
        <select v-model="filterContact" class="dropdown-filter-btn">
          <option value="all">{{ t('expelled.filter.contactAny') }}</option>
          <option value="none">{{ t('expelled.filter.contactNone') }}</option>
          <option value="hot">{{ t('expelled.filter.contactHot') }}</option>
          <option value="week">{{ t('expelled.filter.contactWeek') }}</option>
          <option value="today">{{ t('expelled.filter.contactToday') }}</option>
        </select>

        <!-- Сортировка -->
        <select v-model="sortBy" class="dropdown-filter-btn">
          <option value="con_asc">{{ t('expelled.sort.conAsc') }}</option>
          <option value="con_desc">{{ t('expelled.sort.conDesc') }}</option>
          <option value="exp_asc">{{ t('expelled.sort.expAsc') }}</option>
          <option value="exp_desc">{{ t('expelled.sort.expDesc') }}</option>
        </select>
      </div>
    </div>

    <!-- Loading / Error / Empty / Таблица -->
    <div v-if="store.isLoading" class="table-toolbar" style="justify-content: center; padding: 40px;">
      <span class="section-title" style="color: var(--dim);">{{ t('expelled.loading') }}</span>
    </div>

    <div v-else-if="store.error" class="table-toolbar" style="justify-content: center; padding: 40px;">
      <span class="section-title" style="color: #ef4444;">{{ store.error }}</span>
    </div>

    <div v-else-if="!filtered.length" class="table-toolbar" style="justify-content: center; padding: 60px; flex-direction: column; gap: 10px;">
      <span style="font-size: 40px; opacity: 0.3;">📤</span>
      <span class="section-title">{{ t('expelled.empty.title') }}</span>
      <span style="color: var(--dim); font-size: 13px;">{{ t('expelled.empty.sub') }}</span>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" style="cursor: pointer;" />
            </th>
            <th>{{ t('expelled.table.name') }}</th>
            <th>{{ t('expelled.table.group') }}</th>
            <th>{{ t('expelled.table.type') }}</th>
            <th style="text-align: center;">{{ t('expelled.table.paid') }}</th>
            <th>{{ t('expelled.table.expelled') }}</th>
            <th>{{ t('expelled.table.lastContact') }}</th>
            <th>{{ t('expelled.table.manager') }}</th>
            <th>{{ t('expelled.table.comment') }}</th>
            <th class="actions-header">···</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id" class="table-row"
            :style="isHot(s) ? { boxShadow: 'inset 3px 0 0 #ef4444', backgroundColor: 'rgba(239,68,68,0.03)' } : {}">

            <td style="text-align: center;">
              <input type="checkbox"
                :checked="store.selectedIds.includes(s.id)"
                @change="store.toggleSelect(s.id)"
                style="cursor: pointer;" />
            </td>

            <td>
              <div class="name-cell">
                <span class="student-name">{{ s.name }}</span>
                <span class="student-meta">{{ s.phone }}</span>
              </div>
            </td>

            <td>
              <div class="group-cell">
                <span class="group-dot" style="background: var(--blue);"></span>
                <span class="group-name">{{ s.group }}</span>
              </div>
            </td>

            <td>
              <span class="chip" :style="s.type === 'individual' ? 'border-color: var(--blue); color: var(--blue);' : 'border-color: var(--purple); color: var(--purple);'">
                {{ s.type === 'individual' ? '👤 ' + t('expelled.table.typeIndividual') : '👥 ' + t('expelled.table.typeGroup') }}
              </span>
            </td>

            <td style="text-align: center; font-size: 16px;">{{ s.paid ? '✅' : '❌' }}</td>

            <td><span class="date-mono">{{ formatDate(s.expelled) }}</span></td>

            <td>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <input type="date"
                  :value="s.lastContact ?? ''"
                  class="dropdown-filter-btn"
                  style="width: 140px; padding: 4px 8px; font-family: 'Space Mono', monospace;"
                  @change="onFieldChange(s.id, 'lastContact', ($event.target as HTMLInputElement).value)" />
                <span class="chip" style="font-size: 10px; padding: 2px 6px; width: fit-content;"
                  :style="s.lastContact ? (isHot(s) ? 'background: #ef444422; color: #ef4444; border-color: #ef4444' : 'background: #10b98122; color: #10b981; border-color: #10b981') : 'background: var(--surface);'">
                  {{ contactTagText(s.lastContact) }}
                </span>
              </div>
            </td>

            <td>
              <select
                :value="s.manager"
                class="dropdown-filter-btn"
                style="max-width: 120px; padding: 4px 8px;"
                @change="onFieldChange(s.id, 'manager', ($event.target as HTMLSelectElement).value)">
                <option value="">— Нет —</option>
                <option v-for="m in MANAGERS" :key="m" :value="m">{{ m }}</option>
              </select>
            </td>

            <td>
              <input type="text"
                :value="s.comment"
                placeholder="Добавить..."
                class="dropdown-filter-btn"
                style="width: 140px; padding: 4px 8px;"
                @change="onFieldChange(s.id, 'comment', ($event.target as HTMLInputElement).value)" />
            </td>

            <td>
              <div class="actions-wrap" @click.stop>
                <button class="actions-btn" @click="toggleActMenu(s.id)">⋮</button>
                <div class="actions-dropdown" :class="{ open: actMenuId === s.id }">
                  <div v-if="isManager" class="action-item" style="color: var(--green);" @click="openTransfer(s)">⭐ {{ t('expelled.actions.transferAny') }}</div>
                  <div v-if="isManager" class="action-divider"></div>
                  <div class="action-item" @click="openTransfer(s)">🔄 {{ t('expelled.actions.transfer') }}</div>
                  <div class="action-divider"></div>
                  <div class="action-item" @click="markToday(s.id)">📞 {{ t('expelled.actions.callToday') }}</div>
                  <div class="action-divider"></div>
                  <div class="action-item" @click="openHistory(s)">📋 {{ t('expelled.actions.history') }}</div>
                  <div class="action-divider"></div>
                  <div class="action-item danger" @click="openArchive(s)">🗃️ {{ t('expelled.actions.archive') }}</div>
                </div>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
      
      <div class="pagination-footer">
        <span class="pagination-info">{{ t('expelled.showing', { shown: filtered.length, total: store.stats?.total ?? 0 }) }}</span>
      </div>
    </div>

    <!-- Компоненты-панели -->
    <ExpelledHistoryPanel v-model="showHistoryPanel" :student="activeStudent" />
    <ExpelledTransferPanel v-model="showTransferPanel" :student="activeStudent" @transfer="onTransferConfirmed" />

    <!-- Модалка: назначить менеджера -->
    <Teleport to="body">
      <div class="modal-backdrop" :class="{ active: showBulkAssignModal }" @click.self="showBulkAssignModal = false">
        <div class="modal" style="width: 400px;">
          <div class="popup-title">👤 {{ t('expelled.bulk.assign') }}</div>
          <div class="popup-sub">Для {{ store.selectedIds.length }} учеников</div>
          
          <label class="popup-label">{{ t('expelled.table.manager') }}</label>
          <select v-model="bulkManager" class="modal-input">
            <option value="">— Выберите —</option>
            <option v-for="m in MANAGERS" :key="m" :value="m">{{ m }}</option>
          </select>
          
          <div class="popup-actions">
            <button class="btn btn-ghost" @click="showBulkAssignModal = false">{{ t('common.cancel') }}</button>
            <button class="btn btn-primary" @click="confirmBulkAssign">{{ t('expelled.actions.apply') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модалка: Архивация одного -->
    <Teleport to="body">
      <div class="modal-backdrop" :class="{ active: showArchiveModal }" @click.self="showArchiveModal = false">
        <div class="modal" style="width: 500px;">
          <div class="popup-title">🗃️ {{ t('expelled.archiveTitle') }}</div>
          <div class="popup-sub">{{ t('expelled.archiveSub') }}</div>
          
          <label class="popup-label">{{ t('expelled.archiveReason') }}</label>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
            <label v-for="r in archiveReasons" :key="r" class="chip" style="justify-content: flex-start; padding: 10px 14px;" :class="{ active: archiveReason === r }">
              <input type="radio" v-model="archiveReason" :value="r" style="margin-right: 8px;" />
              {{ r }}
            </label>
          </div>
          
          <div v-if="archiveReason === 'Другое'">
            <label class="popup-label">{{ t('expelled.archiveSpecify') }}</label>
            <input type="text" v-model="archiveCustomReason" :placeholder="t('common.add')" class="modal-input" />
          </div>
          
          <div class="popup-actions">
            <button class="btn btn-ghost" @click="showArchiveModal = false">{{ t('common.cancel') }}</button>
            <button class="btn btn-danger" @click="confirmArchive">🗃️ {{ t('expelled.actions.archive') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модалка: Массовая архивация -->
    <Teleport to="body">
      <div class="modal-backdrop" :class="{ active: showBulkArchiveModal }" @click.self="showBulkArchiveModal = false">
        <div class="modal" style="width: 500px;">
          <div class="popup-title">🗃️ {{ t('expelled.bulk.archive') }}</div>
          <div class="popup-sub">Для {{ store.selectedIds.length }} учеников</div>
          
          <label class="popup-label">{{ t('expelled.archiveReason') }}</label>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
            <label v-for="r in archiveReasons" :key="r" class="chip" style="justify-content: flex-start; padding: 10px 14px;" :class="{ active: bulkArchiveReason === r }">
              <input type="radio" v-model="bulkArchiveReason" :value="r" style="margin-right: 8px;" />
              {{ r }}
            </label>
          </div>
          
          <div class="popup-actions">
            <button class="btn btn-ghost" @click="showBulkArchiveModal = false">{{ t('common.cancel') }}</button>
            <button class="btn btn-danger" @click="confirmBulkArchive">🗃️ {{ t('expelled.actions.archiveAll') }}</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>"""

    new_content = re.sub(r'<template>.*?</template>', template, content, flags=re.DOTALL)
    with open('src/views/recruitment/ExpelledStudentsPage.vue', 'w') as f:
        f.write(new_content)

def rewrite_history_panel():
    with open('src/views/recruitment/components/expelled/ExpelledHistoryPanel.vue', 'r') as f:
        content = f.read()

    template = """<template>
  <div class="sp-overlay" :class="{ active: modelValue }" @click="emit('update:modelValue', false)"></div>
  <div class="student-panel" :class="{ open: modelValue }" style="width: 460px;">
    
    <div class="panel-head">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <div class="section-title">📋 {{ student?.name }}</div>
          <div class="student-meta" style="margin-top: 4px;">{{ student?.group }} · {{ student?.phone }}</div>
        </div>
        <button class="actions-btn" @click="emit('update:modelValue', false)">✕</button>
      </div>
    </div>

    <div class="sp-body">
      <div v-if="!student || !student.history.length" style="color: var(--dim); padding: 20px 0;">
        История пуста
      </div>
      <div v-else>
        <div v-for="(item, idx) in [...student.history].reverse()" :key="idx" style="display: flex; gap: 16px; margin-bottom: 20px;">
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div class="group-dot" :style="{ background: item.color, marginTop: '5px' }"></div>
            <div v-if="idx < student.history.length - 1" style="width: 2px; flex: 1; background: var(--border); margin-top: 6px; min-height: 20px;"></div>
          </div>
          <div style="padding-bottom: 4px;">
            <div style="font-weight: 600; color: var(--app-text-main); font-size: 14px;">{{ item.event }}</div>
            <div class="date-mono" style="font-size: 11px; color: var(--dim); margin-top: 2px;">{{ formatDate(item.date) }}</div>
            <div style="font-size: 13px; color: var(--dim); margin-top: 6px; line-height: 1.5;">{{ item.detail }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>"""

    new_content = re.sub(r'<template>.*?</template>', template, content, flags=re.DOTALL)
    with open('src/views/recruitment/components/expelled/ExpelledHistoryPanel.vue', 'w') as f:
        f.write(new_content)

def rewrite_transfer_panel():
    with open('src/views/recruitment/components/expelled/ExpelledTransferPanel.vue', 'r') as f:
        content = f.read()

    template = """<template>
  <div class="sp-overlay" :class="{ active: modelValue }" @click="emit('update:modelValue', false)"></div>
  <div class="student-panel" :class="{ open: modelValue }" style="width: 400px;">
    
    <div class="panel-head">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <div class="section-title">🔄 Перенести в группу</div>
          <div class="student-meta" style="margin-top: 4px;">{{ student?.name }}</div>
        </div>
        <button class="actions-btn" @click="emit('update:modelValue', false)">✕</button>
      </div>
    </div>

    <div class="sp-body">
      <div class="popup-label" style="margin-bottom: 16px;">Выберите активную группу</div>
      
      <div class="enrollment-list" style="gap: 12px;">
        <div v-for="g in MOCK_GROUPS" :key="g.id" 
          class="table-row"
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.2s;"
          :style="selectedGroupId === g.id ? 'border-color: var(--blue); background: var(--status-info-bg);' : 'background: var(--card);'"
          @click="selectedGroupId = g.id">
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="group-dot" style="background: var(--blue);"></div>
            <div>
              <div style="font-weight: 600; color: var(--app-text-main); font-size: 13.5px;">{{ g.name }}</div>
              <div class="student-meta">{{ g.teacher }}</div>
            </div>
          </div>
          
          <div class="date-mono" :style="{ color: slotsClass(g.slots) }" style="font-size: 12px;">
            {{ slotsLabel(g.slots) }}
          </div>
        </div>
      </div>
    </div>

    <div style="padding: 20px 24px; border-top: 1px solid var(--border); background: rgba(13, 13, 43, 0.6);">
      <button class="btn" :class="selectedGroupId ? 'btn-primary' : ''" style="width: 100%; justify-content: center; padding: 12px;" :disabled="!selectedGroupId" @click="onConfirm">
        ✦ Перенести
      </button>
    </div>
  </div>
</template>"""

    new_content = re.sub(r'<template>.*?</template>', template, content, flags=re.DOTALL)

    # Clean up any leftover text-app-* just in case
    new_content = new_content.replace("'text-app-red'", "'var(--red)'")
    new_content = new_content.replace("'text-app-amber'", "'var(--amber)'")
    new_content = new_content.replace("'text-app-green'", "'var(--green)'")
    
    with open('src/views/recruitment/components/expelled/ExpelledTransferPanel.vue', 'w') as f:
        f.write(new_content)

if __name__ == "__main__":
    rewrite_page()
    rewrite_history_panel()
    rewrite_transfer_panel()
    print("Done")
