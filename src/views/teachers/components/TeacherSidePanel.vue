<template>
  <Teleport to="body">
    <div class="sp-overlay" :class="{ active: !!teacherId }" @click="$emit('close')" />
    <div class="sp-panel" :class="{ open: !!teacherId }">
      <template v-if="details">
        <!-- HEADER -->
        <div class="sp-header">
          <div class="sp-header-top">
            <div class="sp-avatar-row">
              <div class="sp-avatar" :style="{ background: avatarColor(fullName) }">
                {{ initials(fullName) }}
              </div>
              <div>
                <div class="sp-name">{{ fullName }}</div>
                <div class="sp-meta">{{ t('teachersList.panel.teacherRole') || 'Преподаватель' }}</div>
              </div>
            </div>
            <div class="sp-close" @click="$emit('close')">✕</div>
          </div>
          <div class="sp-tabs">
            <div
              class="sp-tab"
              :class="{ active: activeTab === 'profile' }"
              @click="activeTab = 'profile'"
            >
              👤 {{ t('teachersList.panel.tabProfile') || 'Профиль' }}
            </div>
            <div
              class="sp-tab"
              :class="{ active: activeTab === 'groups' }"
              @click="activeTab = 'groups'"
            >
              👥 {{ t('teachersList.panel.tabGroups') || 'Группы' }}
            </div>
            <div
              class="sp-tab"
              :class="{ active: activeTab === 'history' }"
              @click="activeTab = 'history'"
            >
              📜 {{ t('teachersList.panel.tabHistory') || 'История' }}
            </div>
            <div
              class="sp-tab"
              :class="{ active: activeTab === 'notes' }"
              @click="activeTab = 'notes'"
            >
              📝 {{ t('teachersList.panel.tabNotes') || 'Заметки' }}
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div class="sp-body">
          <!-- PROFILE TAB -->
          <div v-if="activeTab === 'profile'" class="sp-tab-content">
             <div class="sp-section-title">{{ t('newStudents.panel.sectionAccount') || 'Данные аккаунта' }}</div>
            <div class="sp-grid">
              <div class="sp-field">
                <div class="sp-label">{{ t('teachersList.modal.fields.loginEmail') || 'Email для логина' }}</div>
                <input class="sp-input" v-model="form.email" type="email" />
              </div>
              <div class="sp-field">
                <div class="sp-label">{{ t('teachersList.modal.fields.personalEmail') || 'Email личный' }}</div>
                <input class="sp-input" v-model="form.personalEmail" type="email" />
              </div>
            </div>

            <!-- Change Password block -->
            <div class="sp-change-pwd-block">
              <button class="sp-change-pwd-toggle" @click="showChangePassword = !showChangePassword">
                🔑 {{ t('newStudents.panel.changePasswordBtn') || 'Сменить пароль' }}
                <span class="sp-toggle-arrow" :class="{ open: showChangePassword }">▾</span>
              </button>
              <div v-if="showChangePassword" class="sp-change-pwd-body">
                <div class="sp-pwd-note">{{ t('newStudents.panel.passwordEmailNote') || 'Пароль будет изменен.' }}</div>
                <div class="sp-grid">
                  <div class="sp-field">
                    <div class="sp-label">{{ t('newStudents.panel.fieldNewPassword') || 'Новый пароль' }}</div>
                    <input class="sp-input" v-model="newPassword" type="password" autocomplete="new-password" />
                  </div>
                  <div class="sp-field">
                    <div class="sp-label">{{ t('newStudents.panel.fieldConfirmPassword') || 'Подтвердите пароль' }}</div>
                    <input class="sp-input" :class="{ 'sp-input-error': passwordMismatch }" v-model="confirmPassword" type="password" autocomplete="new-password" />
                  </div>
                </div>
                <div v-if="passwordMismatch" class="sp-pwd-error">{{ t('newStudents.panel.passwordMismatch') || 'Пароли не совпадают' }}</div>
                <button
                    class="sp-save-pwd-btn"
                    :disabled="!newPassword || passwordMismatch || isSavingPassword"
                    @click="onChangePassword"
                >
                  {{ isSavingPassword ? '⏳' : '🔑' }} {{ t('newStudents.panel.savePasswordBtn') || 'Сменить пароль' }}
                </button>
              </div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionPersonal') || 'Личные данные' }}</div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldFirstName') || 'Имя' }}</div><input class="sp-input" v-model="form.firstName" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldLastName') || 'Фамилия' }}</div><input class="sp-input" v-model="form.lastName" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldBirthDate') || 'Дата рождения' }}</div><input class="sp-input" v-model="form.birthDate" type="date" /></div>
            </div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPhone') || 'Телефон' }}</div><input class="sp-input" v-model="form.phone" type="tel" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPesel') || 'PESEL' }}</div><input class="sp-input" v-model="form.pesel" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldIdCard') || 'ID Карты / Паспорт' }}</div><input class="sp-input" v-model="form.idCard" /></div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.fieldLanguages') || 'Языки преподавания' }}</div>
            <div class="sp-languages-grid">
              <label v-for="lang in ['PL', 'EN', 'UK']" :key="lang" class="sp-lang-item" :class="{ active: form.languages?.includes(lang) }">
                <input type="checkbox" v-model="form.languages" :value="lang" class="sp-hidden-check">
                <span class="sp-lang-text">{{ lang }}</span>
              </label>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionAddress') || 'Адрес' }}</div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldCountry') || 'Страна' }}</div><input class="sp-input" v-model="form.country" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldVoivodeship') || 'Область / Воеводство' }}</div><input class="sp-input" v-model="form.voivodeship" /></div>
            </div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldCity') || 'Город' }}</div><input class="sp-input" v-model="form.city" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPostCode') || 'Почтовый индекс' }}</div><input class="sp-input" v-model="form.postCode" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldStreet') || 'Улица и дом' }}</div><input class="sp-input" v-model="form.street" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldApt') || 'Квартира' }}</div><input class="sp-input" v-model="form.apt" /></div>
            </div>

            <div class="sp-section-title">{{ t('teachersList.modal.fields.availability') || 'Доступность' }}</div>
            <div class="sp-days-grid">
              <label v-for="day in daysOfWeek" :key="day" class="sp-day-item" :class="{ active: form.availability?.includes(day) }">
                <input type="checkbox" v-model="form.availability" :value="day" class="sp-hidden-check">
                <span class="sp-day-text">{{ t('newGroups.weekdays.' + day).slice(0, 3) }}</span>
              </label>
            </div>

            <div class="sp-section-title">{{ t('teachersList.modal.fields.comment') || 'Комментарий' }}</div>
            <div class="sp-grid cols-1">
              <div class="sp-field">
                <div class="sp-label">{{ t('teachersList.modal.fields.comment') || 'Комментарий' }}</div>
                <textarea class="sp-input sp-textarea" v-model="form.comment" :placeholder="t('teachersList.modal.fields.commentPlaceholder')" />
              </div>
            </div>

            <button class="sp-save-btn" @click="onSave">✦ {{ t('newStudents.panel.saveChanges') || 'Сохранить изменения' }}</button>
          </div>

          <!-- GROUPS TAB -->
          <div v-if="activeTab === 'groups'" class="sp-tab-content">
            <div class="sp-section-title">{{ t('teachersList.panel.sections.groups') || 'Группы преподавателя' }}</div>
            <div v-if="listStore.teacherGroups.length === 0" class="sp-empty-state">
              {{ t('teachersList.panel.groups.empty') || 'Активных групп нет' }}
            </div>
            <div v-else class="sp-data-list">
              <div v-for="group in listStore.teacherGroups" :key="group.id" class="sp-data-item">
                <div class="sp-item-info">
                  <div class="sp-item-title-row">
                    <div class="sp-item-title">{{ group.name }}</div>
                    <span v-if="ageMap[group.age ?? '']" :class="['age-badge', ageMap[group.age!].cls]">
                      {{ ageMap[group.age!].icon }} {{ ageMap[group.age!].label }}
                    </span>
                  </div>
                  <div class="sp-item-sub" v-if="group.startDate || group.status">
                    <span v-if="group.startDate">
                      {{ t('teachersList.panel.groups.startDate') || 'Старт' }}: {{ formatGroupStartDate(group.startDate) }}
                    </span>
                    <span v-if="group.startDate && group.status"> • </span>
                    <span v-if="group.status">
                      {{ t('teachersList.panel.groups.status') || 'Статус' }}: {{ formatGroupStatus(group.status) }}
                    </span>
                  </div>
                  <div class="sp-item-sub" v-else>{{ group.schedule }}</div>
                </div>
                <div class="sp-item-badge">
                  {{ group.studentsCount }} {{ t('teachersList.panel.groups.students') || 'учеников' }}
                </div>
              </div>
            </div>
          </div>

          <!-- HISTORY TAB -->
          <div v-if="activeTab === 'history'" class="sp-tab-content">
            <div class="sp-section-title">{{ t('teachersList.panel.sections.history') || 'История изменений' }}</div>
            <div v-if="listStore.teacherHistory.length === 0" class="sp-empty-state">
              {{ t('teachersList.panel.history.empty') || 'История пуста' }}
            </div>
            <div v-else class="sp-data-list">
              <div v-for="event in listStore.teacherHistory" :key="event.id" class="sp-data-item history-item">
                <div class="sp-item-info">
                  <div class="sp-item-title">{{ event.action }}</div>
                  <div class="sp-item-sub">{{ event.userName }} • {{ event.createdAt }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- NOTES TAB -->
          <div v-if="activeTab === 'notes'" class="sp-tab-content">
            <div class="sp-section-title">{{ t('teachersList.panel.sections.notes') || 'Заметки по учителю' }}</div>
            
            <div class="sp-add-note">
              <textarea 
                class="sp-input sp-textarea" 
                v-model="newNoteText" 
                :placeholder="t('teachersList.panel.notes.placeholder') || 'Напишите заметку...'"
              />
              <button 
                class="sp-save-btn" 
                :disabled="!newNoteText.trim() || isAddingNote"
                @click="onAddNote"
              >
                {{ isAddingNote ? '⏳' : '✦' }} {{ t('teachersList.panel.notes.addBtn') || 'Добавить заметку' }}
              </button>
            </div>

            <div v-if="listStore.teacherNotes.length === 0" class="sp-empty-state" style="margin-top: 20px;">
              {{ t('teachersList.panel.notes.empty') || 'Заметок пока нет' }}
            </div>
            <div v-else class="sp-data-list" style="margin-top: 20px;">
              <div v-for="note in listStore.teacherNotes" :key="note.id" class="sp-data-item note-item">
                <div class="sp-item-info">
                  <div v-if="editingNoteId === note.id" class="sp-note-edit-wrap">
                    <textarea class="sp-input sp-textarea" v-model="editingNoteText" />
                    <div class="sp-note-actions-row">
                      <button
                        class="sp-note-btn sp-note-btn-primary"
                        :disabled="!editingNoteText.trim() || savingNoteId === note.id"
                        @click="onSaveNote(note.id)"
                      >
                        {{ savingNoteId === note.id ? '⏳' : '✓' }} Сохранить
                      </button>
                      <button class="sp-note-btn" @click="onCancelEditNote">Отмена</button>
                    </div>
                  </div>
                  <template v-else>
                    <div class="sp-item-text">{{ note.text }}</div>
                    <div class="sp-item-sub">{{ note.userName }} • {{ note.createdAt }}</div>
                  </template>
                </div>
                <div class="sp-note-actions" v-if="editingNoteId !== note.id">
                  <button class="sp-note-btn" @click="onEditNote(note.id, note.text)">Ред.</button>
                  <button
                    class="sp-note-btn sp-note-btn-danger"
                    :disabled="deletingNoteId === note.id"
                    @click="onDeleteNote(note.id)"
                  >
                    {{ deletingNoteId === note.id ? '⏳' : 'Удалить' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TeacherDetails } from '../../../api/teachersApi'
import { useTeachersListStore } from '../../../stores/teachersList.store'
import { ageMap } from '../../../utils/newGroupsUtils'

const listStore = useTeachersListStore()
const activeTab = ref('profile')
const newNoteText = ref('')
const isAddingNote = ref(false)
const editingNoteId = ref<number | null>(null)
const editingNoteText = ref('')
const savingNoteId = ref<number | null>(null)
const deletingNoteId = ref<number | null>(null)

const props = defineProps<{
  teacherId: number | null
  details: TeacherDetails | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<TeacherDetails>]
  changePassword: [password: string]
}>()

const { t } = useI18n()

// Change password
const showChangePassword = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const isSavingPassword = ref(false)
const passwordMismatch = computed(() => confirmPassword.value !== '' && newPassword.value !== confirmPassword.value)

const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const defaultForm: Partial<TeacherDetails> = {
  email: '', personalEmail: '', firstName: '', lastName: '', birthDate: '',
  country: '', voivodeship: '', city: '', street: '', apt: '', postCode: '',
  phone: '', passport: '', pesel: '', idCard: '', languages: [],
  availability: [] as string[], comment: ''
}

const form = ref<Partial<TeacherDetails>>({ ...defaultForm })

const fullName = computed(() => {
  return `${form.value.firstName || ''} ${form.value.lastName || ''}`.trim()
})

function mapDetailsToForm(d: TeacherDetails): Partial<TeacherDetails> {
  return {
    firstName: d.firstName ?? '',
    lastName: d.lastName ?? '',
    email: d.email ?? '',
    personalEmail: d.personalEmail ?? '',
    phone: d.phone ?? '',
    birthDate: d.birthDate ?? '',
    country: d.country ?? '',
    voivodeship: d.voivodeship ?? '',
    city: d.city ?? '',
    street: d.street ?? '',
    apt: d.apt ?? '',
    postCode: d.postCode ?? '',
    passport: d.passport ?? '',
    pesel: d.pesel ?? '',
    idCard: d.idCard ?? '',
    languages: d.languages ?? [],
    availability: d.availability ?? [],
    comment: d.comment ?? '',
  }
}

function resetForm() {
  form.value = { ...defaultForm }
}

watch(() => props.details, (d) => {
  if (!d) {
    resetForm()
    return
  }
  form.value = mapDetailsToForm(d)
}, { immediate: true })

watch(() => props.teacherId, (id) => {
  showChangePassword.value = false
  newPassword.value = ''
  confirmPassword.value = ''
  activeTab.value = 'profile'
  newNoteText.value = ''
  editingNoteId.value = null
  editingNoteText.value = ''
})

watch(activeTab, (tab) => {
  if (!props.teacherId) return
  if (tab === 'groups') listStore.fetchTeacherGroups(props.teacherId)
  if (tab === 'history') listStore.fetchTeacherHistory(props.teacherId)
  if (tab === 'notes') listStore.fetchTeacherNotes(props.teacherId)
})

async function onAddNote() {
  if (!props.teacherId || !newNoteText.value.trim()) return
  isAddingNote.value = true
  try {
    await listStore.addNote(props.teacherId, newNoteText.value)
    newNoteText.value = ''
  } finally {
    isAddingNote.value = false
  }
}

function onEditNote(noteId: number, text: string) {
  editingNoteId.value = noteId
  editingNoteText.value = text
}

function onCancelEditNote() {
  editingNoteId.value = null
  editingNoteText.value = ''
}

async function onSaveNote(noteId: number) {
  if (!props.teacherId || !editingNoteText.value.trim()) return
  savingNoteId.value = noteId
  try {
    await listStore.updateNote(props.teacherId, noteId, editingNoteText.value)
    onCancelEditNote()
  } finally {
    savingNoteId.value = null
  }
}

async function onDeleteNote(noteId: number) {
  if (!props.teacherId) return
  deletingNoteId.value = noteId
  try {
    await listStore.deleteNote(props.teacherId, noteId)
    if (editingNoteId.value === noteId) {
      onCancelEditNote()
    }
  } finally {
    deletingNoteId.value = null
  }
}

async function onChangePassword() {
  if (!newPassword.value || passwordMismatch.value) return
  isSavingPassword.value = true
  try {
    emit('changePassword', newPassword.value)
    newPassword.value = ''
    confirmPassword.value = ''
    showChangePassword.value = false
  } finally {
    isSavingPassword.value = false
  }
}

function avatarColor(name: string) {
  if (!name) return 'linear-gradient(135deg,#4f6ef7,#8b5cf6)'
  const colors = [
    'linear-gradient(135deg,#4f6ef7,#8b5cf6)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#06b6d4,#4f6ef7)',
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

function initials(name: string) {
  if (!name) return ''
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatGroupStatus(status?: string | null): string {
  const value = String(status ?? '').trim().toLowerCase()
  if (!value) return '—'

  const labels: Record<string, string> = {
    active: t('teachersList.panel.groups.statusValues.active') || 'Активная',
    new: t('teachersList.panel.groups.statusValues.new') || 'Новая',
    paused: t('teachersList.panel.groups.statusValues.paused') || 'Пауза',
    archived: t('teachersList.panel.groups.statusValues.archived') || 'Архив',
    closed: t('teachersList.panel.groups.statusValues.closed') || 'Закрыта',
  }

  return labels[value] ?? value
}

function formatGroupStartDate(value?: string | null): string {
  if (!value) return '—'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return new Intl.DateTimeFormat('ru-RU').format(parsed)
}

function onSave() {
  emit('save', { ...form.value }) 
}
</script>

<style scoped>
.sp-overlay {
  position: fixed; inset: 0; background: rgba(4,4,15,0.55);
  backdrop-filter: blur(4px); z-index: 300;
  opacity: 0; pointer-events: none; transition: opacity 0.3s;
}
:root:not(.dark) .sp-overlay { background: rgba(160,170,220,0.50); }
.sp-overlay.active { opacity: 1; pointer-events: all; }

.sp-panel {
  position: fixed; top: 0; right: 0; bottom: 0; width: 560px; max-width: 100vw;
  background: var(--app-bg); border-left: 1px solid var(--app-border-hi);
  backdrop-filter: blur(30px); z-index: 400; display: flex; flex-direction: column;
  transform: translateX(100%); transition: transform 0.38s cubic-bezier(0.4,0,0.2,1); overflow: hidden;
}
.sp-panel.open { transform: translateX(0); box-shadow: -12px 0 40px rgba(0,0,0,0.15); }

.sp-header {
  padding: 22px 24px 0; border-bottom: 1px solid var(--app-border); flex-shrink: 0;
  background: var(--app-surface);
}
.sp-header-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
.sp-avatar-row { display: flex; align-items: center; gap: 14px; }
.sp-avatar {
  width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; flex-shrink: 0;
  border: 2px solid rgba(79,110,247,0.4); box-shadow: 0 0 20px rgba(79,110,247,0.2); color: white;
}
.sp-name { font-size: 18px; font-weight: 700; color: var(--app-text-main); }
.sp-meta { font-size: 12px; color: var(--app-text-dim); margin-top: 3px; }
.sp-close {
  width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; cursor: pointer; background: var(--app-card); border: 1px solid var(--app-border);
  color: var(--app-text-dim); font-size: 15px; transition: all 0.15s;
}
.sp-close:hover { background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3); }

.sp-tabs { display: flex; gap: 0; }
.sp-tab {
  padding: 10px 16px; font-size: 13px; font-weight: 500; color: var(--app-text-dim);
  cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s;
  margin-bottom: -1px; white-space: nowrap;
}
.sp-tab.active { color: #4f6ef7; border-bottom-color: #4f6ef7; }

.sp-body { flex: 1; overflow-y: auto; }
.sp-body::-webkit-scrollbar { width: 4px; }
.sp-body::-webkit-scrollbar-thumb { background: rgba(79,110,247,0.2); border-radius: 2px; }

.sp-tab-content { padding: 20px 24px; }

.sp-section-title {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--app-text-dim); margin-bottom: 14px; margin-top: 4px;
  display: flex; align-items: center; gap: 8px;
}
.sp-section-title::after { content: ''; flex: 1; height: 1px; background: var(--app-border); }

.sp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.sp-grid.cols-1 { grid-template-columns: 1fr; }
.sp-field { display: flex; flex-direction: column; gap: 5px; }
.sp-label { font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--app-text-dim); }
.sp-input {
  background: var(--app-card); border: 1px solid var(--app-border); border-radius: 8px;
  padding: 8px 11px; color: var(--app-text-main); font-family: 'Outfit', sans-serif;
  font-size: 13.5px; outline: none; transition: all 0.2s; width: 100%;
}
.sp-input:focus { border-color: var(--app-border-hi); box-shadow: 0 0 10px rgba(79,110,247,0.1); }
.sp-input::placeholder { color: rgba(136,146,176,0.4); }
.sp-textarea { resize: vertical; min-height: 72px; }

.sp-save-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; padding: 10px 14px;
  border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer;
  background: linear-gradient(135deg,#4f6ef7,#8b5cf6); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3);
  border: none; transition: all 0.2s; margin-top: 8px;
}
.sp-save-btn:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }

/* Change Password Block */
.sp-change-pwd-block {
  background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px;
  margin-bottom: 16px; overflow: hidden;
}
.sp-change-pwd-toggle {
  width: 100%; display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  background: transparent; border: none; cursor: pointer; color: var(--app-text-dim);
  font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif; text-align: left;
  transition: color 0.15s;
}
.sp-change-pwd-toggle:hover { color: #4f6ef7; }
.sp-toggle-arrow { margin-left: auto; font-size: 14px; transition: transform 0.2s; display: inline-block; }
.sp-toggle-arrow.open { transform: rotate(180deg); }
.sp-change-pwd-body { padding: 0 14px 14px; border-top: 1px solid var(--app-border); padding-top: 12px; }
.sp-pwd-note { font-size: 11px; color: var(--app-text-dim); margin-bottom: 8px; line-height: 1.35; }
.sp-pwd-error { font-size: 11.5px; color: #ef4444; margin-bottom: 8px; }
.sp-input-error { border-color: rgba(239,68,68,0.5) !important; }
.sp-save-pwd-btn {
  width: 100%; padding: 8px 14px; border-radius: 8px; border: none; cursor: pointer;
  background: linear-gradient(135deg,#4f6ef7,#8b5cf6); color: white;
  font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif;
  transition: all 0.2s; margin-top: 4px;
}
.sp-save-pwd-btn:hover:not(:disabled) { box-shadow: 0 0 16px rgba(79,110,247,0.4); transform: translateY(-1px); }
.sp-save-pwd-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Data Lists */
.sp-empty-state {
  padding: 40px 20px; text-align: center; color: var(--app-text-dim);
  font-size: 13px; border: 1px dashed var(--app-border); border-radius: 12px;
}

.sp-data-list { display: flex; flex-direction: column; gap: 8px; }
.sp-data-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; background: var(--app-card); border: 1px solid var(--app-border);
  border-radius: 10px; transition: all 0.15s;
}
.sp-data-item:hover { border-color: var(--app-border-hi); transform: translateX(2px); }

.sp-item-info { display: flex; flex-direction: column; gap: 3px; }
.sp-item-title { font-size: 14px; font-weight: 600; color: var(--app-text-main); }
.sp-item-sub { font-size: 11px; color: var(--app-text-dim); font-family: 'Space Mono', monospace; }

.sp-item-badge {
  font-size: 11px; font-weight: 600; background: var(--status-info-bg);
  color: var(--blue); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(79,110,247,0.2);
}

.history-item .sp-item-title { font-size: 13px; font-weight: 500; }

.note-item { flex-direction: column; align-items: flex-start; gap: 8px; }
.sp-item-text { font-size: 13.5px; color: var(--app-text-main); line-height: 1.45; white-space: pre-wrap; }

.sp-add-note { display: flex; flex-direction: column; gap: 10px; }

.sp-note-actions { display: flex; gap: 8px; align-self: flex-end; }
.sp-note-actions-row { display: flex; gap: 8px; margin-top: 8px; }
.sp-note-edit-wrap { width: 100%; }
.sp-note-btn {
  border: 1px solid var(--app-border);
  background: var(--app-card);
  color: var(--app-text-main);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}
.sp-note-btn-primary { border-color: rgba(79,110,247,0.5); color: var(--blue); }
.sp-note-btn-danger { border-color: rgba(239,68,68,0.35); color: #ef4444; }

.sp-item-title-row { display: flex; align-items: center; gap: 8px; }
.age-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; white-space: nowrap; font-family: 'Outfit', sans-serif; border: 1px solid rgba(255,255,255,0.08); }
.age-junior { background: rgba(16,185,129,0.12); color: #10b981; border-color: rgba(16,185,129,0.25); }
.age-middle { background: rgba(245,158,11,0.12); color: #f59e0b; border-color: rgba(245,158,11,0.25); }
.age-senior { background: rgba(239,68,68,0.12); color: #ef4444; border-color: rgba(239,68,68,0.25); }
.age-adult  { background: rgba(139,92,246,0.12); color: #8b5cf6; border-color: rgba(139,92,246,0.25); }

/* Languages selection in panel */
.sp-languages-grid {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.sp-lang-item {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.sp-lang-item:hover {
  border-color: var(--app-border-hi);
  background: var(--status-info-bg);
}
.sp-lang-item.active {
  background: var(--blue);
  border-color: var(--blue);
  color: white;
}
.sp-lang-text {
  font-size: 12px;
  font-weight: 700;
}

/* Day pills in panel */
.sp-days-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.sp-day-item {
  flex: 1;
  min-width: 44px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}
.sp-day-item:hover {
  background: var(--status-danger-bg, rgba(236, 72, 153, 0.05));
  border-color: rgba(236, 72, 153, 0.2);
  transform: translateY(-1px);
}
.sp-day-item.active {
  background: var(--pink, #ec4899);
  border-color: var(--pink, #ec4899);
  color: white;
  box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
}
.sp-day-text {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.sp-hidden-check { display: none; }
</style>
