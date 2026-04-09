<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '../BaseModal.vue'
import UiButton from '../../components/ui/UiButton.vue'
import UiInput from '../../components/ui/UiInput.vue'
import { useModalStore } from '../../stores/modal.store'
import { useNotificationStore } from '../../stores/notification.store'
import { invoicesApi } from '../../api/invoices.api'

const { t } = useI18n()
const modal = useModalStore()
const notifications = useNotificationStore()

type Tab = 'series' | 'vat' | 'email' | 'ksef'
const activeTab = ref<Tab>('series')
const saving = ref(false)
const loading = ref(true)

// ── Tab: Number Series ──────────────────────────────────────────────
const series = reactive({
  b2c_prefix: 'FA',
  b2c_separator: '/',
  b2c_format: 'YYYY/MM/NNN',
  b2b_prefix: 'FV/B2B',
  b2b_separator: '/',
  b2b_format: 'YYYY/MM/NNN',
  proforma_prefix: 'PF',
  correction_prefix: 'FK',
  next_b2c_number: 1,
  next_b2b_number: 1,
})

// ── Tab: VAT Defaults ───────────────────────────────────────────────
const vat = reactive({
  default_vat_rate: '23',
  available_rates: ['0', '5', '8', '23', 'zw', 'np'] as string[],
  default_currency: 'PLN',
  default_payment_method: 'transfer',
  payment_due_days: 14,
})

// ── Tab: Email Template ─────────────────────────────────────────────
const email = reactive({
  sender_name: '',
  sender_email: '',
  subject_template: '',
  body_template: '',
  cc_accounting: '',
  attach_pdf: true,
})

// ── Tab: KSeF ───────────────────────────────────────────────────────
const ksef = reactive({
  enabled: false,
  environment: 'test' as 'test' | 'prod',
  nip: '',
  token: '',
  auto_send_on_issue: false,
  auto_send_b2b_only: true,
})

