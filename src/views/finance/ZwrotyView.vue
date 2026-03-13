<script setup lang="ts">
import { ref } from 'vue'
import { useZwrotyStore, PRESET_TITLES } from '../../stores/zwroty.store'
import type { RefundRequest } from '../../stores/zwroty.store'

const store = useZwrotyStore()

// ── Toast ──────────────────────────────────────────────────────────────────
const toast = ref({ show: false, icon: '', t1: '', t2: '', type: 'success' as 'success'|'error'|'info' })
let toastTimer: ReturnType<typeof setTimeout>
function showToast(icon: string, t1: string, t2 = '', type: 'success'|'error'|'info' = 'success') {
  toast.value = { show: true, icon, t1, t2, type }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.value.show = false, 5000)
}

// ── Modals ─────────────────────────────────────────────────────────────────
const rejectModal = ref({ show: false, refundId: 0, studentName: '', reason: '' })
const fkModal = ref({ show: false, refund: null as RefundRequest | null })
const emailModal = ref({ show: false, refund: null as RefundRequest | null, lang: 'pl' as 'pl'|'ua'|'en', subject: '', body: '', isDirty: false })

// ── Utils ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', { day:'2-digit', month:'2-digit', year:'numeric' })
}
function fmtAmt(n: number) { return n.toLocaleString('pl-PL') + ' zł' }

const DEPT: Record<string, { cls: string; label: string }> = {
  sprzedaz:    { cls: 'dept-sales', label: 'Sprzedaż' },
  sekretariat: { cls: 'dept-sekr',  label: 'Sekretariat' },
  dzial_jakosci: { cls: 'dept-vya', label: 'Dz. Jakości' },
  admin:       { cls: 'dept-sekr',  label: 'Admin' },
  super_admin: { cls: 'dept-sekr',  label: 'Super Admin' },
}

function typeLabel(r: RefundRequest) {
  return r.refund_type === 'resignation' ? 'Rezygnacja' : r.refund_type === 'overpayment' ? 'Nadpłata' : 'Inne'
}

// ── Actions ────────────────────────────────────────────────────────────────
function handleApprove(r: RefundRequest) {
  if (!store.rowTitles[r.id]) {
    showToast('⚠️', 'Uzupełnij tytuł zwrotu', 'Wybierz tytuł z listy lub wpisz własny.', 'error')
    return
  }
  store.approveRefund(r.id)
  showToast('✅', `Zwrot zatwierdzony: ${r.student_name}`, `${fmtAmt(r.refund_amount)} · Imoje API uruchomiony · ${r.fk_number} wystawiona`)
}

function openReject(r: RefundRequest) {
  rejectModal.value = { show: true, refundId: r.id, studentName: r.student_name, reason: '' }
}
function submitReject() {
  if (!rejectModal.value.reason.trim()) return
  store.rejectRefund(rejectModal.value.refundId, rejectModal.value.reason)
  rejectModal.value.show = false
  showToast('❌', 'Wniosek odrzucony', 'Manager otrzymał powiadomienie.', 'error')
}

function openFk(r: RefundRequest) { fkModal.value = { show: true, refund: r } }

function openEmail(r: RefundRequest) {
  emailModal.value = { show: true, refund: r, lang: 'pl', subject: '', body: '', isDirty: false }
  fillTpl('pl', r)
}
function setLang(lang: 'pl'|'ua'|'en') {
  emailModal.value.lang = lang
  if (!emailModal.value.isDirty) fillTpl(lang, emailModal.value.refund!)
}
function fillTpl(lang: 'pl'|'ua'|'en', r: RefundRequest) {
  const s = r.student_name, a = fmtAmt(r.refund_amount), fk = r.fk_number ?? '—'
  const T = {
    pl: { sub: `Potwierdzenie zwrotu środków — ${s} · ${fk}`, body: `Szanowni Państwo,\n\nZ przyjemnością informujemy, że zwrot środków w kwocie ${a} za rezygnację z zajęć ucznia/uczennicy ${s} został zatwierdzony i zrealizowany.\n\nŚrodki zostaną zaksięgowane na Państwa koncie bankowym w ciągu 1–2 dni roboczych.\n\nW załączeniu przesyłamy Fakturę Korektę (${fk}) potwierdzającą dokonanie zwrotu.\n\nW razie pytań prosimy o kontakt:\n📧 kontakt@gls.pl\n📞 +48 123 456 789\n\nZ poważaniem,\nZespół Global Leaders Skills` },
    ua: { sub: `Підтвердження повернення коштів — ${s} · ${fk}`, body: `Шановні,\n\nПовідомляємо, що повернення коштів у розмірі ${a} за відмову від занять учня/учениці ${s} було затверджено та виконано.\n\nКошти надійдуть на Ваш банківський рахунок протягом 1–2 робочих днів.\n\nДо листа додається Коригуюча фактура (${fk}), що підтверджує повернення.\n\nЗ питань звертайтесь:\n📧 kontakt@gls.pl\n📞 +48 123 456 789\n\nЗ повагою,\nКоманда Global Leaders Skills` },
    en: { sub: `Refund Confirmation — ${s} · ${fk}`, body: `Dear Parent/Guardian,\n\nWe are pleased to inform you that the refund of ${a} for the cancellation of ${s}'s classes has been approved and processed.\n\nThe funds will be credited to your bank account within 1–2 business days.\n\nPlease find attached the Credit Note (${fk}) confirming the refund.\n\nIf you have any questions:\n📧 kontakt@gls.pl\n📞 +48 123 456 789\n\nKind regards,\nGlobal Leaders Skills Team` },
  }
  emailModal.value.subject = T[lang].sub
  emailModal.value.body = T[lang].body
}
function sendEmail() {
  if (!emailModal.value.subject.trim()) return
  store.markEmailSent(emailModal.value.refund!.id)
  emailModal.value.show = false
  showToast('✉️', `E-mail wysłany do ${emailModal.value.refund!.parent_email}`, `${emailModal.value.refund!.fk_number} załączona jako PDF`, 'info')
}

function onSelectChange(id: number, val: string) {
  store.rowSelectVal[id] = val
  store.rowTitles[id] = val === 'inne' ? '' : val
}
</script>

