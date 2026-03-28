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
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldNickname') }}</div><input class="sp-input" v-model="form.nickname" /></div>
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
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldVoivodeship') }}</div><input class="sp-input" v-model="form.voivodeship" /></div>
            </div>
            <div class="sp-grid">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldCity') }}</div><input class="sp-input" v-model="form.city" /></div>
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldPostCode') }}</div><input class="sp-input" v-model="form.postCode" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldStreet') }}</div><input class="sp-input" v-model="form.street" /></div>
            </div>
            <div class="sp-grid cols-1">
              <div class="sp-field"><div class="sp-label">{{ t('newStudents.panel.fieldApt') }}</div><input class="sp-input" v-model="form.apt" /></div>
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

            <div class="sp-section-title">{{ t('newStudents.panel.sectionHobbies') }}</div>
            <div class="sp-grid cols-1">
              <div class="sp-field">
                <div class="sp-label">{{ t('newStudents.panel.fieldHobbies') }}</div>
                <textarea class="sp-input sp-textarea" v-model="form.hobbies" :placeholder="t('newStudents.panel.hobbiesPlaceholder')" />
              </div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionConsents') }}</div>
            <div class="sp-consents-grid">
              <div class="sp-toggle-card" :class="{ on: form.marketingConsent }" @click="confirmConsentToggle('marketingConsent', '📢', t('newStudents.panel.consentMarketing'))">
                <div class="sp-toggle-icon">📢</div>
                <div class="sp-toggle-text">{{ t('newStudents.panel.consentMarketing') }}</div>
              </div>
              <div class="sp-toggle-card" :class="{ on: form.digitalContentConsent }" @click="confirmConsentToggle('digitalContentConsent', '📦', t('newStudents.panel.consentDigitalContent'))">
                <div class="sp-toggle-icon">📦</div>
                <div class="sp-toggle-text">{{ t('newStudents.panel.consentDigitalContent') }}</div>
              </div>
              <div class="sp-toggle-card" :class="{ on: form.dataProcessingConsent }" @click="confirmConsentToggle('dataProcessingConsent', '⚖️', t('newStudents.panel.consentDataProcessing'))">
                <div class="sp-toggle-icon">⚖️</div>
                <div class="sp-toggle-text">{{ t('newStudents.panel.consentDataProcessing') }}</div>
              </div>
              <div class="sp-toggle-card" :class="{ on: form.socialMediaConsent }" @click="confirmConsentToggle('socialMediaConsent', '📸', t('newStudents.panel.consentSocialMedia'))">
                <div class="sp-toggle-icon">📸</div>
                <div class="sp-toggle-text">{{ t('newStudents.panel.consentSocialMedia') }}</div>
              </div>
              <div class="sp-toggle-card" :class="{ on: form.internalQualityConsent }" @click="confirmConsentToggle('internalQualityConsent', '🔍', t('newStudents.panel.consentInternalQuality'))">
                <div class="sp-toggle-icon">🔍</div>
                <div class="sp-toggle-text">{{ t('newStudents.panel.consentInternalQuality') }}</div>
              </div>
              <div class="sp-toggle-card" :class="{ on: form.photoConsent }" @click="confirmConsentToggle('photoConsent', '🖼️', t('newStudents.panel.consentPhoto'))">
                <div class="sp-toggle-icon">🖼️</div>
                <div class="sp-toggle-text">{{ t('newStudents.panel.consentPhoto') }}</div>
              </div>
            </div>

            <div class="sp-section-title">{{ t('newStudents.panel.sectionComments') }}</div>
            <div class="sp-grid cols-1">
              <div class="sp-field">
                <div class="sp-label">{{ t('newStudents.panel.fieldComment') }}</div>
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
                <div class="sp-price-value">{{ (payments?.currentPrice || details.currentPrice) }} zł</div>
                <div class="sp-price-desc">{{ payments?.currentPriceDesc || details.currentPriceDesc }}</div>
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

            <div class="sp-status-row">
              <div class="sp-status-label">{{ t('newStudents.panel.payment') }}</div>
              <span v-if="student.payment > 0" class="payment-value">{{ student.paymentStr }}</span>
              <span v-else class="payment-zero">{{ t('newStudents.panel.notPaid') }}</span>
            </div>

            <!-- Discount & Overpayment -->
            <div class="sp-section-title" style="margin-top:16px">{{ t('newStudents.panel.adjustmentsTitle') }}</div>
            <div class="sp-adj-row">
              <div class="sp-adj-label">{{ t('newStudents.panel.discountLabel') }}</div>
              <div class="sp-adj-input-wrap">
                <input
                  class="sp-input sp-adj-input"
                  v-model="localDiscount"
                  type="text"
                  inputmode="decimal"
                  :placeholder="t('newStudents.panel.discountPlaceholder')"
                />
                <button
                  class="sp-adj-save-btn"
                  :disabled="isSavingDiscount"
                  :title="t('newStudents.panel.save')"
                  @click="onSaveDiscount"
                >
                  {{ isSavingDiscount ? '⏳' : '💾' }}
                </button>
              </div>
            </div>
            <div class="sp-adj-row" style="margin-top:10px">
              <div class="sp-adj-label">{{ t('newStudents.panel.overpaymentLabel') }}</div>
              <div class="sp-adj-input-wrap">
                <input
                  class="sp-input sp-adj-input"
                  v-model="localOverpayment"
                  type="text"
                  inputmode="decimal"
                  :placeholder="t('newStudents.panel.overpaymentPlaceholder')"
                />
                <button
                  class="sp-adj-save-btn"
                  :disabled="isSavingOverpayment"
                  :title="t('newStudents.panel.save')"
                  @click="onSaveOverpayment"
                >
                  {{ isSavingOverpayment ? '⏳' : '💾' }}
                </button>
              </div>
            </div>

            <div class="sp-section-title document-header" style="margin-top:16px; display: flex; align-items: center; justify-content: space-between;">
              {{ t('newStudents.panel.documentsTitle') }}
              <button
                v-if="payments?.documentList?.length"
                class="sp-title-action-btn delete-all"
                :title="t('newStudents.panel.deleteAllDocs')"
                @click="onDeleteAllDocs"
              >
                🗑 {{ t('newStudents.panel.deleteAllDocs') }}
              </button>
            </div>
            <div v-if="payments?.documentList?.length" class="sp-list-wrap">
              <div v-for="doc in payments.documentList" :key="doc.id" class="sp-row-item doc-row">
                <div class="sp-row-main" style="flex: 1;">
                  <div>{{ doc.name }}</div>
                  <div v-if="doc.template" class="doc-template-label">{{ doc.template }}</div>
                </div>
                
                <div class="doc-right">
                  <span class="contract-badge" :class="doc.signed ? 'contract-signed' : 'contract-pending'">
                    {{ doc.signed ? t('newStudents.panel.documentSigned') : t('newStudents.panel.documentPending') }}
                  </span>
                  
                  <div class="doc-actions">
                    <button class="doc-action-btn" :title="t('newStudents.panel.downloadTemplate')" @click="onDownloadDoc(doc, 'template')">📄</button>
                    <button v-if="doc.signed" class="doc-action-btn" :title="t('newStudents.panel.downloadSigned')" @click="onDownloadDoc(doc, 'signed')">🖋️</button>
                    <button class="doc-action-btn delete" :title="t('newStudents.panel.deleteDoc')" @click="onDeleteDoc(doc)">🗑</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="sp-empty-state">{{ t('newStudents.panel.documentsEmpty') }}</div>

            <div class="sp-section-title" style="margin-top:16px">{{ t('newStudents.panel.transactionsTitle') }}</div>
            <div v-if="payments?.transactionList?.length" class="sp-list-wrap">
              <div v-for="tx in payments.transactionList" :key="tx.id" class="sp-row-item sp-row-item-col">
                <div class="sp-row-top">
                  <span class="sp-row-main">{{ formatTxDate(tx.date) }}</span>
                  <span class="payment-value">{{ tx.amount.toFixed(2) }} {{ tx.currency }}</span>
                </div>
                <div class="sp-row-sub">{{ t('newStudents.panel.transactionStatus') }}: {{ tx.status }}</div>
              </div>
            </div>
            <div v-else class="sp-empty-state">{{ t('newStudents.panel.transactionsEmpty') }}</div>

          </div><!-- end sp-tab-content payments -->

        </div><!-- end sp-body -->
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalStore } from '../../../stores/modal.store'
import type { NewStudent, StudentDetails, HistoryEvent, StudentPayments } from '../../../stores/newStudents.store'

