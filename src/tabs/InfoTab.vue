<template>
  <div>
    <div class="sec-title">
      {{ t('info.title') }}
      <button class="btn btn-ghost btn-sm" style="margin-left:auto" @click="openEdit">✏️ {{ t('info.edit') }}</button>
    </div>

    <div v-if="loading.info" class="sk-card"></div>

    <div v-else-if="info">
      <div class="sec-title">{{ t('info.studentData') }}</div>
      <div class="info-grid">
        <div class="info-field">
          <div class="if-label">{{ t('info.fullName') }}</div>
          <div class="if-val">{{ info.child.fullName }}</div>
        </div>
        <div class="info-field">
          <div class="if-label">{{ t('info.birthDate') }}</div>
          <div class="if-val if-val-mono">{{ info.child.birthDate }} <span style="color:var(--dim);font-size:11px">({{ info.child.age }} {{ t('info.years') }})</span></div>
        </div>
        <div class="info-field">
          <div class="if-label">{{ t('info.school') }}</div>
          <div class="if-val">{{ info.child.school }}</div>
        </div>
        <div class="info-field">
          <div class="if-label">{{ t('info.class') }}</div>
          <div class="if-val">{{ info.child.className }}</div>
        </div>
      </div>

      <div class="sec-title">{{ t('info.parentData') }}</div>
      <div class="info-grid">
        <div class="info-field">
          <div class="if-label">{{ t('info.fullName') }}</div>
          <div class="if-val">{{ info.parent.fullName }}</div>
        </div>
        <div class="info-field">
          <div class="if-label">{{ t('info.phone') }}</div>
          <div class="if-val if-val-mono" style="display:flex;align-items:center;gap:8px">
            {{ info.parent.phone }}
            <a class="link-btn" :href="`tel:${info.parent.phone}`">📞</a>
          </div>
        </div>
        <div class="info-field" style="grid-column:span 2">
          <div class="if-label">{{ t('info.email') }}</div>
          <div class="if-val" style="display:flex;align-items:center;gap:8px">
            {{ info.parent.email }}
            <a class="link-btn" :href="`mailto:${info.parent.email}`">✉️</a>
          </div>
        </div>
      </div>

      <div class="sec-title">{{ t('info.billing') }}</div>
      <div class="info-grid">
        <div class="info-field" style="grid-column:span 2">
          <div class="if-label">{{ t('info.address') }}</div>
          <div class="if-val">{{ info.billing.address }}</div>
        </div>
        <div class="info-field">
          <div class="if-label">NIP</div>
          <div class="if-val if-val-mono">{{ info.billing.nip }}</div>
        </div>
        <div class="info-field">
          <div class="if-label">{{ t('info.clientType') }}</div>
          <div class="if-val">
            <span class="chip chip-blue">{{ info.billing.clientType==='person' ? t('info.person') : t('info.company') }}</span>
          </div>
        </div>
      </div>

      <div class="sec-title">{{ t('info.rodo') }}</div>
      <div class="rodo-item" v-for="r in info.rodo" :key="r.id">
        <div class="rodo-icon">{{ r.status==='signed' ? '✅' : '⬜' }}</div>
        <div class="rodo-label">{{ r.title }}</div>
        <div class="rodo-date">{{ r.date }}</div>
        <span class="chip" :class="r.status==='signed' ? 'chip-green' : 'chip-amber'">
          {{ r.status==='signed' ? t('info.signed') : t('info.notSigned') }}
        </span>
      </div>

      <div class="sec-title" style="margin-top:18px">{{ t('info.source') }}</div>
      <div class="source-box">
        <div class="source-icon">✨</div>
        <div style="flex:1">
          <div class="source-title">{{ info.source.channel }}</div>
          <div class="source-note">{{ info.source.note }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useStudentTabsStore } from "../stores/studentTabs.store";
import { useModalStore } from "../stores/modal.store";

const studentId = "s_1";
const { t } = useI18n();
const st = useStudentTabsStore();
const modal = useModalStore();
const { info, loading } = storeToRefs(st);

function openEdit() {
  modal.open("edit-info", { info: info.value });
}

onMounted(() => st.loadInfo(studentId));
</script>

<style scoped>
.sk-card{height:220px;border-radius:14px;border:1px solid var(--b);background:rgba(255,255,255,.02);position:relative;overflow:hidden;}
.sk-card::after{content:'';position:absolute;inset:-40px;transform:translateX(-60%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:sh 1.2s infinite;}
@keyframes sh{to{transform:translateX(120%);}}

.link-btn{width:28px;height:28px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--b);background:rgba(255,255,255,.03);text-decoration:none;color:var(--white);}
.link-btn:hover{border-color:var(--bh);background:rgba(79,110,247,.08);}

.rodo-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--b);border-radius:11px;background:rgba(255,255,255,.02);margin-bottom:6px;}
.rodo-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.03);border:1px solid rgba(100,120,255,.1)}
.rodo-label{flex:1;font-size:12px;color:var(--white)}
.rodo-date{font-family:'Space Mono',monospace;font-size:11px;color:var(--dim);white-space:nowrap}

.source-box{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.2);border-radius:11px;}
.source-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--purple),var(--pink));box-shadow:0 0 12px rgba(139,92,246,.25)}
.source-title{font-weight:800;font-size:13px}
.source-note{color:var(--dim);font-size:11.5px;margin-top:2px}
</style>