<template>
  <div class="zw">

    <!-- ── HEADER ── -->
    <div class="zw-hdr">
      <div class="zw-title-row">
        <div class="zw-icon">↩️</div>
        <div>
          <div class="zw-title">Zwroty</div>
          <div class="zw-sub">Zatwierdzanie zwrotów przez głównego księgowego · Integracja Imoje · Faktura Korekta</div>
        </div>
      </div>
      <div class="zw-hdr-actions">
        <button class="btn btn-ghost btn-sm" @click="showToast('📥','Eksport CSV','Plik zwrotów jest pobierany...')">📥 Eksport CSV</button>
        <div class="imoje-tag"><div class="imoje-dot"></div>Imoje połączony</div>
      </div>
    </div>

    <!-- ── ATTENTION ── -->
    <div class="attention">
      <span class="a-ico">⚠️</span>
      <div>Tylko <strong>główny księgowy</strong> może zatwierdzać lub odrzucać wnioski o zwrot. Po zatwierdzeniu system <strong>automatycznie</strong> realizuje zwrot przez Imoje API i generuje <strong>Fakturę Korektę</strong>. Zwrot na inne konto wymaga <strong>ręcznego przelewu</strong> przez ING Business.</div>
    </div>

    <!-- ── STATS ── -->
    <div class="stats">
      <div class="stat-card sc-amber">
        <div class="sc-label">Oczekuje na zatwierdzenie</div>
        <div class="sc-val" style="color:#f59e0b">{{ store.stats.pending_count }}</div>
        <div class="sc-sub">wymaga Twojej decyzji</div>
      </div>
      <div class="stat-card sc-cyan">
        <div class="sc-label">Kwota do zwrotu</div>
        <div class="sc-val" style="color:#06b6d4">{{ store.stats.pending_amount.toLocaleString('pl-PL') }} zł</div>
        <div class="sc-sub">oczekujące wnioski</div>
      </div>
      <div class="stat-card sc-green">
        <div class="sc-label">Zrealizowane</div>
        <div class="sc-val" style="color:#22c55e">{{ store.stats.completed_month }}</div>
        <div class="sc-sub">zwrotów wykonanych</div>
      </div>
      <div class="stat-card sc-red">
        <div class="sc-label">Odrzucone</div>
        <div class="sc-val" style="color:#ef4444">{{ store.stats.rejected_month }}</div>
        <div class="sc-sub">z komentarzem</div>
      </div>
    </div>

    <!-- ── TABS ── -->
    <div class="tabs">
      <button class="tab" :class="{active: store.activeTab==='pending'}" @click="store.activeTab='pending'">
        Oczekujące <span v-if="store.pendingCount" class="tbadge tbr">{{ store.pendingCount }}</span>
      </button>
      <button class="tab" :class="{active: store.activeTab==='processing'}" @click="store.activeTab='processing'">
        W realizacji <span class="tbadge tbc">{{ store.processingRefunds.length }}</span>
      </button>
      <button class="tab" :class="{active: store.activeTab==='history'}" @click="store.activeTab='history'">
        Historia <span class="tbadge tbg">{{ store.historyRefunds.length }}</span>
      </button>
    </div>

    <!-- ── FILTER BAR ── -->
    <div class="filter-bar">
      <div class="search-wrap">
        <span class="s-ico">🔍</span>
        <input class="s-input" type="text" placeholder="Szukaj po nazwisku ucznia, trenerze, przyczynie..." v-model="store.filters.search">
      </div>
      <select class="f-select" v-model="store.filters.month">
        <option value="">Wszystkie miesiące</option>
        <option value="2025-04">Kwiecień 2025</option>
        <option value="2025-03">Marzec 2025</option>
      </select>
      <select class="f-select" v-model="store.filters.type">
        <option value="">Wszystkie typy</option>
        <option value="resignation">Rezygnacja</option>
        <option value="overpayment">Nadpłata</option>
        <option value="other">Inne</option>
      </select>
    </div>

    <!-- ════════════ PENDING ════════════ -->
    <template v-if="store.activeTab==='pending'">
      <div class="tbl-wrap" v-if="store.pendingRefunds.length">
        <div class="tbl-head">
          <div class="th">Uczeń / Trener</div>
          <div class="th">Kwota zwrotu</div>
          <div class="th">Typ</div>
          <div class="th">Status / FK</div>
          <div class="th">Przyczyna</div>
          <div class="th">Data wniosku</div>
          <div class="th">Zgłaszający / Dział</div>
        </div>

        <template v-for="r in store.pendingRefunds" :key="r.id">
          <!-- row -->
          <div class="tbl-row" :class="{expanded: store.expandedRow===r.id}" @click="store.toggleRow(r.id)">
            <div class="c-student"><div class="c-name">{{ r.student_name }}</div><div class="c-meta">{{ r.group_name }} · {{ r.trainer_name }} · {{ r.program }}</div></div>
            <div class="c-amt">{{ fmtAmt(r.refund_amount) }}</div>
            <div><span class="pill pill-amber"><span class="dot"></span>{{ typeLabel(r) }}</span></div>
            <div><span class="pill pill-amber"><span class="dot"></span>FK: szkic</span></div>
            <div class="c-reason">{{ r.reason_short }}</div>
            <div class="c-date">{{ fmtDate(r.initiated_at) }}</div>
            <div class="c-init">
              <span class="i-name">{{ r.initiator_name }}</span>
              <span :class="['dept', DEPT[r.initiator_dept]?.cls]">{{ DEPT[r.initiator_dept]?.label }}</span>
            </div>
          </div>

          <!-- expand panel -->
          <div class="expand" :class="{open: store.expandedRow===r.id}" @click.stop>

            <!-- Reason block -->
            <div class="reason-block" :class="{'reason-vya': r.initiator_dept==='dzial_jakosci'}">
              <div class="rb-head">
                <span class="rb-title">{{ r.initiator_dept==='dzial_jakosci' ? '🔍 Przyczyna zwrotu · Dział Jakości' : '💬 Przyczyna zwrotu' }}</span>
                <span class="rb-right">
                  <span class="i-name">{{ r.initiator_name }}</span>
                  <span :class="['dept', DEPT[r.initiator_dept]?.cls]">{{ DEPT[r.initiator_dept]?.label }}</span>
                  <a v-if="r.dj_card_id" class="vya-link" @click.stop="showToast('🔍','Karta DJ','Otwieranie karty Działu Jakości...')">↗ Karta DJ</a>
                </span>
              </div>
              <div class="rb-text">{{ r.reason_full }}</div>
              <div v-if="r.dj_attachments?.length" class="dj-tags">
                <span v-for="a in r.dj_attachments" :key="a" class="dj-tag">📎 {{ a }}</span>
              </div>
            </div>

            <!-- Tytuł zwrotu -->
            <div class="tytul-block">
              <div class="tytul-label">📌 Tytuł zwrotu <span class="tytul-req">Wymagane</span></div>
              <div class="tytul-row">
                <select class="tytul-sel" :value="store.rowSelectVal[r.id]||''" @change="onSelectChange(r.id, ($event.target as HTMLSelectElement).value)">
                  <option value="">— wybierz tytuł —</option>
                  <option v-for="opt in PRESET_TITLES" :key="opt" :value="opt">{{ opt }}</option>
                  <option value="inne">✏️ Inne (wpisz ręcznie)...</option>
                </select>
              </div>
              <div v-if="store.rowSelectVal[r.id]==='inne'" class="tytul-custom">
                <input class="tytul-inp" placeholder="Wpisz własny tytuł zwrotu..." v-model="store.rowTitles[r.id]">
              </div>
              <div v-if="store.rowTitles[r.id]" class="tytul-preview">📋 Tytuł: {{ store.rowTitles[r.id] }}</div>
            </div>

            <!-- 3-col grid -->
            <div class="eg">
              <div class="es">
                <div class="es-title">📋 Szczegóły zwrotu</div>
                <template v-if="r.refund_type==='overpayment'">
                  <div class="er"><span class="k">Typ</span><span class="v amber">Nadpłata (duplikat)</span></div>
                  <div class="er"><span class="k">TX oryginalny</span><span class="v mono blue xs">{{ r.imoje_tx_id }}</span></div>
                  <div class="er"><span class="k fw">Kwota do zwrotu</span><span class="v cyan lg">{{ fmtAmt(r.refund_amount) }}</span></div>
                </template>
                <template v-else>
                  <div class="er"><span class="k">Łącznie opłacono</span><span class="v cyan">{{ fmtAmt(r.total_paid) }}</span></div>
                  <div class="er"><span class="k">Wykorzystane miesiące</span><span class="v">{{ r.months_used }} z {{ r.months_total }}</span></div>
                  <div class="er"><span class="k">Rabat za przedpłatę</span><span :class="['v', r.has_discount ? 'amber' : 'green']">{{ r.has_discount ? 'Anulowany' : 'Brak' }}</span></div>
                  <div v-if="r.has_discount && r.full_price_per_month" class="er">
                    <span class="k">{{ r.months_used }} mies. × {{ fmtAmt(r.full_price_per_month) }}</span>
                    <span class="v">= {{ fmtAmt(r.months_used * r.full_price_per_month!) }}</span>
                  </div>
                  <div class="er"><span class="k fw">Kwota do zwrotu</span><span class="v cyan lg">{{ fmtAmt(r.refund_amount) }}</span></div>
                  <div class="er">
                    <span class="k">Powiadomiono</span>
                    <span :class="['v', r.notified_before_30 ? '' : 'red']">{{ fmtDate(r.notification_date) }} {{ r.notified_before_30 ? '(przed 30. ✅)' : '(po 30. ❌)' }}</span>
                  </div>
                </template>
              </div>
              <div class="es">
                <div class="es-title">🏦 Konto do zwrotu</div>
                <div class="er"><span class="k">Właściciel</span><span class="v">{{ r.iban_owner }}</span></div>
                <div class="er"><span class="k">IBAN</span><span class="v mono xs">{{ r.iban }}</span></div>
                <div class="er"><span class="k">Bank</span><span class="v">{{ r.bank_name }}</span></div>
                <div v-if="r.imoje_tx_id" class="er"><span class="k">Imoje TX ID</span><span class="v mono blue xs">{{ r.imoje_tx_id }}</span></div>
                <div class="er"><span class="k">Metoda zwrotu</span><span class="v green">Imoje API ✓</span></div>
              </div>
              <div class="es">
                <div class="es-title">📝 Faktura Korekta</div>
                <div class="er"><span class="k">Faktura oryginalna</span><span class="v mono blue xs">{{ r.original_invoice_number }}</span></div>
                <div class="er"><span class="k">Numer FK</span><span class="v mono amber xs">{{ r.fk_number }}</span></div>
                <div class="er"><span class="k">Kwota korekty</span><span class="v cyan">−{{ fmtAmt(r.refund_amount) }}</span></div>
                <div class="er"><span class="k">VAT</span><span class="v">ZW (zwolnienie)</span></div>
                <div class="er"><span class="k">Wystawienie</span><span class="v amber">Po zatwierdzeniu</span></div>
              </div>
            </div>

            <!-- FK info box -->
            <div class="fk-box">
              <span class="fk-box-ico">📄</span>
              <div>
                <div class="fk-box-title">Faktura Korekta — wystawiana automatycznie po zatwierdzeniu</div>
                <div class="fk-box-text">System wystawi <span class="fk-n">{{ r.fk_number }}</span> do faktury <span class="fk-n">{{ r.original_invoice_number }}</span>. Zwrot {{ fmtAmt(r.refund_amount) }} zostanie zainicjowany przez Imoje API<span v-if="r.imoje_tx_id"> ({{ r.imoje_tx_id }})</span>.</div>
              </div>
            </div>

            <!-- Alt account -->
            <div class="alt-toggle" @click="store.rowAltAccount[r.id] = !store.rowAltAccount[r.id]">
              <input type="checkbox" :checked="store.rowAltAccount[r.id]" @click.stop @change.stop="store.rowAltAccount[r.id] = !store.rowAltAccount[r.id]" style="accent-color:#f59e0b;cursor:pointer">
              <label style="cursor:pointer">💳 Klient prosi o zwrot na inne konto — przelew ręczny ING Business</label>
            </div>
            <div v-if="store.rowAltAccount[r.id]" class="alt-block">
              <div class="alt-warn">⚠️ Zwrot na inne konto wymaga ręcznego przelewu w ING Business. Imoje API nie będzie użyte dla tej transakcji.</div>
              <div class="alt-inputs">
                <input class="alt-inp" placeholder="Właściciel konta" v-model="store.rowAltOwner[r.id]">
                <input class="alt-inp" placeholder="IBAN: PL XX XXXX XXXX XXXX XXXX XXXX XXXX" v-model="store.rowAltIban[r.id]" style="flex:2">
              </div>
              <input class="alt-inp" placeholder="Bank / uwaga (np. mBank — konto małżonka)" v-model="store.rowAltBank[r.id]" style="width:100%;margin-top:8px">
            </div>

            <!-- Actions -->
            <div class="actions">
              <button class="btn btn-confirm" @click.stop="handleApprove(r)">✅ Zatwierdź zwrot {{ fmtAmt(r.refund_amount) }}</button>
              <button class="btn btn-reject" @click.stop="openReject(r)">✕ Odrzuć</button>
              <button class="btn btn-ghost btn-sm" @click.stop="openFk(r)">📄 Podgląd FK</button>
              <button class="btn btn-email btn-sm" @click.stop="openEmail(r)">✉️ E-mail do klienta</button>
            </div>
          </div>
        </template>
      </div>
      <div v-else class="empty">
        <div style="font-size:40px;margin-bottom:12px">📭</div>
        <div class="empty-title">Brak oczekujących wniosków</div>
        <div class="empty-sub">Wszystkie wnioski zostały rozpatrzone</div>
      </div>
    </template>

    <!-- ════════════ PROCESSING ════════════ -->
    <template v-if="store.activeTab==='processing'">
      <div class="tbl-wrap" v-if="store.processingRefunds.length">
        <div class="tbl-head" style="grid-template-columns:2fr 1.1fr 1fr 1.1fr 1.5fr 1fr 1.2fr">
          <div class="th">Uczeń / Trener</div><div class="th">Kwota</div><div class="th">Typ</div>
          <div class="th">Status</div><div class="th">Tytuł zwrotu</div><div class="th">Zatwierdzone</div><div class="th">Księgowy</div>
        </div>
        <div v-for="r in store.processingRefunds" :key="r.id" class="tbl-row" style="grid-template-columns:2fr 1.1fr 1fr 1.1fr 1.5fr 1fr 1.2fr;cursor:default">
          <div class="c-student"><div class="c-name">{{ r.student_name }}</div><div class="c-meta">{{ r.group_name }} · {{ r.trainer_name }} · {{ r.program }}</div></div>
          <div class="c-amt">{{ fmtAmt(r.refund_amount) }}</div>
          <div><span class="pill pill-blue"><span class="dot"></span>{{ typeLabel(r) }}</span></div>
          <div><span class="pill pill-blue"><span class="dot"></span>Imoje: wysłany</span></div>
          <div class="c-reason">{{ r.refund_title || '—' }}</div>
          <div class="c-date">{{ r.approved_at ? fmtDate(r.approved_at) : '—' }}</div>
          <div class="c-init"><span class="i-name">{{ r.approved_by || '—' }}</span></div>
        </div>
      </div>
      <div v-if="store.processingRefunds.length" style="text-align:center;padding:16px;font-size:12px;color:#6b7280">
        🔄 Środki przetwarzane przez Imoje. FK wystawiona. Średni czas: 1–2 dni robocze.
      </div>
      <div v-if="!store.processingRefunds.length" class="empty">
        <div style="font-size:40px;margin-bottom:12px">🔄</div>
        <div class="empty-title">Brak zwrotów w realizacji</div>
      </div>
    </template>

    <!-- ════════════ HISTORY ════════════ -->
    <template v-if="store.activeTab==='history'">
      <div class="tbl-wrap">
        <div class="tbl-head" style="grid-template-columns:2fr 1.2fr 1fr 1.4fr 1fr 1fr 1.2fr">
          <div class="th">Uczeń</div><div class="th">Kwota</div><div class="th">Typ</div>
          <div class="th">Faktura Korekta</div><div class="th">Data</div><div class="th">Wynik</div><div class="th">Księgowy</div>
        </div>
        <div v-for="r in store.historyRefunds" :key="r.id" class="tbl-row" style="grid-template-columns:2fr 1.2fr 1fr 1.4fr 1fr 1fr 1.2fr;cursor:default">
          <div class="c-student"><div class="c-name">{{ r.student_name }}</div><div class="c-meta">{{ r.program }}</div></div>
          <div class="mono" :style="{color: r.status==='rejected' ? '#ef4444' : '#22c55e', fontSize:'13px', fontWeight:'700'}">{{ fmtAmt(r.refund_amount) }}</div>
          <div style="font-size:12px;color:#9ca3af">{{ typeLabel(r) }}</div>
          <div class="mono blue" style="font-size:11px">{{ r.fk_number || '—' }}</div>
          <div class="c-date">{{ fmtDate(r.initiated_at) }}</div>
          <div>
            <span v-if="r.status==='completed'" class="pill pill-green"><span class="dot"></span>Zrealizowany</span>
            <span v-else class="pill pill-red"><span class="dot"></span>Odrzucony</span>
          </div>
          <div class="c-init"><span class="i-name">{{ r.approved_by || '—' }}</span></div>
        </div>
      </div>
    </template>


    <!-- ═══ MODAL: REJECT ═══ -->
    <Transition name="mf">
      <div v-if="rejectModal.show" class="modal-bd" @click.self="rejectModal.show=false">
        <div class="modal">
          <div class="modal-title">✕ Odrzuć wniosek o zwrot</div>
          <div class="modal-sub">Uczeń: <strong>{{ rejectModal.studentName }}</strong> · Ta czynność jest nieodwracalna. Manager otrzyma powiadomienie z Twoim komentarzem.</div>
          <label class="modal-lbl">Powód odrzucenia <span style="color:#ef4444">*</span></label>
          <textarea class="modal-ta" v-model="rejectModal.reason" placeholder="np. Naruszono zasadę powiadomienia przed 30. dniem miesiąca..."></textarea>
          <div class="modal-acts">
            <button class="btn btn-reject" style="flex:1;justify-content:center" @click="submitReject">✕ Potwierdź odrzucenie</button>
            <button class="btn btn-ghost" @click="rejectModal.show=false">Anuluj</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══ MODAL: FK PREVIEW ═══ -->
    <Transition name="mf">
      <div v-if="fkModal.show && fkModal.refund" class="modal-bd" @click.self="fkModal.show=false" style="overflow-y:auto;align-items:flex-start;padding:30px 20px">
        <div class="modal fk-modal">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div>
              <div class="modal-title" style="margin-bottom:2px">📄 Podgląd Faktury Korekty</div>
              <div style="font-size:11px;color:#6b7280">Wystawiana automatycznie po zatwierdzeniu zwrotu</div>
            </div>
            <span class="fk-badge">🕐 Szkic</span>
          </div>
          <!-- White document -->
          <div class="fk-doc">
            <div class="fk-doc-hdr">
              <div class="fk-logo">GLS <span>Global Leaders Skills</span></div>
              <div class="fk-doc-title"><h2>FAKTURA KOREKTA</h2><div class="fk-num-v">{{ fkModal.refund.fk_number }}</div></div>
            </div>
            <div class="fk-parties">
              <div>
                <div class="fk-pl">Sprzedawca</div>
                <div class="fk-pn">Global Leaders Skills sp. z o.o.</div>
                <div class="fk-pd">NIP: 123-456-78-90<br>ul. Przykładowa 5, 00-001 Warszawa<br>kontakt@gls.pl</div>
              </div>
              <div>
                <div class="fk-pl">Nabywca / Rodzic</div>
                <div class="fk-pn">{{ fkModal.refund.iban_owner }}</div>
                <div class="fk-pd">Uczeń: {{ fkModal.refund.student_name }}<br>Program: {{ fkModal.refund.program }}</div>
              </div>
            </div>
            <div class="fk-dates">
              <div class="fk-di"><div class="fk-dl">Data wystawienia</div><div class="fk-dv">{{ new Date().toLocaleDateString('pl-PL') }}</div></div>
              <div class="fk-di"><div class="fk-dl">Data zwrotu</div><div class="fk-dv">{{ fmtDate(fkModal.refund.notification_date) }}</div></div>
              <div class="fk-di"><div class="fk-dl">Faktura korygowana</div><div class="fk-dv">{{ fkModal.refund.original_invoice_number }}</div></div>
              <div class="fk-di"><div class="fk-dl">Miesiące usługi</div><div class="fk-dv">{{ fkModal.refund.months_used }} z {{ fkModal.refund.months_total }}</div></div>
            </div>
            <table class="fk-tbl">
              <thead><tr><th style="width:30px">#</th><th>Opis usługi</th><th style="text-align:right">Kwota</th><th style="text-align:right">VAT</th><th style="text-align:right">Zwrócono</th></tr></thead>
              <tbody><tr>
                <td>1</td>
                <td>Korekta: Program {{ fkModal.refund.program }} — zwrócono środki za niewykorzystane miesiące abonamentu</td>
                <td style="text-align:right;font-family:'Space Mono',monospace;color:#111827">−{{ fmtAmt(fkModal.refund.refund_amount) }}</td>
                <td style="text-align:right;color:#6b7280">ZW*</td>
                <td style="text-align:right;font-weight:700;color:#059669;font-family:'Space Mono',monospace">{{ fmtAmt(fkModal.refund.refund_amount) }}</td>
              </tr></tbody>
            </table>
            <div class="fk-total">
              <div class="fk-ti"><div class="fk-tl">VAT</div><div style="font-size:13px;font-weight:700;color:#6b7280">ZW</div></div>
              <div class="fk-ti"><div class="fk-tl">Kwota zwrócona</div><div class="fk-tv">{{ fmtAmt(fkModal.refund.refund_amount) }}</div></div>
            </div>
            <div class="fk-footer">*ZW — zwolnienie z VAT na podstawie art. 43 ust. 1 pkt 26 ustawy o VAT (usługi edukacyjne)<br>Global Leaders Skills sp. z o.o. · NIP 123-456-78-90 · Rachunek: PL XX XXXX XXXX XXXX XXXX XXXX XXXX</div>
          </div>
          <div class="modal-acts" style="margin-top:16px">
            <button class="btn btn-ghost" style="flex:1;justify-content:center" @click="fkModal.show=false">Zamknij</button>
            <button class="btn btn-ghost btn-sm" @click="showToast('🖨️','Drukowanie','Otwieranie podglądu wydruku...')">🖨️ Drukuj</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══ MODAL: EMAIL ═══ -->
    <Transition name="mf">
      <div v-if="emailModal.show && emailModal.refund" class="modal-bd" @click.self="emailModal.show=false">
        <div class="modal email-modal">
          <div class="modal-title">✉️ E-mail do klienta — potwierdzenie zwrotu</div>
          <div class="modal-sub">Wiadomość zostanie wysłana z konta GLS do rodzica ucznia.</div>
          <div class="em-to"><span class="em-to-lbl">Do:</span><span class="em-to-val">{{ emailModal.refund.parent_email }}</span></div>
          <div class="em-att">📎 Faktura Korekta <strong>{{ emailModal.refund.fk_number }}</strong> zostanie załączona jako PDF</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:8px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Język wiadomości:</div>
          <div class="em-langs">
            <button :class="['lang-btn', emailModal.lang==='pl' ? 'active' : '']" @click="setLang('pl')">🇵🇱 Polski</button>
            <button :class="['lang-btn', emailModal.lang==='ua' ? 'active' : '']" @click="setLang('ua')">🇺🇦 Ukraiński</button>
            <button :class="['lang-btn', emailModal.lang==='en' ? 'active' : '']" @click="setLang('en')">🇬🇧 Angielski</button>
          </div>
          <label class="modal-lbl">Temat wiadomości</label>
          <input class="modal-inp" v-model="emailModal.subject" @input="emailModal.isDirty=true">
          <label class="modal-lbl">Treść wiadomości</label>
          <textarea class="modal-ta" v-model="emailModal.body" style="min-height:180px" @input="emailModal.isDirty=true"></textarea>
          <div class="modal-acts">
            <button class="btn btn-email" style="flex:1;justify-content:center" @click="sendEmail">✉️ Wyślij e-mail</button>
            <button class="btn btn-ghost" @click="emailModal.show=false">Anuluj</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══ TOAST ═══ -->
    <Transition name="ts">
      <div v-if="toast.show" :class="['toast', toast.type==='error'?'t-err':toast.type==='info'?'t-info':'']">
        <span style="font-size:22px">{{ toast.icon }}</span>
        <div><div class="t1">{{ toast.t1 }}</div><div class="t2">{{ toast.t2 }}</div></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ─── Design system vars ─── */