const props = defineProps<{
  student: NewStudent | null
  details: StudentDetails | null
  payments: StudentPayments | null
  historyList: HistoryEvent[]
}>()

const emit = defineEmits<{
  close: []
  save: [data: Partial<StudentDetails>]
  delete: []
  email: []
  setPrice: [amount: string, desc: string]
  loadPayments: []
  saveDiscount: [value: string]
  saveOverpayment: [value: string]
  downloadDoc: [doc: any, type: 'template' | 'signed']
  deleteDoc: [doc: any]
  deleteAllDocs: []
}>()

const { t } = useI18n()

const activeTab = ref<'info' | 'history' | 'payments'>('info')
const priceListOpen = ref(false)
const selectedPrice = ref<string | null>(null)

const localDiscount = ref('')
const localOverpayment = ref('')
const isSavingDiscount = ref(false)
const isSavingOverpayment = ref(false)

const tabs = computed(() => [
  { key: 'info' as const,     icon: '👤', label: t('newStudents.panel.tabProfile')  },
  { key: 'history' as const,  icon: '📋', label: t('newStudents.panel.tabHistory')  },
  { key: 'payments' as const, icon: '💳', label: t('newStudents.panel.tabPayments') },
])

const defaultForm = {
  email: '', password: '', nickname: '', firstName: '', lastName: '', birthDate: '',
  country: '', voivodeship: '', city: '', street: '', apt: '', postCode: '',
  parentFirst: '', parentLast: '', parentPhone: '', parentPassport: '',
  hobbies: '', comment: '',
  photoConsent: false,
  marketingConsent: false,
  digitalContentConsent: false,
  dataProcessingConsent: false,
  socialMediaConsent: false,
  internalQualityConsent: false,
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

watch(activeTab, (tab) => {
  if (tab === 'payments' && props.student) {
    emit('loadPayments')
  }
})

watch(
  () => ({ ref: props.payments, disc: props.payments?.discount, ovp: props.payments?.balance_overpayment }),
  ({ disc, ovp }) => {
    localDiscount.value    = disc ?? ''
    localOverpayment.value = ovp  ?? ''
  },
  { immediate: true }
)

async function onSaveDiscount() {
  isSavingDiscount.value = true
  try {
    emit('saveDiscount', localDiscount.value)
  } finally {
    isSavingDiscount.value = false
  }
}

async function onSaveOverpayment() {
  isSavingOverpayment.value = true
  try {
    emit('saveOverpayment', localOverpayment.value)
  } finally {
    isSavingOverpayment.value = false
  }
}

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

const modal = useModalStore()

function confirmConsentToggle(key: string, icon: string, label: string) {
  if (!props.student) return
  
  const currentVal = (form.value as any)[key]
  modal.open('consent-confirm', {
    studentId: props.student.id,
    consentKey: key,
    consentIcon: icon,
    consentLabel: label,
    newValue: !currentVal
  })
}

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

function onDeleteDoc(doc: any) {
  if (!confirm(t('newStudents.panel.deleteDoc') + '?')) return
  emit('deleteDoc', doc)
}

function onDeleteAllDocs() {
  if (!confirm(t('newStudents.panel.confirmDeleteAll'))) return
  emit('deleteAllDocs')
}

function onDownloadDoc(doc: any, type: 'template' | 'signed') {
  emit('downloadDoc', doc, type)
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function onSave() { emit('save', { ...form.value }) }
function onEmail() { emit('email') }
function onDelete() {
  if (!confirm(t('newStudents.panel.deleteConfirmMessage'))) return
  emit('delete')
}

function formatTxDate(dateText: string) {
  if (!dateText) return '—'
  const parsed = new Date(dateText)
  if (Number.isNaN(parsed.getTime())) return dateText
  return parsed.toLocaleDateString('ru-RU')
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

.sp-toggle-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  gap: 8px;
}
.sp-toggle-card:hover { border-color: var(--app-border-hi); background: var(--app-surface); transform: translateY(-2px); }
.sp-toggle-card.on {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}
.sp-toggle-icon { font-size: 18px; filter: grayscale(1); transition: filter 0.2s; }
.sp-toggle-card.on .sp-toggle-icon { filter: grayscale(0); }
.sp-toggle-text { font-size: 11px; font-weight: 600; color: var(--app-text-dim); line-height: 1.2; }
.sp-toggle-card.on .sp-toggle-text { color: #10b981; }

.sp-consents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }

.sp-save-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; padding: 10px 14px;
  border-radius: 8px; font-size: 13px; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer;
  background: linear-gradient(135deg,#4f6ef7,#8b5cf6); color: white; box-shadow: 0 0 16px rgba(79,110,247,0.3);
  border: none; transition: all 0.2s; margin-top: 8px;
}
.sp-save-btn:hover { box-shadow: 0 0 24px rgba(79,110,247,0.5); transform: translateY(-1px); }

/* History */
.sp-history-item { display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--app-border); }
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
.sp-price-amount { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; color: var(--app-text-main); }
.sp-price-name  { font-size: 12.5px; color: var(--app-text-dim); margin-top: 1px; }

.sp-status-row {
  display: flex; align-items: center; justify-content: space-between; padding: 10px 14px;
  background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px; margin-bottom: 10px;
}
.sp-status-label { font-size: 13px; font-weight: 500; color: var(--app-text-main); }

.sp-list-wrap { background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px; overflow: hidden; }
.sp-row-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid rgba(100,120,255,0.06); }
.sp-row-item:last-child { border-bottom: none; }
.sp-row-main { font-size: 13px; font-weight: 500; color: var(--app-text-main); }
.doc-template-label { font-size: 10px; color: var(--app-text-dim); opacity: 0.7; margin-top: 2px; font-family: 'Space Mono', monospace; text-transform: lowercase; }

