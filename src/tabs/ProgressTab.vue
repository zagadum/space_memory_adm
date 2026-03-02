<template>
  <div>
    <div class="sec-title">{{ t('progress.title') }}</div>

    <div v-if="loading.progress" class="sk-card"></div>

    <template v-else-if="progress">
      <div class="kpi-grid">
        <div class="kpi-card" v-for="k in progress.kpi" :key="k.id">
          <div class="kpi-title">{{ k.title }}</div>
          <div class="kpi-val">{{ k.value }}</div>
          <div class="kpi-hint">{{ k.hint }}</div>
        </div>
      </div>

      <div class="sec-title" style="margin-top:18px">{{ t('progress.achievements') }}</div>
      <div class="ach" v-for="a in progress.achievements" :key="a.id">
        <div class="ach-ic">🏅</div>
        <div style="flex:1">
          <div class="ach-title">{{ a.title }}</div>
          <div class="ach-date">{{ a.date }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useStudentTabsStore } from "../stores/studentTabs.store";

const studentId = "s_1";
const { t } = useI18n();
const st = useStudentTabsStore();
const { progress, loading } = storeToRefs(st);

onMounted(() => st.loadProgress(studentId));
</script>

<style scoped>
.sk-card{height:220px;border-radius:14px;border:1px solid var(--b);background:rgba(255,255,255,.02);position:relative;overflow:hidden;}
.sk-card::after{content:'';position:absolute;inset:-40px;transform:translateX(-60%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:sh 1.2s infinite;}
@keyframes sh{to{transform:translateX(120%);}}

.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.kpi-card{padding:12px 13px;border-radius:12px;border:1px solid var(--b);background:rgba(255,255,255,.02);}
.kpi-title{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.kpi-val{margin-top:6px;font-family:'Space Mono',monospace;font-size:18px;font-weight:800;color:var(--blue)}
.kpi-hint{margin-top:4px;font-size:10.5px;color:var(--dim)}

.ach{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--b);border-radius:12px;background:rgba(255,255,255,.02);margin-bottom:6px;}
.ach-ic{width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25)}
.ach-title{font-size:12px;font-weight:700}
.ach-date{font-family:'Space Mono',monospace;font-size:11px;color:var(--dim);margin-top:2px}

@media (max-width:720px){.kpi-grid{grid-template-columns:1fr;}}
</style>