.zw {
  --bg: #04040f; --bg3: #0d0d22;
  --card: #0f0f28; --card2: #13132e;
  --border: rgba(79,110,247,.18);
  --blue: #4f6ef7; --purple: #8b5cf6;
  --green: #22c55e; --red: #ef4444; --amber: #f59e0b; --cyan: #06b6d4;
  --dim: #6b7280; --muted: #9ca3af; --white: #f1f5f9;
  background: var(--bg);
  color: var(--white);
  font-family: 'Outfit', sans-serif;
  min-height: 100vh;
  padding: 24px 28px 60px;
  position: relative;
}
.zw::before {
  content: '';
  position: fixed; inset: 0;
  background:
    radial-gradient(1px 1px at 10% 15%,rgba(255,255,255,.5) 0%,transparent 0%),
    radial-gradient(1px 1px at 40% 8%,rgba(255,255,255,.4) 0%,transparent 0%),
    radial-gradient(1px 1px at 70% 25%,rgba(255,255,255,.45) 0%,transparent 0%),
    radial-gradient(1px 1px at 85% 75%,rgba(255,255,255,.4) 0%,transparent 0%),
    radial-gradient(ellipse 600px 400px at 20% 50%,rgba(79,110,247,.05) 0%,transparent 70%),
    radial-gradient(ellipse 500px 300px at 80% 30%,rgba(139,92,246,.05) 0%,transparent 70%);
  pointer-events: none; z-index: 0;
}
.zw > * { position: relative; z-index: 1; }

