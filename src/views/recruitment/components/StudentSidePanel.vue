<template>
  <Teleport to="body">
    <div class="sp-overlay" :class="{ active: !!student }" @click="$emit('close')" />
    <div class="sp-panel" :class="{ open: !!student }">
      <template v-if="student && details">

        <!-- HEADER -->
        <div class="sp-header">
          <div class="sp-header-top">
            <div class="sp-avatar-row">
              <div class="sp-avatar" :style="{ background: avatarColor(student.name) }">
                {{ initials(student.name) }}
              </div>
              <div>
                <div class="sp-name">{{ student.name }}</div>
                <div class="sp-meta">{{ student.age }} {{ t('newStudents.panel.yearsOld') }} · {{ student.group || t('newStudents.panel.noGroup') }} · {{ student.manager || t('newStudents.panel.noManager') }}</div>
              </div>
            </div>
            <div class="sp-close" @click="$emit('close')">✕</div>
          </div>
          <div class="sp-action-bar">
            <button class="sp-btn sp-btn-email" @click="onEmail">✉️ {{ t('newStudents.panel.sendEmail') }}</button>
            <button class="sp-btn sp-btn-delete" @click="onDelete">🗑 {{ t('newStudents.panel.deleteStudent') }}</button>
          </div>
          <div class="sp-tabs">
            <div v-for="tab in tabs" :key="tab.key" class="sp-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
              {{ tab.icon }} {{ tab.label }}
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div class="sp-body">

          <!-- TAB: PROFILE -->
          <div v-show="activeTab === 'info'" class="sp-tab-content">
            <div class="sp-section-title">{{ t('newStudents.panel.sectionAccount') }}</div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">Email</div><input class="sp-input" v-model="form.email" type="email" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPassword') }}</div><input class="sp-input" v-model="form.password" type="text" /></div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionPersonal') }}</div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldFirstName') }}</div><input class="sp-input" v-model="form.firstName" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldLastName') }}</div><input class="sp-input" v-model="form.lastName" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldBirthDate') }}</div><input class="sp-input" v-model="form.birthDate" type="date" /></div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionAddress') }}</div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldCountry') }}</div><input class="sp-input" v-model="form.country" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldCity') }}</div><input class="sp-input" v-model="form.city" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldStreet') }}</div><input class="sp-input" v-model="form.street" /></div>
            </div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldApt') }}</div><input class="sp-input" v-model="form.apt" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPostCode') }}</div><input class="sp-input" v-model="form.postCode" /></div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionParent') }}</div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldFirstName') }}</div><input class="sp-input" v-model="form.parentFirst" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldLastName') }}</div><input class="sp-input" v-model="form.parentLast" /></div>
            </div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPhone') }}</div><input class="sp-input" v-model="form.parentPhone" type="tel" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPassport') }}</div><input class="sp-input" v-model="form.parentPassport" /></div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionConsents') }}</div>
            <div class="sp-toggle-row">
              <div>
                <div class="sp-toggle-label">📷 {{ t('newStudents.panel.consentPhoto') }}</div>
                <div class="sp-toggle-sub">{{ t('newStudents.panel.consentPhotoSub') }}</div>
              </div>
              <div class="sp-toggle" :class="{ on: form.photoConsent }" @click="form.photoConsent = !form.photoConsent" />
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionComment') }}</div>
            <div class="sp-grid cols-1">
              <div class="sp-field">
                <textarea class="sp-input sp-textarea" v-model="form.comment" :placeholder="t('newStudents.panel.commentPlaceholder')" />
              </div>
            </div>

            <button class="sp-save-btn" @click="onSave">✦ {{ t('newStudents.panel.saveChanges') }}</button>
          </div>

          <!-- TAB: HISTORY -->
          <div v-show="activeTab === 'history'" class="sp-tab-content">
            <div class="sp-history-item" v-for="(h, i) in historyList" :key="i">
              <div class="sp-hist-dot" :style="{ background: h.color, boxShadow: `0 0 6px ${h.color}88` }" />
              <div class="sp-hist-content">
                <div class="sp-hist-event">{{ h.event }}</div>
                <div class="sp-hist-date">{{ h.date }}</div>
                <div v-if="h.detail" class="sp-hist-detail">{{ h.detail }}</div>
              </div>
            </div>
          </div>

          <!-- TAB: PAYMENTS -->
          <div v-show="activeTab === 'payments'" class="sp-tab-content">
            <div class="sp-price-box">
              <div>
                <div class="sp-price-label">{{ t('newStudents.panel.currentPrice') }}</div>
                <div class="sp-price-value">{{ details.currentPrice }} zł</div>
                <div class="sp-price-desc">{{ details.currentPriceDesc }}</div>
              </div>
              <button class="sp-change-price-btn" @click="priceListOpen = !priceListOpen">🏷 {{ t('newStudents.panel.changePrice') }}</button>
            </div>

            <!-- Price List -->
            <div class="sp-price-list" :class="{ open: priceListOpen }">
              <div class="sp-price-group-label">GROUP LESSONS</div>
              <div v-for="p in groupPrices" :key="p.amount" class="sp-price-item" :class="{ selected: p.amount === selectedPrice }" @click="pickPrice(p)">
                <div><div class="sp-price-amount">{{ p.amount }} zł</div><div class="sp-price-name">{{ p.name }}</div></div>
                <span class="sp-price-tag" :style="{ color: p.tagColor }">{{ p.tag }}</span>
              </div>
              <div class="sp-price-group-label">INDIVIDUAL LESSONS</div>
              <div v-for="p in individualPrices" :key="p.amount" class="sp-price-item" :class="{ selected: p.amount === selectedPrice }" @click="pickPrice(p)">
                <div><div class="sp-price-amount">{{ p.amount }} zł</div><div class="sp-price-name">{{ p.name }}</div></div>
                <span class="sp-price-tag" :style="{ color: p.tagColor }">{{ p.tag }}</span>
              </div>
            </div>

            <div class="sp-section-title" style="margin-top:16px">{{ t('newStudents.panel.paymentStatus') }}</div>
            <div class="sp-status-row">
              <div class="sp-status-label">{{ t('newStudents.panel.contract') }}</div>
              <span class="contract-badge" :class="student.contract === 'signed' ? 'contract-signed' : 'contract-pending'">
                {{ student.contract === 'signed' ? `✓ ${t('newStudents.table.signed')}` : `⏳ ${t('newStudents.table.pending')}` }}
              </span>
            </div>
            <div class="sp-status-row">
              <div class="sp-status-label">{{ t('newStudents.panel.payment') }}</div>
              <span v-if="student.payment > 0" class="payment-value">{{ student.paymentStr }}</span>
              <span v-else class="payment-zero">.....{{ t('newStudents.panel.notPaid') }}</span>
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
import type { NewStudent, StudentDetails, HistoryEvent } from '../../../stores/newStudents.store'

