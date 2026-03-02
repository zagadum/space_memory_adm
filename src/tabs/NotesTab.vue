<template>
  <div>
    <div class="sec-title">{{ t('notes.title') }}</div>

    <div v-if="loading.notes" class="sk-card"></div>

    <template v-else>
      <div class="note-item" v-for="n in notes" :key="n.id" :style="n.status==='open' ? 'border-color:rgba(239,68,68,.2)' : ''">
        <div class="note-head">
          <div class="note-type-icon" :class="typeClass(n.type)">{{ typeIcon(n.type) }}</div>
          <div class="note-meta">
            <div class="note-who">{{ n.who }}</div>
            <div class="note-when">{{ n.when }} · {{ n.title }}</div>
            <div class="note-status-badges">
              <span class="chip" :class="n.status==='open' ? 'chip-red' : 'chip-green'" style="font-size:10px;padding:2px 7px">
                {{ n.status==='open' ? '🔴 ' + t('notes.open') : '✓ ' + t('notes.done') }}
              </span>
              <span class="chip chip-amber" v-if="n.category==='complaint'" style="font-size:10px;padding:2px 7px">{{ t('notes.complaint') }}</span>
              <span class="chip chip-blue" v-else-if="n.category==='payment'" style="font-size:10px;padding:2px 7px">{{ t('notes.payment') }}</span>
              <span class="chip chip-purple" v-else-if="n.category==='pause'" style="font-size:10px;padding:2px 7px">{{ t('notes.pause') }}</span>
            </div>
          </div>
        </div>
        <div class="note-text">{{ n.text }}</div>
        <div class="note-tags" v-if="n.tags?.length">
          <span class="note-tag" v-for="(tag,idx) in n.tags" :key="idx">{{ tag }}</span>
        </div>
      </div>

      <div class="note-composer">
        <div class="composer-title">+ {{ t('notes.new') }}</div>
        <div class="composer-row">
          <select class="composer-select" v-model="form.type">
            <option value="call">📞 {{ t('notes.typeCall') }}</option>
            <option value="email">✉️ {{ t('notes.typeEmail') }}</option>
            <option value="meet">🤝 {{ t('notes.typeMeet') }}</option>
            <option value="note">📝 {{ t('notes.typeNote') }}</option>
          </select>
          <select class="composer-select" v-model="form.status">
            <option value="open">🔴 {{ t('notes.open') }}</option>
            <option value="done">✓ {{ t('notes.done') }}</option>
          </select>
          <select class="composer-select" v-model="form.category">
            <option value="general">{{ t('notes.general') }}</option>
            <option value="payment">{{ t('notes.payment') }}</option>
            <option value="complaint">{{ t('notes.complaint') }}</option>
            <option value="pause">{{ t('notes.pause') }}</option>
          </select>
        </div>

        <textarea class="composer-text" v-model="form.text" :placeholder="t('notes.placeholder')"></textarea>

        <div class="composer-row">
          <input class="composer-input" v-model="tags" :placeholder="t('notes.tags')" />
          <button class="btn btn-primary" @click="save" :disabled="saving || !form.text.trim()">{{ saving ? t('common.saving') : t('common.save') }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useStudentTabsStore } from "../stores/studentTabs.store";
import { createStudentNote } from "../api/studentApi";

const studentId = "s_1";
const { t } = useI18n();
const st = useStudentTabsStore();
const { notes, loading } = storeToRefs(st);

const saving = ref(false);
const tags = ref("");
const form = reactive({
  type: "call",
  status: "open",
  category: "general",
  direction: "",
  text: "",
});

function typeIcon(type: string) {
  return ({ call: "📞", email: "✉️", meet: "🤝", note: "📝" } as any)[type] ?? "📝";
}
function typeClass(type: string) {
  return ({ call: "nt-call", email: "nt-email", meet: "nt-meet", note: "nt-note" } as any)[type] ?? "nt-note";
}

async function save() {
  saving.value = true;
  try {
    const parsedTags = tags.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await createStudentNote({
      studentId,
      type: form.type,
      direction: form.direction,
      category: form.category,
      status: form.status,
      tags: parsedTags,
      text: form.text.trim(),
    });
    form.text = "";
    tags.value = "";
    await st.loadNotes(studentId);
  } finally {
    saving.value = false;
  }
}

onMounted(() => st.loadNotes(studentId));
</script>

<style scoped>
.sk-card{height:240px;border-radius:14px;border:1px solid var(--b);background:rgba(255,255,255,.02);position:relative;overflow:hidden;}
.sk-card::after{content:'';position:absolute;inset:-40px;transform:translateX(-60%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);animation:sh 1.2s infinite;}
@keyframes sh{to{transform:translateX(120%);}}

.note-item{border:1px solid var(--b);border-radius:14px;padding:12px 14px;background:rgba(255,255,255,.02);margin-bottom:10px;}
.note-head{display:flex;align-items:flex-start;gap:10px;}
.note-type-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(100,120,255,.12);background:rgba(255,255,255,.03)}
.nt-call{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.22)}
.nt-email{background:rgba(79,110,247,.08);border-color:rgba(79,110,247,.22)}
.nt-meet{background:rgba(139,92,246,.08);border-color:rgba(139,92,246,.22)}
.nt-note{background:rgba(6,182,212,.08);border-color:rgba(6,182,212,.22)}
.note-meta{flex:1;}
.note-who{font-size:12px;font-weight:700;}
.note-when{margin-top:2px;font-size:11px;color:var(--dim);}
.note-status-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;}
.note-text{margin-top:10px;color:var(--white);font-size:12px;line-height:1.5;}
.note-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
.note-tag{font-size:10.5px;color:var(--dim);padding:3px 8px;border-radius:999px;border:1px solid var(--b);background:rgba(255,255,255,.02)}

.note-composer{margin-top:14px;border:1px solid var(--b);border-radius:14px;padding:12px 14px;background:rgba(255,255,255,.02)}
.composer-title{font-weight:800;font-size:12px;margin-bottom:10px;color:var(--blue)}
.composer-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;}
.composer-select{padding:8px 10px;border-radius:10px;border:1px solid var(--b);background:rgba(255,255,255,.02);color:var(--white);font-size:12px;}
.composer-text{width:100%;min-height:92px;resize:vertical;padding:10px 12px;border-radius:12px;border:1px solid var(--b);background:rgba(255,255,255,.02);color:var(--white);font-size:12px;line-height:1.4;margin-bottom:10px;}
.composer-input{flex:1;min-width:220px;padding:8px 10px;border-radius:10px;border:1px solid var(--b);background:rgba(255,255,255,.02);color:var(--white);font-size:12px;}
</style>