/* ─── Header ─── */
.zw-hdr { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:22px; }
.zw-title-row { display:flex; align-items:center; gap:12px; }
.zw-icon { width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,rgba(6,182,212,.25),rgba(79,110,247,.25)); border:1px solid rgba(6,182,212,.3); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.zw-title { font-size:22px; font-weight:700; }
.zw-sub { color:var(--dim); font-size:13px; margin-top:3px; }
.zw-hdr-actions { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.imoje-tag { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; background:rgba(6,182,212,.1); border:1px solid rgba(6,182,212,.25); font-size:11px; font-weight:600; color:var(--cyan); }
.imoje-dot { width:6px; height:6px; border-radius:50%; background:var(--cyan); animation:iblink 1.6s infinite; }
@keyframes iblink { 0%,100%{opacity:1}50%{opacity:.3} }

/* ─── Attention ─── */
.attention { display:flex; align-items:center; gap:12px; padding:12px 18px; background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.25); border-radius:12px; margin-bottom:22px; font-size:12px; line-height:1.6; color:var(--muted); }
.attention strong { color:var(--white); }
.a-ico { font-size:18px; flex-shrink:0; }

/* ─── Stats ─── */
.stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
.stat-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:18px 20px; position:relative; overflow:hidden; }
.stat-card::before { content:''; position:absolute; top:0; right:0; width:80px; height:80px; border-radius:50%; filter:blur(35px); opacity:.3; }
.sc-amber::before { background:var(--amber); } .sc-cyan::before { background:var(--cyan); }
.sc-green::before { background:var(--green); } .sc-red::before { background:var(--red); }
.sc-label { font-size:11px; color:var(--dim); text-transform:uppercase; letter-spacing:.08em; margin-bottom:8px; }
.sc-val { font-family:'Space Mono',monospace; font-size:26px; font-weight:700; }
.sc-sub { font-size:11px; color:var(--dim); margin-top:4px; }