const props = defineProps<{
  student: NewStudent | null
  details: StudentDetails | null
  historyList: HistoryEvent[]
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<StudentDetails>]
  delete: []
  email: []
  setPrice: [amount: string, desc: string]
}>()

const { t } = useI18n()

const activeTab = ref<'info' | 'history' | 'payments'>('info')
const priceListOpen = ref(false)
const selectedPrice = ref<string | null>(null)

const tabs = computed(() => [
  { key: 'info' as const,     icon: '👤', label: t('newStudents.panel.tabProfile')  },
  { key: 'history' as const,  icon: '📋', label: t('newStudents.panel.tabHistory')  },
  { key: 'payments' as const, icon: '💳', label: t('newStudents.panel.tabPayments') },
])

const defaultForm = {
  email: '', password: '', firstName: '', lastName: '', birthDate: '',
  country: '', city: '', street: '', apt: '', postCode: '',
  parentFirst: '', parentLast: '', parentPhone: '', parentPassport: '',
  photoConsent: false, comment: '',
}

const form = ref({ ...defaultForm })

function resetForm() {
  form.value = { ...defaultForm }
}

watch(() => props.details, (d) => {
  if (!d) {
    resetForm()
    selectedPrice.value = null
    priceListOpen.value = false
    return
  }

  form.value = { ...defaultForm, ...d }
  selectedPrice.value = d.currentPrice || null
  priceListOpen.value = false
}, { immediate: true })

watch(() => props.student, () => {
  resetForm()
  selectedPrice.value = null
  activeTab.value = 'info'
  priceListOpen.value = false
})

const groupPrices = [
  { amount: '489.00', name: 'Group lessons',                      tag: 'Стандарт', tagColor: 'var(--app-text-dim)' },
  { amount: '440.10', name: 'Group lessons Family 2nd child −10%', tag: '−10%',    tagColor: '#f59e0b'              },
  { amount: '469.00', name: 'Group lessons Fast decision −20 zł',  tag: '−20 zł',  tagColor: '#06b6d4'              },
  { amount: '369.00', name: 'Group lessons Trial month',           tag: 'Пробный', tagColor: '#8b5cf6'              },
  { amount: '464.50', name: 'Group lessons Recommendation −5%',    tag: '−5%',     tagColor: '#10b981'              },
]
const individualPrices = [
  { amount: '689.00', name: 'Individual lessons',       tag: 'Стандарт', tagColor: 'var(--app-text-dim)' },
  { amount: '620.10', name: 'Individual lessons −10%',  tag: '−10%',     tagColor: '#f59e0b'              },
]

function pickPrice(p: { amount: string; name: string }) {
  selectedPrice.value = p.amount
  emit('setPrice', p.amount, p.name)
  priceListOpen.value = false
}

