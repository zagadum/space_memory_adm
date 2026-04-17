<template>
  <div class="link-generator-page">
    <div class="page-shell">
      <div class="page-header">
        <div>
          <div class="page-eyebrow">{{ currentProjectLabel }}</div>
          <h1 class="page-title">{{ t('sidebar.linkGenerator') }}</h1>
          <p class="page-desc">{{ activeTab === 'personal' ? t('linkGenerator.personalDesc') : t('linkGenerator.marketingDesc') }}</p>
        </div>
      </div>

      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'personal' }"
          type="button"
          @click="activeTab = 'personal'"
        >
          {{ t('linkGenerator.tabPersonal') }}
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'marketing' }"
          type="button"
          @click="activeTab = 'marketing'"
        >
          {{ t('linkGenerator.tabMarketing') }}
        </button>
      </div>

      <section v-if="activeTab === 'personal'" class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">{{ t('linkGenerator.personalTitle') }}</h2>
            <p class="panel-subtitle">{{ t('linkGenerator.personalFlowHint') }}</p>
          </div>
        </div>

        <div class="grid grid-2">
          <UiInput v-model="personalForm.first_name" :label="t('recruitment.form.firstName')" :placeholder="t('recruitment.form.firstName')" />
          <UiInput v-model="personalForm.surname" :label="t('recruitment.form.lastName')" :placeholder="t('recruitment.form.lastName')" />
          <UiInput v-model="personalForm.parent_email" type="email" :label="t('recruitment.form.parentEmail')" placeholder="parent@example.com" />
          <UiInput v-model="personalForm.nickname" type="email" :label="t('recruitment.form.studentEmail')" placeholder="student_nickname" />
          <UiInput v-model="personalForm.phone" type="tel" :label="t('recruitment.form.phone')" placeholder="+48..." />
          <UiInput v-model="personalForm.subscription_amount" type="number" :label="t('recruitment.form.subscriptionAmount')" placeholder="489" />
          <UiInput v-model="personalForm.discount" type="number" :label="t('recruitment.form.discount')" placeholder="0" />
          <div>
            <div class="field-label">{{ t('recruitment.form.contract') }}</div>
            <select v-model="personalForm.contract_old_new" class="select-input">
              <option value="contract_399">Contract 399 zł</option>
              <option value="contract_489">Contract 489 zł</option>
              <option value="contract_600">Contract 600 zł</option>
              <option value="contract_689">Contract 689 zł</option>
            </select>
          </div>
        </div>

        <p class="hint-text">{{ t('linkGenerator.personalNicknameHint') }}</p>
        <div v-if="personalError" class="error-box">{{ personalError }}</div>

        <div class="actions">
          <UiButton variant="ghost" :loading="personalCreating" :disabled="!isPersonalFormValid || isPersonalBusy" @click="handleCreateDraft">
            {{ t('linkGenerator.personalCreateDraft') }}
          </UiButton>
          <UiButton variant="ghost" :loading="personalGenerating" :disabled="!isPersonalFormValid || isPersonalBusy" @click="handleGeneratePersonalLink">
            {{ t('linkGenerator.personalGenerateLink') }}
          </UiButton>
          <UiButton variant="primary" :loading="personalSending" :disabled="!isPersonalFormValid || isPersonalBusy" @click="handleCreateAndSend">
            {{ t('linkGenerator.personalCreateAndSend') }}
          </UiButton>
        </div>

        <div class="link-box">
          <div class="link-box-title">{{ t('linkGenerator.personalLinkBox') }}</div>
          <div class="link-box-value">
            <template v-if="personalGeneratedLink">{{ personalGeneratedLink }}</template>
            <template v-else>{{ t('linkGenerator.personalLinkPlaceholder') }}</template>
          </div>
          <div class="link-box-footer">
            <span v-if="createdImportId" class="draft-badge">{{ t('linkGenerator.personalDraftId') }} #{{ createdImportId }}</span>
            <UiButton variant="ghost" size="sm" :disabled="!personalGeneratedLink" @click="copyToClipboard(personalGeneratedLink, t('linkGenerator.notifCopied'))">
              {{ t('linkGenerator.personalCopyCurrent') }}
            </UiButton>
          </div>
        </div>

        <div class="panel-header section-gap">
          <div>
            <h3 class="panel-title panel-title--sm">{{ t('linkGenerator.personalHistoryTitle') }}</h3>
            <p class="panel-subtitle">{{ t('linkGenerator.personalHistorySubtitle') }}</p>
          </div>
        </div>

        <div v-if="importDbStore.isLoading && !personalHistory.length" class="empty-state">{{ t('common.loadingData') }}</div>
        <div v-else-if="!personalHistory.length" class="empty-state">{{ t('linkGenerator.personalHistoryEmpty') }}</div>
        <div v-else class="history-table-wrap">
          <table class="history-table">
            <thead>
              <tr>
                <th>{{ t('recruitment.form.firstName') }}</th>
                <th>{{ t('recruitment.form.parentEmail') }}</th>
                <th>{{ t('recruitment.form.studentEmail') }}</th>
                <th>{{ t('linkGenerator.personalHistoryStatus') }}</th>
                <th>{{ t('linkGenerator.personalLinkBox') }}</th>
                <th>{{ t('importDb.table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in personalHistory" :key="item.id">
                <td>{{ item.first_name }} {{ item.surname }}</td>
                <td>{{ item.parent_email || '—' }}</td>
                <td>{{ item.nickname || '—' }}</td>
                <td><span class="status-pill" :class="statusClass(item)">{{ personalStatusLabel(item) }}</span></td>
                <td class="history-link">{{ personalLinkById(item.id) || '—' }}</td>
                <td class="history-actions">
                  <button class="mini-btn" type="button" @click="generateLinkForHistory(item.id)">{{ t('linkGenerator.personalGenerateLink') }}</button>
                  <button class="mini-btn" type="button" @click="sendInviteForHistory(item.id)">{{ t('linkGenerator.personalSendAgain') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">{{ t('linkGenerator.marketingTitle') }}</h2>
            <p class="panel-subtitle">{{ t('linkGenerator.marketingFlowHint') }}</p>
          </div>
          <div class="role-pill" :class="{ 'role-pill--privileged': isPrivileged }">
            {{ isPrivileged ? t('linkGenerator.roleSuperadmin') : t('linkGenerator.roleManager') }}
          </div>
        </div>

        <div class="grid grid-2">
          <div>
            <div class="field-label">{{ t('linkGenerator.step2Label') }}</div>
            <div class="tariff-row">
              <button
                v-for="tariff in tariffOptions"
                :key="tariff"
                class="tariff-pill"
                :class="{ active: marketingTariff === tariff, locked: isTariffLocked(tariff) }"
                type="button"
                @click="setMarketingTariff(tariff)"
              >
                {{ tariff }} zł
              </button>
              <input
                v-if="isPrivileged"
                v-model.number="customTariff"
                class="custom-tariff"
                type="number"
                min="1"
                :placeholder="t('linkGenerator.tariffCustomPlaceholder')"
                @input="onCustomTariffInput"
              >
            </div>
            <div v-if="marketingTariffLocked" class="warning-inline">{{ t('linkGenerator.tariffLockTip') }}</div>
          </div>

          <div>
            <div class="field-label">{{ t('linkGenerator.step3Label') }}</div>
            <div class="discount-list">
              <label v-for="disc in availableDiscounts" :key="disc.id" class="discount-item">
                <input type="checkbox" :checked="selectedDiscounts.has(disc.id)" @change="toggleDiscount(disc.id)">
                <span>{{ disc.name }}</span>
                <span class="discount-meta">{{ disc.badge }}</span>
              </label>
            </div>
          </div>
        </div>

        <div v-if="selectedDiscounts.has('second') || selectedDiscounts.has('referral')" class="grid grid-1 section-gap-sm">
          <UiInput
            v-model="marketingPartnerChildName"
            :label="selectedDiscounts.has('second') ? t('linkGenerator.subfieldSecondLabel') : t('linkGenerator.subfieldReferrerLabel')"
            :placeholder="t('linkGenerator.subfieldStudentPlaceholder')"
          />
        </div>

        <div class="calc-box">
          <div class="calc-title">{{ t('linkGenerator.calcTitle') }}</div>
          <div class="calc-row">
            <span>{{ t('linkGenerator.calcBaseTariff') }}</span>
            <strong>{{ marketingTariff }} zł</strong>
          </div>
          <div v-for="row in marketingCalculationRows" :key="row.label" class="calc-row" :class="row.cls">
            <span>{{ row.label }}</span>
            <strong>{{ row.val }}</strong>
          </div>
        </div>

        <div class="link-box">
          <div class="link-box-title">{{ t('linkGenerator.urlBoxTitle') }}</div>
          <div class="link-box-value">
            <template v-if="marketingGeneratedLink">{{ marketingGeneratedLink }}</template>
            <template v-else>{{ t('linkGenerator.marketingLinkPlaceholder') }}</template>
          </div>
          <div class="link-box-footer">
            <UiButton variant="ghost" size="sm" :disabled="!marketingGeneratedLink" @click="copyToClipboard(marketingGeneratedLink, t('linkGenerator.notifCopied'))">
              {{ t('linkGenerator.btnCopy') }}
            </UiButton>
            <UiButton variant="primary" size="sm" :loading="marketingStore.isLoading" @click="handleGenerateMarketing">
              {{ t('linkGenerator.btnGenerate') }}
            </UiButton>
          </div>
        </div>

        <div class="panel-header section-gap">
          <div>
            <h3 class="panel-title panel-title--sm">{{ t('linkGenerator.marketingHistoryTitle') }}</h3>
            <p class="panel-subtitle">{{ t('linkGenerator.marketingHistorySubtitle') }}</p>
          </div>
        </div>

        <div v-if="!marketingStore.history.length" class="empty-state">{{ t('linkGenerator.historyEmpty') }}</div>
        <div v-else class="history-cards">
          <article v-for="item in marketingStore.history" :key="item.id" class="history-card">
            <div class="history-card-top">
              <strong>{{ item.student_name }}</strong>
              <span class="status-pill" :class="`status-pill--${item.status}`">{{ marketingStatusLabel(item.status) }}</span>
            </div>
            <div class="history-card-meta">
              <span>{{ item.tariff }} zł</span>
              <span v-if="item.total_price < item.tariff">→ {{ item.total_price }} zł</span>
              <span>{{ item.manager }}</span>
            </div>
            <div class="history-link">{{ item.link }}</div>
            <div class="history-actions">
              <button class="mini-btn" type="button" @click="copyToClipboard(item.link, t('linkGenerator.notifCopied'))">{{ t('linkGenerator.btnCopy') }}</button>
              <button class="mini-btn mini-btn--danger" type="button" @click="deleteMarketingHistory(item.id)">{{ t('common.cancel') }}</button>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import UiButton from '../../components/ui/UiButton.vue'
import UiInput from '../../components/ui/UiInput.vue'
import { useNotificationStore } from '../../stores/notification.store'
import { useImportDbStore } from '../../stores/importDb.store'
import { useLinkGeneratorStore } from '../../stores/linkGenerator.store'
import { useAuthStore } from '../../stores/auth.store'
import { getRecruitmentApi } from '../../api/recruitmentApi'
import type { RecruitmentBackend } from '../../api/http'
import type { ImportDbItem } from '../../api/importDbApi'
import { normalizeRole } from '../../config/roleMenuAccess.config'

type DiscountRow = {
  id: string
  name: string
  badge: string
  value: number
  type: 'fixed' | 'percent'
}

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()
const notifications = useNotificationStore()
const importDbStore = useImportDbStore()
const marketingStore = useLinkGeneratorStore()

const backend = computed<RecruitmentBackend>(() => route.meta.recruitmentBackend === 'indigo' ? 'indigo' : 'default')
const currentProjectLabel = computed(() => backend.value === 'indigo' ? 'Indigo' : 'Space Memory')
const activeTab = ref<'personal' | 'marketing'>('personal')

const personalForm = reactive({
  first_name: '',
  surname: '',
  parent_email: '',
  nickname: '',
  phone: '',
  subscription_amount: 489,
  contract_old_new: 'contract_489',
  discount: 0,
  balance_overpayment: 0,
})

const createdImportId = ref<number | string | null>(null)
const personalGeneratedLink = ref('')
const personalLinks = ref<Record<string, string>>({})
const personalError = ref<string | null>(null)
const personalCreating = ref(false)
const personalGenerating = ref(false)
const personalSending = ref(false)

const isPersonalBusy = computed(() => personalCreating.value || personalGenerating.value || personalSending.value || importDbStore.isLoading)
const isPersonalFormValid = computed(() =>
  Boolean(
    personalForm.first_name.trim() &&
    personalForm.surname.trim() &&
    personalForm.parent_email.trim() &&
    personalForm.nickname.trim(),
  ),
)

const personalHistory = computed(() => importDbStore.items)

const isPrivileged = computed(() => {
  const role = normalizeRole(authStore.user?.role)
  return role === 'admin' || role === 'super-admin'
})

const tariffOptions = [399, 489, 549]
const marketingTariff = ref(489)
const customTariff = ref<number | null>(null)
const marketingTariffLocked = ref(false)
const selectedDiscounts = ref<Set<string>>(new Set())
const marketingPartnerChildName = ref('')
const marketingGeneratedLink = ref('')

const availableDiscounts = computed<DiscountRow[]>(() => [
  { id: 'fast', name: t('linkGenerator.discFastName'), badge: '−20 zł', value: 20, type: 'fixed' },
  { id: 'trial', name: t('linkGenerator.discTrialName'), badge: '−100 zł', value: 100, type: 'fixed' },
  { id: 'second', name: t('linkGenerator.discSecondName'), badge: '−10%', value: 10, type: 'percent' },
  { id: 'referral', name: t('linkGenerator.discReferralName'), badge: '−5%', value: 5, type: 'percent' },
])

const activeMarketingDiscounts = computed(() =>
  availableDiscounts.value.filter((disc) => selectedDiscounts.value.has(disc.id)),
)

const marketingCalculationRows = computed(() => {
  let price = marketingTariff.value
  const rows: Array<{ label: string; val: string; cls?: string }> = []

  activeMarketingDiscounts.value
    .filter((item) => item.type === 'percent')
    .forEach((item) => {
      const amount = Math.round(price * (item.value / 100))
      rows.push({ label: `${item.name} ${item.badge}`, val: `−${amount} zł`, cls: 'calc-row--saving' })
      price -= amount
    })

  activeMarketingDiscounts.value
    .filter((item) => item.type === 'fixed')
    .forEach((item) => {
      rows.push({ label: item.name, val: item.badge, cls: 'calc-row--saving' })
      price -= item.value
    })

  const finalPrice = Math.max(0, Math.round(price))
  rows.push({ label: t('linkGenerator.calcTotal'), val: `${finalPrice} zł`, cls: 'calc-row--total' })
  return rows
})

function extractData(payload: any) {
  return payload?.data?.data ?? payload?.data ?? payload
}

async function refreshPersonalHistory() {
  await importDbStore.fetchImportDbList(1, backend.value)
}

async function refreshMarketingHistory() {
  await marketingStore.fetchHistory(backend.value)
}

function resolveCreatedImportId(response: any) {
  const data = extractData(response)
  const directId = data?.id
  if (directId !== undefined && directId !== null) return directId

  const matched = importDbStore.items.find((item) =>
    item.nickname === personalForm.nickname &&
    item.parent_email === personalForm.parent_email &&
    item.first_name === personalForm.first_name,
  )
  return matched?.id ?? null
}

async function ensureDraft() {
  if (createdImportId.value) return createdImportId.value

  personalCreating.value = true
  personalError.value = null
  try {
    const response = await getRecruitmentApi(backend.value).inviteNewStudent({
      first_name: personalForm.first_name,
      surname: personalForm.surname,
      email: personalForm.parent_email,
      parent_email: personalForm.parent_email,
      nickname: personalForm.nickname,
      phone: personalForm.phone,
      subscription_amount: personalForm.subscription_amount,
      contract_old_new: personalForm.contract_old_new,
      discount: personalForm.discount,
      balance_overpayment: personalForm.balance_overpayment,
    })

    await refreshPersonalHistory()
    createdImportId.value = resolveCreatedImportId(response)
    if (!createdImportId.value) {
      throw new Error(t('common.savedError'))
    }

    notifications.addToast(t('linkGenerator.notifDraftCreated'), 'success')
    return createdImportId.value
  } catch (error: any) {
    personalError.value = error?.response?.data?.message || error?.message || t('recruitment.inviteError')
    throw error
  } finally {
    personalCreating.value = false
  }
}

async function handleCreateDraft() {
  await ensureDraft()
}

async function generateLinkById(id: number | string) {
  personalGenerating.value = true
  personalError.value = null
  try {
    const response = await importDbStore.generateLink(id)
    const data = extractData(response)
    const link = data?.link
    if (!link) {
      throw new Error(t('linkGenerator.notifError'))
    }
    personalLinks.value[String(id)] = link
    if (String(id) === String(createdImportId.value)) {
      personalGeneratedLink.value = link
    }
    notifications.addToast(t('linkGenerator.notifPersonalLinkGenerated'), 'success')
  } catch (error: any) {
    personalError.value = error?.response?.data?.message || error?.message || t('linkGenerator.notifError')
    throw error
  } finally {
    personalGenerating.value = false
  }
}

async function handleGeneratePersonalLink() {
  const id = await ensureDraft()
  await generateLinkById(id)
}

async function sendInviteById(id: number | string) {
  personalSending.value = true
  personalError.value = null
  try {
    await importDbStore.resendInvitation(id)
    await refreshPersonalHistory()
    notifications.addToast(t('linkGenerator.notifInviteSent'), 'success')
  } catch (error: any) {
    personalError.value = error?.response?.data?.message || error?.message || t('recruitment.inviteError')
    throw error
  } finally {
    personalSending.value = false
  }
}

async function handleCreateAndSend() {
  const id = await ensureDraft()
  await sendInviteById(id)
}

async function generateLinkForHistory(id: number | string) {
  createdImportId.value = id
  await generateLinkById(id)
}

async function sendInviteForHistory(id: number | string) {
  createdImportId.value = id
  await sendInviteById(id)
}

function personalStatusLabel(item: ImportDbItem) {
  if (Number(item.is_done)) return t('linkGenerator.personalStatusDone')
  if (Number(item.is_send)) return t('linkGenerator.personalStatusSent')
  return t('linkGenerator.personalStatusDraft')
}

function statusClass(item: ImportDbItem) {
  if (Number(item.is_done)) return 'status-pill--done'
  if (Number(item.is_send)) return 'status-pill--sent'
  return 'status-pill--draft'
}

function personalLinkById(id: number | string) {
  return personalLinks.value[String(id)] || ''
}

function copyToClipboard(text: string, successMessage: string) {
  if (!text) return
  navigator.clipboard.writeText(text).catch(() => {})
  notifications.addToast(successMessage, 'success')
}

function isTariffLocked(value: number) {
  return !isPrivileged.value && value === 399
}

function setMarketingTariff(value: number) {
  if (isTariffLocked(value)) {
    marketingTariffLocked.value = true
    window.setTimeout(() => {
      marketingTariffLocked.value = false
    }, 3000)
    return
  }
  marketingTariff.value = value
  customTariff.value = null
}

function onCustomTariffInput() {
  if (isPrivileged.value && customTariff.value && customTariff.value > 0) {
    marketingTariff.value = customTariff.value
  }
}

function toggleDiscount(id: string) {
  const next = new Set(selectedDiscounts.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedDiscounts.value = next
}

async function handleGenerateMarketing() {
  try {
    const response = await marketingStore.generateLink({
      first_name: currentProjectLabel.value,
      surname: t('linkGenerator.tabMarketing'),
      parent_email: 'marketing@example.com',
      tariff: marketingTariff.value,
      total_price: Number(marketingCalculationRows.value.at(-1)?.val.replace(/\D/g, '') || marketingTariff.value),
      discounts: activeMarketingDiscounts.value.map((item) => ({
        id: item.id,
        value: item.value,
        type: item.type,
        name: item.name,
      })),
      manager_name: currentProjectLabel.value,
      partner_child_name: marketingPartnerChildName.value || undefined,
    }, backend.value)

    marketingGeneratedLink.value = extractData(response)?.link || ''
    notifications.addToast(t('linkGenerator.notifGenerated'), 'success')
  } catch {
    notifications.addToast(t('linkGenerator.notifError'), 'error')
  }
}

function marketingStatusLabel(status: string) {
  if (status === 'converted') return t('linkGenerator.statusConverted')
  if (status === 'sent') return t('linkGenerator.statusSent')
  return t('linkGenerator.statusGenerated')
}

function deleteMarketingHistory(id: number) {
  marketingStore.deleteLink(id)
}

watch(backend, async () => {
  createdImportId.value = null
  personalGeneratedLink.value = ''
  personalLinks.value = {}
  await Promise.all([refreshPersonalHistory(), refreshMarketingHistory()])
}, { immediate: false })

onMounted(async () => {
  await Promise.all([refreshPersonalHistory(), refreshMarketingHistory()])
})
</script>

<style scoped>
.link-generator-page {
  min-height: 100%;
  padding: 24px 24px 64px;
}

.page-shell {
  max-width: 1160px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--app-text-dim);
}

.page-title {
  margin: 8px 0 6px;
  font-size: 30px;
  line-height: 1.1;
  color: var(--app-text-main);
}

.page-desc {
  margin: 0;
  color: var(--app-text-dim);
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.tab-btn {
  border: 1px solid var(--app-border);
  background: var(--app-card);
  color: var(--app-text-dim);
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.tab-btn.active {
  color: var(--app-text-main);
  border-color: var(--blue);
  box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.12);
}

.panel {
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--app-shadow);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  color: var(--app-text-main);
}

.panel-title--sm {
  font-size: 16px;
}

.panel-subtitle {
  margin: 4px 0 0;
  color: var(--app-text-dim);
  font-size: 13px;
}

.section-gap {
  margin-top: 24px;
}

.section-gap-sm {
  margin-top: 10px;
}

.grid {
  display: grid;
  gap: 14px;
}

.grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-1 {
  grid-template-columns: 1fr;
}

.field-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--app-text-dim);
  margin-bottom: 6px;
}

.select-input,
.custom-tariff {
  width: 100%;
  min-height: 44px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  color: var(--app-text-main);
  padding: 0 12px;
  box-sizing: border-box;
}

.hint-text {
  color: var(--app-text-dim);
  font-size: 12px;
  margin: 12px 0 0;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.error-box,
.warning-inline {
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
}

.error-box {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--red);
}

.warning-inline {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: var(--amber);
}

.link-box {
  margin-top: 18px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 14px;
}

.link-box-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--app-text-dim);
}

.link-box-value {
  margin-top: 10px;
  color: var(--app-text-main);
  word-break: break-word;
  font-family: 'Space Mono', monospace;
  font-size: 13px;
}

.link-box-footer {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.draft-badge,
.role-pill,
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.draft-badge,
.role-pill {
  background: var(--status-info-bg);
  color: var(--blue);
}

.role-pill--privileged {
  background: var(--status-warning-bg);
  color: var(--amber);
}

.status-pill--draft {
  background: var(--status-warning-bg);
  color: var(--amber);
}

.status-pill--sent,
.status-pill--generated {
  background: var(--status-info-bg);
  color: var(--blue);
}

.status-pill--done,
.status-pill--converted {
  background: var(--status-success-bg);
  color: var(--green);
}

.history-table-wrap {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 12px 10px;
  border-bottom: 1px solid var(--app-border);
  text-align: left;
  font-size: 13px;
  vertical-align: top;
}

.history-table th {
  color: var(--app-text-dim);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.history-link {
  font-family: 'Space Mono', monospace;
  word-break: break-word;
  color: var(--app-text-main);
}

.history-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mini-btn {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-main);
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.mini-btn--danger {
  color: var(--red);
}

.empty-state {
  padding: 28px 16px;
  text-align: center;
  color: var(--app-text-dim);
  border: 1px dashed var(--app-border);
  border-radius: 12px;
}

.tariff-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tariff-pill {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-main);
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Space Mono', monospace;
}

.tariff-pill.active {
  border-color: var(--blue);
  background: rgba(79, 110, 247, 0.1);
}

.tariff-pill.locked {
  opacity: 0.55;
}

.discount-list {
  display: grid;
  gap: 8px;
}

.discount-item {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--app-text-main);
}

.discount-item input {
  margin-right: 8px;
}

.discount-meta {
  color: var(--app-text-dim);
  font-family: 'Space Mono', monospace;
}

.calc-box {
  margin-top: 18px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 14px;
}

.calc-title {
  font-weight: 700;
  color: var(--app-text-main);
  margin-bottom: 8px;
}

.calc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  color: var(--app-text-dim);
}

.calc-row--saving {
  color: var(--amber);
}

.calc-row--total {
  color: var(--green);
  border-top: 1px solid var(--app-border);
  margin-top: 6px;
  padding-top: 10px;
}

.history-cards {
  display: grid;
  gap: 12px;
}

.history-card {
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 14px;
  background: var(--app-surface);
}

.history-card-top,
.history-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.history-card-meta {
  margin-top: 8px;
  color: var(--app-text-dim);
  font-size: 13px;
}

@media (max-width: 900px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