/* ─── Tabs ─── */
.tabs { display:flex; gap:4px; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:5px; margin-bottom:18px; width:fit-content; }
.tab { padding:9px 20px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; color:var(--dim); border:none; background:none; font-family:'Outfit',sans-serif; transition:.2s; display:flex; align-items:center; gap:8px; white-space:nowrap; }
.tab:hover { color:var(--white); }
.tab.active { background:linear-gradient(135deg,rgba(6,182,212,.2),rgba(79,110,247,.2)); border:1px solid rgba(6,182,212,.35); color:var(--white); }
.tbadge { display:inline-flex; align-items:center; justify-content:center; min-width:18px; height:18px; padding:0 5px; border-radius:999px; font-size:10px; font-weight:700; color:#fff; }
.tbr { background:var(--red); animation:bp 2s infinite; }
.tbc { background:var(--cyan); }
.tbg { background:var(--green); }
@keyframes bp { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}50%{box-shadow:0 0 0 5px transparent} }

/* ─── Filter bar ─── */
.filter-bar { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
.search-wrap { position:relative; flex:1; min-width:220px; }
.s-ico { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--dim); font-size:14px; pointer-events:none; }
.s-input { width:100%; background:var(--card); border:1px solid var(--border); border-radius:9px; padding:10px 14px 10px 36px; color:var(--white); font-family:'Outfit',sans-serif; font-size:13px; outline:none; transition:.2s; }
.s-input:focus { border-color:var(--blue); }
.f-select { background:var(--card); border:1px solid var(--border); border-radius:9px; padding:10px 14px; color:var(--white); font-family:'Outfit',sans-serif; font-size:13px; outline:none; cursor:pointer; }