function avatarColor(name: string) {
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
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function onSave() { emit('save', { ...form.value }) }
function onEmail() { emit('email') }
function onDelete() { emit('delete') }
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

.sp-action-bar { display: flex; gap: 8px; margin-bottom: 16px; }
.sp-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 13px;
  border-radius: 8px; font-size: 12.5px; font-weight: 600; font-family: 'Outfit', sans-serif;
  cursor: pointer; transition: all 0.2s; border: 1px solid;
}
.sp-btn-email  { background: rgba(6,182,212,0.08);  color: #06b6d4; border-color: rgba(6,182,212,0.25); }
.sp-btn-email:hover  { background: rgba(6,182,212,0.18);  border-color: rgba(6,182,212,0.5); }
.sp-btn-delete { background: rgba(239,68,68,0.08);  color: #ef4444; border-color: rgba(239,68,68,0.25); }
.sp-btn-delete:hover { background: rgba(239,68,68,0.18);  border-color: rgba(239,68,68,0.5); box-shadow: 0 0 12px rgba(239,68,68,0.15); }

.sp-tabs { display: flex; gap: 0; }
.sp-tab {
  padding: 10px 16px; font-size: 13px; font-weight: 500; color: var(--app-text-dim);
  cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.15s;
  margin-bottom: -1px; white-space: nowrap;
}
.sp-tab:hover { color: var(--app-text-main); }
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

.sp-toggle-row {
  display: flex; align-items: center; justify-content: space-between; padding: 12px 14px;
  background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px; margin-bottom: 12px;
}
.sp-toggle-label { font-size: 13px; font-weight: 500; color: var(--app-text-main); }
.sp-toggle-sub { font-size: 11px; color: var(--app-text-dim); margin-top: 2px; }
.sp-toggle {
  width: 42px; height: 24px; border-radius: 12px; background: var(--app-surface);
  border: 1px solid var(--app-border); position: relative; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.sp-toggle.on { background: linear-gradient(135deg,#10b981,#06b6d4); border-color: transparent; box-shadow: 0 0 10px rgba(16,185,129,0.3); }
.sp-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
.sp-toggle.on::after { left: 21px; }

.sp-save-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; padding: 10px 14px;
  border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer;
  background: linear-gradient(135deg,#4f6ef7,#8b5cf6); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3);
  border: none; transition: all 0.2s; margin-top: 8px;
}
.sp-save-btn:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }

/* History */
.sp-history-item { display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--app-border); }
.sp-history-item:last-child { border-bottom: none; }
.sp-hist-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.sp-hist-event { font-size: 13px; font-weight: 500; color: var(--app-text-main); }
.sp-hist-date  { font-size: 11px; color: var(--app-text-dim); font-family: 'Space Mono', monospace; margin-top: 2px; }
.sp-hist-detail { font-size: 12px; color: var(--app-text-dim); margin-top: 3px; }

/* Payments */
.sp-price-box {
  background: rgba(79,110,247,0.07); border: 1px solid rgba(79,110,247,0.2);
  border-radius: 12px; padding: 16px 18px; margin-bottom: 16px;
  display: flex; align-items: center; justify-content: space-between;
}
.sp-price-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--app-text-dim); margin-bottom: 4px; }
.sp-price-value { font-family: 'Space Mono', monospace; font-size: 24px; font-weight: 700; color: var(--app-text-main); }
.sp-price-desc  { font-size: 11.5px; color: var(--app-text-dim); margin-top: 3px; }
.sp-change-price-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px;
  font-size: 12.5px; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s;
  background: rgba(139,92,246,0.1); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.3);
}
.sp-change-price-btn:hover { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.5); }

.sp-price-list { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px; overflow: hidden; margin-bottom: 10px; display: none; }
.sp-price-list.open { display: block; }
.sp-price-group-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 10px 14px 6px; color: var(--app-text-dim); background: var(--app-surface); border-bottom: 1px solid var(--app-border); }
.sp-price-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid rgba(100,120,255,0.06); }
.sp-price-item:last-child { border-bottom: none; }
.sp-price-item:hover { background: rgba(79,110,247,0.08); }
.sp-price-item.selected { background: rgba(79,110,247,0.12); }
.sp-price-amount { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; color: var(--app-text-main); }
.sp-price-name  { font-size: 12.5px; color: var(--app-text-dim); margin-top: 1px; }
.sp-price-tag   { font-size: 11px; }

.sp-status-row {
  display: flex; align-items: center; justify-content: space-between; padding: 10px 14px;
  background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px; margin-bottom: 10px;
}
.sp-status-label { font-size: 13px; font-weight: 500; color: var(--app-text-main); }

.contract-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.contract-signed  { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
.contract-pending { background: rgba(136,146,176,0.1); color: var(--app-text-dim); border: 1px solid rgba(136,146,176,0.2); }

.payment-value { font-family: 'Space Mono', monospace; font-weight: 700; color: #10b981; }
.payment-zero  { color: var(--app-text-dim); font-style: italic; }
</style>