onMounted(async () => {
  try {
    const settings = await invoicesApi.getSettings()
    if (settings.series)   Object.assign(series, settings.series)
    if (settings.vat)      Object.assign(vat, settings.vat)
    if (settings.email)    Object.assign(email, settings.email)
    if (settings.ksef)     Object.assign(ksef, settings.ksef)
  } catch {
    // Settings not yet configured — use form defaults
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  saving.value = true
  try {
    await invoicesApi.saveSettings({ series, vat, email, ksef })
    notifications.addToast(t('common.savedSuccessfully'), 'success')
    modal.close()
  } catch (err: any) {
    notifications.addToast(err.message || t('common.error'), 'error')
  } finally {
    saving.value = false
  }
}

const TABS: { id: Tab; icon: string; labelKey: string }[] = [
  { id: 'series', icon: '🔢', labelKey: 'faktury.modals.settings.tabs.series' },
  { id: 'vat',    icon: '💶', labelKey: 'faktury.modals.settings.tabs.vat' },
  { id: 'email',  icon: '✉️',  labelKey: 'faktury.modals.settings.tabs.email' },
  { id: 'ksef',   icon: '🏛',  labelKey: 'faktury.modals.settings.tabs.ksef' },
]
</script>

<template>
  <BaseModal popupClass="popup-invoice-settings">
    <!-- Header -->
    <div class="modal-header">
      <div class="header-icon">⚙️</div>
      <div class="header-text">
        <h2 class="popup-title">{{ $t('faktury.modals.settings.title') }}</h2>
        <p class="popup-sub">{{ $t('faktury.modals.settings.subtitle') }}</p>
      </div>
      <button class="close-btn" @click="modal.close">✕</button>
    </div>

    <!-- Tab Nav -->
    <div class="tab-nav">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span>{{ tab.icon }}</span>
        {{ t(tab.labelKey) }}
      </button>
    </div>

    <!-- Body -->
    <div class="scroll-body" v-if="!loading">

      <!-- ── Series Tab ── -->
      <template v-if="activeTab === 'series'">
        <div class="section-card">
          <label class="section-label">👤 {{ $t('faktury.modals.settings.b2cSeries') }}</label>
          <div class="form-grid">
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.prefix') }}</label>
              <input class="premium-input-raw font-mono" v-model="series.b2c_prefix" placeholder="FA" />
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.format') }}</label>
              <input class="premium-input-raw font-mono" v-model="series.b2c_format" placeholder="YYYY/MM/NNN" />
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.proformaPrefix') }}</label>
              <input class="premium-input-raw font-mono" v-model="series.proforma_prefix" placeholder="PF" />
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.correctionPrefix') }}</label>
              <input class="premium-input-raw font-mono" v-model="series.correction_prefix" placeholder="FK" />
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.nextNumber') }}</label>
              <input class="premium-input-raw font-mono" type="number" v-model.number="series.next_b2c_number" min="1" />
            </div>
          </div>
        </div>

        <div class="section-card">
          <label class="section-label">🏢 {{ $t('faktury.modals.settings.b2bSeries') }}</label>
          <div class="form-grid">
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.prefix') }}</label>
              <input class="premium-input-raw font-mono" v-model="series.b2b_prefix" placeholder="FV/B2B" />
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.format') }}</label>
              <input class="premium-input-raw font-mono" v-model="series.b2b_format" placeholder="YYYY/MM/NNN" />
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.nextNumber') }}</label>
              <input class="premium-input-raw font-mono" type="number" v-model.number="series.next_b2b_number" min="1" />
            </div>
          </div>
        </div>

        <div class="info-alert">
          <span>💡</span>
          <p>{{ $t('faktury.modals.settings.seriesHint') }}</p>
        </div>
      </template>

      <!-- ── VAT Tab ── -->
      <template v-if="activeTab === 'vat'">
        <div class="section-card">
          <label class="section-label">{{ $t('faktury.modals.settings.vatDefaults') }}</label>
          <div class="form-grid">
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.defaultVatRate') }}</label>
              <select class="premium-select" v-model="vat.default_vat_rate">
                <option v-for="rate in vat.available_rates" :key="rate" :value="rate">
                  {{ rate === 'zw' ? $t('faktury.modals.settings.vatExempt') : rate === 'np' ? $t('faktury.modals.settings.vatNp') : rate + '%' }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.defaultCurrency') }}</label>
              <select class="premium-select" v-model="vat.default_currency">
                <option value="PLN">PLN — {{ $t('common.currencies.pln') }}</option>
                <option value="EUR">EUR — {{ $t('common.currencies.eur') }}</option>
                <option value="USD">USD — {{ $t('common.currencies.usd') }}</option>
                <option value="UAH">UAH — {{ $t('common.currencies.uah') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.defaultPaymentMethod') }}</label>
              <select class="premium-select" v-model="vat.default_payment_method">
                <option value="transfer">{{ $t('faktury.modals.settings.paymentMethods.transfer') }}</option>
                <option value="card">{{ $t('faktury.modals.settings.paymentMethods.card') }}</option>
                <option value="cash">{{ $t('faktury.modals.settings.paymentMethods.cash') }}</option>
                <option value="imoje">{{ $t('faktury.modals.settings.paymentMethods.imoje') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.paymentDueDays') }}</label>
              <input class="premium-input-raw" type="number" v-model.number="vat.payment_due_days" min="1" max="90" />
            </div>
          </div>
        </div>
      </template>

      <!-- ── Email Tab ── -->
      <template v-if="activeTab === 'email'">
        <div class="section-card">
          <label class="section-label">{{ $t('faktury.modals.settings.senderDetails') }}</label>
          <div class="form-grid">
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.senderName') }}</label>
              <input class="premium-input-raw" v-model="email.sender_name" />
            </div>
            <div class="form-group">
              <label class="mini-label">{{ $t('faktury.modals.settings.senderEmail') }}</label>
              <input class="premium-input-raw" type="email" v-model="email.sender_email" />
            </div>
            <div class="form-group col-span-2">
              <label class="mini-label">{{ $t('faktury.modals.settings.ccAccounting') }}</label>
              <input class="premium-input-raw" type="email" v-model="email.cc_accounting" :placeholder="$t('faktury.modals.settings.ccPlaceholder')" />
            </div>
          </div>
        </div>

        <div class="section-card">
          <label class="section-label">{{ $t('faktury.modals.settings.emailTemplate') }}</label>
          <div class="form-group mb-3">
            <label class="mini-label">{{ $t('faktury.modals.settings.subjectTemplate') }}</label>
            <input class="premium-input-raw" v-model="email.subject_template" :placeholder="$t('faktury.modals.settings.subjectPlaceholder')" />
          </div>
          <div class="form-group">
            <label class="mini-label">{{ $t('faktury.modals.settings.bodyTemplate') }}</label>
            <textarea
              class="premium-input-raw"
              rows="5"
              style="resize: vertical;"
              v-model="email.body_template"
              :placeholder="$t('faktury.modals.settings.bodyPlaceholder')"
            />
          </div>
          <div class="vars-hint">
            <span class="vars-label">{{ $t('faktury.modals.settings.availableVars') }}:</span>
            <code>&#123;&#123;buyer_name&#125;&#125;</code>
            <code>&#123;&#123;invoice_number&#125;&#125;</code>
            <code>&#123;&#123;amount&#125;&#125;</code>
            <code>&#123;&#123;due_date&#125;&#125;</code>
          </div>
          <label class="toggle-row mt-3">
            <input type="checkbox" v-model="email.attach_pdf" />
            <span>{{ $t('faktury.modals.settings.attachPdf') }}</span>
          </label>
        </div>
      </template>

      <!-- ── KSeF Tab ── -->
      <template v-if="activeTab === 'ksef'">
        <div class="section-card">
          <div class="ksef-header">
            <div>
              <label class="section-label" style="margin-bottom: 4px">{{ $t('faktury.modals.settings.ksefIntegration') }}</label>
              <p class="ksef-desc">{{ $t('faktury.modals.settings.ksefDesc') }}</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="ksef.enabled" />
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <template v-if="ksef.enabled">
          <div class="section-card">
            <label class="section-label">{{ $t('faktury.modals.settings.ksefCredentials') }}</label>
            <div class="form-grid">
              <div class="form-group col-span-2">
                <label class="mini-label">{{ $t('faktury.modals.settings.ksefEnv') }}</label>
                <div class="env-toggle">
                  <button
                    class="env-btn"
                    :class="{ active: ksef.environment === 'test' }"
                    @click="ksef.environment = 'test'"
                  >
                    🧪 {{ $t('faktury.modals.settings.ksefTest') }}
                  </button>
                  <button
                    class="env-btn env-btn-prod"
                    :class="{ active: ksef.environment === 'prod' }"
                    @click="ksef.environment = 'prod'"
                  >
                    🏛 {{ $t('faktury.modals.settings.ksefProd') }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="mini-label">NIP</label>
                <input class="premium-input-raw font-mono" v-model="ksef.nip" placeholder="0000000000" maxlength="10" />
              </div>
              <div class="form-group">
                <label class="mini-label">{{ $t('faktury.modals.settings.ksefToken') }}</label>
                <input class="premium-input-raw font-mono" type="password" v-model="ksef.token" />
              </div>
            </div>
          </div>

          <div class="section-card">
            <label class="section-label">{{ $t('faktury.modals.settings.ksefAutoSend') }}</label>
            <label class="toggle-row">
              <input type="checkbox" v-model="ksef.auto_send_on_issue" />
              <span>{{ $t('faktury.modals.settings.ksefAutoSendOnIssue') }}</span>
            </label>
            <label class="toggle-row mt-2">
              <input type="checkbox" v-model="ksef.auto_send_b2b_only" />
              <span>{{ $t('faktury.modals.settings.ksefB2bOnly') }}</span>
            </label>
          </div>

          <div class="info-alert warning" v-if="ksef.environment === 'prod'">
            <span>⚠️</span>
            <p>{{ $t('faktury.modals.settings.ksefProdWarning') }}</p>
          </div>
        </template>
      </template>

    </div>

    <!-- Loading skeleton -->
    <div v-else class="skeleton-body">
      <div v-for="i in 3" :key="i" class="skeleton-line" :style="{ width: (70 + i * 8) + '%' }" />
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      <UiButton variant="ghost" @click="modal.close">{{ t('common.cancel') }}</UiButton>
      <UiButton variant="primary" :loading="saving" :disabled="loading" @click="handleSave">
        💾 {{ t('common.save') }}
      </UiButton>
    </div>
  </BaseModal>
</template>

<style scoped>
.popup-invoice-settings { max-width: 620px; padding: 0 !important; overflow: hidden; }

/* Header */
.modal-header {
  padding: 20px 24px 16px;
  background: var(--app-card-hi);
  border-bottom: 1px solid var(--app-border);
  display: flex;
  gap: 14px;
  align-items: flex-start;
}
.header-icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: rgba(79, 110, 247, 0.1);
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.header-text { flex: 1; }
.popup-title { font-size: 18px; font-weight: 800; color: var(--app-text-main); margin: 0; }
.popup-sub { font-size: 12px; color: var(--app-text-dim); margin: 3px 0 0; }
.close-btn {
  background: none; border: none; font-size: 18px; cursor: pointer;
  color: var(--app-text-dim); padding: 4px; border-radius: 6px; transition: color 0.15s;
}
.close-btn:hover { color: var(--app-text-main); }

/* Tab Nav */
.tab-nav {
  display: flex;
  gap: 2px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--app-border);
  background: var(--app-bg);
}
.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 9px; font-size: 12px; font-weight: 700;
  color: var(--app-text-dim); border: none; cursor: pointer;
  background: transparent; transition: all 0.15s; font-family: 'Outfit', sans-serif;
}
.tab-btn:hover { background: var(--app-card-hi); color: var(--app-text-main); }
.tab-btn.active { background: var(--app-primary); color: #fff; }

/* Body */
.scroll-body {
  padding: 20px 24px;
  max-height: 58vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.scroll-body::-webkit-scrollbar { width: 5px; }
.scroll-body::-webkit-scrollbar-thumb { background: var(--app-border); border-radius: 8px; }

/* Cards & Form */
.section-card { border: 1px solid var(--app-border); border-radius: 14px; padding: 16px; background: var(--app-card); }
.section-label { font-size: 10px; font-weight: 800; color: var(--app-primary); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 12px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.col-span-2 { grid-column: span 2; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.mb-3 { margin-bottom: 12px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }

.mini-label { font-size: 11px; font-weight: 600; color: var(--app-text-dim); }

.premium-input-raw {
  width: 100%; background: var(--app-bg); border: 1px solid var(--app-border);
  border-radius: 9px; padding: 9px 12px; color: var(--app-text-main); font-size: 13px;
  outline: none; font-family: 'Outfit', sans-serif; transition: border-color 0.15s;
}
.premium-input-raw:focus { border-color: var(--app-primary); }
.premium-input-raw.font-mono { font-family: 'Space Mono', monospace; }

.premium-select {
  width: 100%; background: var(--app-bg); border: 1px solid var(--app-border);
  border-radius: 9px; padding: 9px 12px; color: var(--app-text-main); font-size: 13px;
  outline: none; cursor: pointer; appearance: none; font-family: 'Outfit', sans-serif;
}
.premium-select:focus { border-color: var(--app-primary); }

/* Info Alerts */
.info-alert {
  display: flex; gap: 10px; align-items: flex-start;
  background: rgba(79, 110, 247, 0.06); border: 1px solid rgba(79, 110, 247, 0.15);
  border-radius: 12px; padding: 12px 14px; font-size: 12px; color: var(--app-text-dim); line-height: 1.5;
}
.info-alert.warning {
  background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.2); color: #b45309;
}
.info-alert p { margin: 0; }

/* Toggle Row */
.toggle-row {
  display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px;
  font-weight: 500; color: var(--app-text-main); user-select: none;
}
.toggle-row input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--app-primary); cursor: pointer; }

/* Email vars hint */
.vars-hint { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; font-size: 11px; color: var(--app-text-dim); }
.vars-label { font-weight: 600; }
.vars-hint code { background: var(--app-card-hi); border: 1px solid var(--app-border); border-radius: 5px; padding: 1px 6px; font-size: 11px; color: var(--app-primary); }

/* KSeF */
.ksef-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.ksef-desc { font-size: 12px; color: var(--app-text-dim); margin: 2px 0 0; line-height: 1.5; }

.env-toggle { display: flex; gap: 6px; }
.env-btn {
  flex: 1; padding: 8px 12px; border-radius: 9px; font-size: 12px; font-weight: 700;
  border: 1px solid var(--app-border); background: var(--app-bg); cursor: pointer;
  color: var(--app-text-dim); transition: all 0.15s; font-family: 'Outfit', sans-serif;
}
.env-btn.active { background: var(--app-primary); color: white; border-color: var(--app-primary); }
.env-btn-prod.active { background: #dc2626; border-color: #dc2626; }

/* Toggle Switch (KSeF enable) */
.toggle-switch { position: relative; display: inline-flex; width: 44px; height: 24px; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; inset: 0; background: var(--app-border); border-radius: 24px; cursor: pointer; transition: 0.2s;
}
.toggle-switch input:checked + .slider { background: var(--app-primary); }
.slider::before {
  content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px;
  background: white; border-radius: 50%; transition: 0.2s;
}
.toggle-switch input:checked + .slider::before { transform: translateX(20px); }

/* Skeleton */
.skeleton-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.skeleton-line {
  height: 16px; border-radius: 8px;
  background: linear-gradient(90deg, var(--app-bg) 25%, var(--app-card-hi) 50%, var(--app-bg) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.4s infinite;
}
@keyframes skeleton-loading { from { background-position: 200% 0; } to { background-position: -200% 0; } }

/* Footer */
.modal-footer {
  padding: 14px 24px;
  background: var(--app-card-hi);
  border-top: 1px solid var(--app-border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