/* ─── Table ─── */
.tbl-wrap { background:var(--card); border:1px solid var(--border); border-radius:16px; overflow:hidden; }
.tbl-head { display:grid; grid-template-columns:2fr 1.1fr 1fr 1.1fr 1.5fr 1fr 1.2fr; padding:12px 20px; background:var(--card2); border-bottom:1px solid var(--border); }
.th { font-size:11px; font-weight:600; color:var(--dim); text-transform:uppercase; letter-spacing:.07em; }
.tbl-row { display:grid; grid-template-columns:2fr 1.1fr 1fr 1.1fr 1.5fr 1fr 1.2fr; padding:14px 20px; border-bottom:1px solid rgba(79,110,247,.08); align-items:center; transition:.15s; cursor:pointer; }
.tbl-row:last-of-type { border-bottom:none; }
.tbl-row:hover,.tbl-row.expanded { background:rgba(79,110,247,.06); }
.c-name { font-size:13px; font-weight:600; }
.c-meta { font-size:11px; color:var(--dim); margin-top:2px; }
.c-amt { font-family:'Space Mono',monospace; font-size:14px; font-weight:700; color:var(--cyan); }
.c-date { font-size:12px; color:var(--muted); }
.c-reason { font-size:11px; color:var(--dim); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.c-init { display:flex; flex-direction:column; gap:4px; }
.i-name { font-size:12px; color:var(--muted); }

/* Status pills */
.pill { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:600; white-space:nowrap; }
.pill-amber { background:rgba(245,158,11,.15); color:var(--amber); border:1px solid rgba(245,158,11,.3); }
.pill-blue  { background:rgba(79,110,247,.15); color:var(--blue);  border:1px solid rgba(79,110,247,.3); }
.pill-green { background:rgba(34,197,94,.15);  color:var(--green); border:1px solid rgba(34,197,94,.3); }
.pill-red   { background:rgba(239,68,68,.15);  color:var(--red);   border:1px solid rgba(239,68,68,.3); }
.dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
.pill-amber .dot { animation:bdot 1.4s infinite; }
@keyframes bdot { 0%,100%{opacity:1}50%{opacity:.3} }

/* Dept badges */
.dept { display:inline-flex; align-items:center; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; }
.dept-vya   { background:rgba(139,92,246,.18); color:#a78bfa; border:1px solid rgba(139,92,246,.3); }
.dept-sales { background:rgba(79,110,247,.15);  color:#818cf8; border:1px solid rgba(79,110,247,.25); }
.dept-sekr  { background:rgba(107,114,128,.15); color:var(--muted); border:1px solid rgba(107,114,128,.25); }

/* ─── Expand panel ─── */
.expand { display:none; border-top:1px solid var(--border); background:rgba(6,6,25,.6); padding:20px; }
.expand.open { display:block; animation:fi .2s ease; }
@keyframes fi { from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)} }

/* Reason block */
.reason-block { background:rgba(139,92,246,.07); border:1px solid rgba(139,92,246,.22); border-radius:12px; padding:14px 16px; margin-bottom:16px; }
.reason-vya { background:rgba(139,92,246,.1); border-color:rgba(139,92,246,.35); }
.rb-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-wrap:wrap; gap:6px; }
.rb-right { display:flex; align-items:center; gap:6px; }
.rb-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--dim); }
.rb-text { font-size:13px; color:var(--white); line-height:1.6; }
.dj-tags { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
.dj-tag { font-size:11px; padding:3px 10px; background:rgba(139,92,246,.1); border:1px solid rgba(139,92,246,.25); border-radius:6px; color:#a78bfa; }
.vya-link { display:inline-flex; align-items:center; gap:5px; font-size:11px; color:#a78bfa; cursor:pointer; padding:4px 10px; border-radius:6px; background:rgba(139,92,246,.12); border:1px solid rgba(139,92,246,.25); transition:.15s; }
.vya-link:hover { background:rgba(139,92,246,.22); }

/* Tytuł block */
.tytul-block { background:rgba(79,110,247,.07); border:1px solid rgba(79,110,247,.25); border-radius:12px; padding:14px 16px; margin-bottom:16px; }
.tytul-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--dim); margin-bottom:10px; display:flex; align-items:center; gap:6px; }
.tytul-req { display:inline-flex; padding:2px 8px; border-radius:6px; background:rgba(6,182,212,.12); border:1px solid rgba(6,182,212,.2); font-size:10px; color:var(--cyan); font-weight:600; }
.tytul-row { display:flex; }
.tytul-sel { flex:1; background:var(--card2); border:1px solid var(--border); border-radius:9px; padding:10px 14px; color:var(--white); font-family:'Outfit',sans-serif; font-size:13px; outline:none; cursor:pointer; transition:.2s; }
.tytul-sel:focus { border-color:var(--blue); }
.tytul-custom { margin-top:10px; }
.tytul-inp { width:100%; background:var(--card2); border:1px solid rgba(79,110,247,.3); border-radius:9px; padding:10px 14px; color:var(--white); font-family:'Outfit',sans-serif; font-size:13px; outline:none; transition:.2s; }
.tytul-inp:focus { border-color:var(--blue); }
.tytul-inp::placeholder { color:var(--dim); }
.tytul-preview { margin-top:10px; padding:9px 14px; background:rgba(79,110,247,.1); border-radius:8px; font-family:'Space Mono',monospace; font-size:11px; color:var(--cyan); word-break:break-all; }

/* 3-col grid */
.eg { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:18px; }
.es { background:var(--card2); border:1px solid var(--border); border-radius:12px; padding:14px 16px; }
.es-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--dim); margin-bottom:10px; }
.er { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:7px; gap:8px; }
.er:last-child { margin-bottom:0; }
.k { font-size:12px; color:var(--dim); flex-shrink:0; }
.k.fw { font-weight:600; color:var(--white); }
.v { font-size:12px; color:var(--white); text-align:right; font-weight:500; }
.v.cyan { color:var(--cyan); font-family:'Space Mono',monospace; }
.v.green { color:var(--green); } .v.amber { color:var(--amber); } .v.red { color:var(--red); } .v.blue { color:var(--blue); }
.v.lg { font-size:15px; }
.v.mono { font-family:'Space Mono',monospace; }
.v.xs { font-size:10px; }
.mono { font-family:'Space Mono',monospace; } .blue { color:var(--blue); } .amber { color:var(--amber); }

