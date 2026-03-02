<template>
  <div>
    <div class="sec-title">{{ t('groups.title') }}</div>

    <div v-if="loading.groups" class="sk-wrap">
      <div class="sk" v-for="i in 2" :key="i"></div>
    </div>

    <div v-else>
      <div class="prog-block" v-for="p in groups" :key="p.id">
        <div class="prog-block-toggle" @click="toggle(p.id)">
          <div class="prog-icon" :class="p.programId==='space' ? 'prog-icon-sm' : 'prog-icon-ind'">{{ p.programIcon }}</div>
          <div class="prog-title-wrap">
            <div class="prog-title">{{ p.programTitle }}</div>
            <div class="prog-subtitle">{{ p.subtitle }}</div>
          </div>
          <span class="chip chip-green" style="font-size:10px;padding:2px 8px">● {{ t('common.active') }}</span>
          <span class="prog-chevron"><i class="prog-chevron-icon">▼</i> {{ openIds.has(p.id) ? t('common.collapse') : t('common.expand') }}</span>
        </div>

        <div class="prog-body" :class="{ open: openIds.has(p.id) }">
          <div class="cg-card">
            <div class="cg-head">
              <div class="cg-badge" :class="p.programId==='indigo' ? 'cg-badge-ind' : ''">{{ p.group.code }}</div>
              <div style="flex:1">
                <div class="cg-name-row">
                  <div class="cg-name">{{ t('groups.group') }} {{ p.group.code }}</div>
                  <button class="btn btn-ghost btn-sm" @click.stop="openChangeGroup(p)">🔄 {{ t('groups.changeGroup') }}</button>
                </div>
                <div class="cg-meta">
                  <span>📅 {{ p.group.schedule }}</span>
                  <span>👩‍🏫 {{ p.group.trainer }}</span>
                  <span>📍 {{ p.group.place }}</span>
                  <span class="cg-cap">{{ p.group.capacity }}</span>
                </div>
              </div>
            </div>

            <div class="cg-stats">
              <div class="cg-stat"><div class="cg-stat-val">{{ p.group.stats.total }}</div><div class="cg-stat-label">{{ t('groups.statTotal') }}</div></div>
              <div class="cg-stat"><div class="cg-stat-val" style="color:var(--green)">{{ p.group.stats.present }}</div><div class="cg-stat-label">{{ t('groups.statPresent') }}</div></div>
              <div class="cg-stat"><div class="cg-stat-val" style="color:var(--red)">{{ p.group.stats.absent }}</div><div class="cg-stat-label">{{ t('groups.statAbsent') }}</div></div>
              <div class="cg-stat"><div class="cg-stat-val" style="color:var(--purple)">{{ p.group.stats.rate }}</div><div class="cg-stat-label">{{ t('groups.statRate') }}</div></div>
            </div>

            <div class="sec-title" style="margin-top:14px">{{ t('groups.trainers') }}</div>
            <div class="trainer-list">
              <div class="trainer-row" v-for="tr in p.group.trainers" :key="tr.id">
                <div class="trainer-left">
                  <div class="trainer-name">{{ tr.name }}</div>
                  <div class="trainer-role">{{ tr.role }}</div>
                </div>
                <div class="trainer-right">
                  <span class="chip chip-blue" style="font-size:10px;padding:2px 8px">{{ presenceLabel(tr.presence) }}</span>
                  <button class="btn btn-ghost btn-sm" @click="openTrainerPresence(p, tr)">V</button>
                </div>
              </div>
            </div>

            <div class="cg-load">
              <div class="sk-line"></div>
              <div class="sk-line" style="width:70%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { useStudentTabsStore } from "../stores/studentTabs.store";
import { useModalStore } from "../stores/modal.store";

const studentId = "s_1";

const { t } = useI18n();
const st = useStudentTabsStore();
const modal = useModalStore();
const { groups, loading } = storeToRefs(st);

const openIds = ref(new Set<string>());

function toggle(id: string) {
  const next = new Set(openIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  openIds.value = next;
}

function openChangeGroup(p: any) {
  modal.open("change-group", { group: p });
}

function openTrainerPresence(p: any, tr: any) {
  modal.open("trainer-presence", { group: p, trainer: tr });
}

function presenceLabel(p: string) {
  const map: Record<string, string> = {
    present: t("attendance.present"),
    absent: t("attendance.absent"),
    late: t("attendance.late"),
    makeup: t("attendance.makeup"),
    empty: "—",
  };
  return map[p] ?? p;
}

onMounted(async () => {
  await st.loadGroups(studentId);
  // open first block by default
  if (st.groups[0]?.id) openIds.value = new Set([st.groups[0].id]);
});
</script>

<style scoped>
.sk-wrap{display:flex;flex-direction:column;gap:10px;}
.sk{height:58px;border-radius:14px;border:1px solid var(--b);background:rgba(255,255,255,.02);position:relative;overflow:hidden;}
.sk::after{content:'';position:absolute;inset:-40px;transform:translateX(-60%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:sh 1.2s infinite;}
@keyframes sh{to{transform:translateX(120%);}}

.trainer-list{display:flex;flex-direction:column;gap:6px;}
.trainer-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border:1px solid var(--b);border-radius:10px;background:rgba(255,255,255,.02);}
.trainer-name{font-weight:700;font-size:12px;}
.trainer-role{font-size:10px;color:var(--dim);margin-top:1px;}
.trainer-right{display:flex;align-items:center;gap:6px;}
.cg-cap{font-family:'Space Mono',monospace;font-size:11px;color:var(--dim)}
.cg-load{margin-top:10px;border-top:1px solid var(--b);padding-top:10px;opacity:.8;}
.sk-line{height:10px;border-radius:8px;border:1px solid rgba(100,120,255,.09);background:rgba(255,255,255,.02);margin-bottom:6px;position:relative;overflow:hidden;}
.sk-line::after{content:'';position:absolute;inset:-40px;transform:translateX(-60%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:sh 1.2s infinite;}
</style>