.sp-title-action-btn {
  background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444; border-radius: 6px; padding: 3px 8px; font-size: 10px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;
}
.sp-title-action-btn:hover { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.4); }

.doc-row { align-items: flex-start; padding: 12px 14px; }
.doc-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.doc-actions { display: flex; align-items: center; gap: 8px; }

.doc-action-btn {
  width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--app-border);
  background: var(--app-surface); color: var(--app-text-dim); display: flex;
  align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
  font-size: 14px;
}
.doc-action-btn:hover { background: rgba(79, 110, 247, 0.12); color: #4f6ef7; border-color: rgba(79, 110, 247, 0.3); transform: translateY(-2px); }
.doc-action-btn.delete:hover { background: rgba(239, 68, 68, 0.08); color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }

.sp-empty-state { padding: 12px 14px; border-radius: 10px; border: 1px dashed var(--app-border); color: var(--app-text-dim); font-size: 12px; }

.contract-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.contract-signed  { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
.contract-pending { background: rgba(136,146,176,0.1); color: var(--app-text-dim); border: 1px solid rgba(136,146,176,0.2); }

.payment-value { font-family: 'Space Mono', monospace; font-weight: 700; color: #10b981; }
.payment-zero  { color: var(--app-text-dim); font-style: italic; }

.sp-adj-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px; background: var(--app-card); border: 1px solid var(--app-border); border-radius: 10px; }
.sp-adj-label { font-size: 13px; font-weight: 500; color: var(--app-text-main); flex-shrink: 0; min-width: 100px; }
.sp-adj-input-wrap { display: flex; align-items: center; gap: 8px; flex: 1; justify-content: flex-end; }
.sp-adj-input { width: 120px; padding: 6px 10px; font-size: 13px; text-align: right; }
.sp-adj-save-btn {
  width: 32px; height: 32px; border: none; border-radius: 7px; cursor: pointer;
  background: rgba(79,110,247,0.12); color: #4f6ef7; font-size: 16px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.sp-adj-save-btn:hover:not(:disabled) { background: rgba(79,110,247,0.25); }
.sp-adj-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