/* FK info box */
.fk-box { display:flex; align-items:flex-start; gap:10px; background:rgba(79,110,247,.08); border:1px solid rgba(79,110,247,.25); border-radius:10px; padding:12px 14px; margin-bottom:18px; }
.fk-box-ico { font-size:18px; flex-shrink:0; margin-top:1px; }
.fk-box-title { font-size:12px; font-weight:700; margin-bottom:4px; }
.fk-box-text { font-size:11px; color:var(--dim); line-height:1.6; }
.fk-n { font-family:'Space Mono',monospace; font-size:11px; color:var(--blue); }

/* Alt account */
.alt-toggle { display:flex; align-items:center; gap:8px; padding:10px 14px; background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.2); border-radius:10px; cursor:pointer; font-size:12px; color:var(--amber); margin-bottom:18px; transition:.2s; user-select:none; }
.alt-toggle:hover { background:rgba(245,158,11,.13); }
.alt-block { margin-bottom:18px; animation:fi .2s; }
.alt-warn { padding:8px 12px; background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.2); border-radius:8px; font-size:11px; color:#fca5a5; }
.alt-inputs { display:flex; gap:10px; margin-top:10px; }
.alt-inp { flex:1; background:var(--card); border:1px solid var(--border); border-radius:9px; padding:10px 14px; color:var(--white); font-family:'Outfit',sans-serif; font-size:13px; outline:none; transition:.2s; }
.alt-inp:focus { border-color:var(--amber); }
.alt-inp::placeholder { color:var(--dim); }

/* Actions */
.actions { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:9px; font-family:'Outfit',sans-serif; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:.2s; white-space:nowrap; }
.btn-confirm { background:linear-gradient(135deg,#059669,#10b981); color:#fff; box-shadow:0 4px 20px rgba(16,185,129,.25); }
.btn-confirm:hover { box-shadow:0 4px 30px rgba(16,185,129,.4); transform:translateY(-1px); }
.btn-reject { background:rgba(239,68,68,.15); border:1px solid rgba(239,68,68,.3); color:var(--red); }
.btn-reject:hover { background:rgba(239,68,68,.25); }
.btn-ghost { background:rgba(79,110,247,.1); border:1px solid var(--border); color:var(--muted); }
.btn-ghost:hover { color:var(--white); }
.btn-email { background:rgba(139,92,246,.15); border:1px solid rgba(139,92,246,.3); color:#c4b5fd; }
.btn-email:hover { background:rgba(139,92,246,.25); }
.btn-sm { padding:7px 14px; font-size:12px; }

/* Empty */
.empty { text-align:center; padding:60px 20px; background:var(--card); border:1px solid var(--border); border-radius:16px; }
.empty-title { font-size:15px; font-weight:700; }
.empty-sub { font-size:12px; color:var(--dim); margin-top:4px; }

/* ─── Modals ─── */
.modal-bd { display:flex; position:fixed; inset:0; background:rgba(0,0,0,.75); backdrop-filter:blur(8px); z-index:1000; align-items:center; justify-content:center; padding:20px; }
.modal { background:var(--card); border:1px solid var(--border); border-radius:18px; padding:28px; max-width:480px; width:100%; animation:fi .25s ease; max-height:90vh; overflow-y:auto; }
.modal::-webkit-scrollbar { width:4px; } .modal::-webkit-scrollbar-thumb { background:rgba(79,110,247,.3); border-radius:2px; }
.fk-modal { max-width:600px; }
.email-modal { max-width:560px; }
.modal-title { font-size:17px; font-weight:700; margin-bottom:6px; }
.modal-sub { font-size:12px; color:var(--dim); margin-bottom:20px; line-height:1.6; }
.modal-lbl { font-size:12px; font-weight:600; color:var(--muted); margin-bottom:7px; display:block; margin-top:14px; }
.modal-inp { width:100%; background:var(--bg3); border:1px solid var(--border); border-radius:9px; padding:10px 14px; color:var(--white); font-family:'Outfit',sans-serif; font-size:13px; outline:none; transition:.2s; }
.modal-inp:focus { border-color:var(--blue); }
.modal-ta { width:100%; background:var(--bg3); border:1px solid var(--border); border-radius:9px; padding:12px 14px; color:var(--white); font-family:'Outfit',sans-serif; font-size:13px; outline:none; resize:vertical; min-height:100px; transition:.2s; line-height:1.6; }
.modal-ta:focus { border-color:var(--purple); }
.modal-inp::placeholder,.modal-ta::placeholder { color:var(--dim); }
.modal-acts { display:flex; gap:10px; margin-top:18px; }

/* FK doc */
.fk-doc { background:#fff; border-radius:12px; padding:28px 32px; color:#1a1a2e; font-family:'Outfit',sans-serif; }
.fk-doc-hdr { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid #e5e7eb; }
.fk-logo { font-size:15px; font-weight:800; color:#1a1a2e; } .fk-logo span { color:#4f6ef7; }
.fk-doc-title { text-align:right; } .fk-doc-title h2 { font-size:16px; font-weight:800; color:#1a1a2e; margin-bottom:2px; }
.fk-num-v { font-family:'Space Mono',monospace; font-size:11px; color:#6b7280; }
.fk-parties { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:18px; }
.fk-pl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#9ca3af; margin-bottom:5px; }
.fk-pn { font-size:12px; font-weight:700; color:#111827; margin-bottom:2px; }
.fk-pd { font-size:11px; color:#6b7280; line-height:1.5; }
.fk-dates { display:flex; gap:20px; margin-bottom:16px; padding:10px 14px; background:#f9fafb; border-radius:8px; flex-wrap:wrap; }
.fk-di { display:flex; flex-direction:column; gap:2px; }
.fk-dl { font-size:9px; text-transform:uppercase; letter-spacing:.08em; color:#9ca3af; font-weight:600; }
.fk-dv { font-size:12px; font-weight:600; color:#111827; }
.fk-tbl { width:100%; border-collapse:collapse; margin-bottom:16px; }
.fk-tbl th { font-size:9px; text-transform:uppercase; letter-spacing:.08em; color:#9ca3af; font-weight:700; padding:6px 8px; text-align:left; border-bottom:1px solid #e5e7eb; }
.fk-tbl td { font-size:11px; color:#374151; padding:8px; border-bottom:1px solid #f3f4f6; }
.fk-total { display:flex; justify-content:flex-end; gap:20px; padding:10px 14px; background:#ecfdf5; border-radius:8px; border:1px solid #d1fae5; margin-bottom:12px; }
.fk-ti { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
.fk-tl { font-size:9px; text-transform:uppercase; letter-spacing:.08em; color:#6b7280; font-weight:600; }
.fk-tv { font-size:15px; font-weight:800; color:#059669; font-family:'Space Mono',monospace; }
.fk-footer { font-size:10px; color:#9ca3af; text-align:center; padding-top:12px; border-top:1px solid #f3f4f6; line-height:1.6; }
.fk-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:999px; font-size:10px; font-weight:700; background:#fef3c7; color:#92400e; border:1px solid #fde68a; }

/* Email modal */
.em-to { display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg3); border:1px solid var(--border); border-radius:9px; margin-bottom:12px; }
.em-to-lbl { font-size:11px; color:var(--dim); }
.em-to-val { font-size:13px; color:var(--white); font-weight:500; }
.em-att { display:flex; align-items:center; gap:8px; padding:8px 12px; background:rgba(79,110,247,.08); border:1px solid rgba(79,110,247,.2); border-radius:9px; margin-bottom:12px; font-size:12px; color:var(--blue); }
.em-langs { display:flex; gap:8px; margin-bottom:12px; }
.lang-btn { padding:6px 14px; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; border:1px solid var(--border); background:transparent; color:var(--dim); transition:.2s; font-family:'Outfit',sans-serif; }
.lang-btn.active { background:rgba(79,110,247,.15); border-color:rgba(79,110,247,.4); color:var(--blue); }

/* Toast */
.toast { position:fixed; bottom:30px; right:30px; background:var(--card); border:1px solid rgba(34,197,94,.35); border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:12px; box-shadow:0 8px 40px rgba(0,0,0,.5); z-index:2000; max-width:380px; }
.t-err { border-color:rgba(239,68,68,.35); } .t-info { border-color:rgba(139,92,246,.35); }
.t1 { font-size:13px; font-weight:700; } .t2 { font-size:11px; color:var(--dim); margin-top:2px; }

/* Transitions */
.mf-enter-active,.mf-leave-active { transition:opacity .2s; }
.mf-enter-from,.mf-leave-to { opacity:0; }
.ts-enter-active { animation:su .3s ease; } .ts-leave-active { animation:su .3s ease reverse; }
@keyframes su { from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1} }

/* Responsive */
@media(max-width:900px) {
  .stats { grid-template-columns:repeat(2,1fr); }
  .tbl-head,.tbl-row { grid-template-columns:2fr 1fr 1fr 1fr !important; }
  .th:nth-child(n+5),.tbl-row>*:nth-child(n+5) { display:none; }
  .eg { grid-template-columns:1fr; }
  .fk-parties { grid-template-columns:1fr; }
}
</style>
