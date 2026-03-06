<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal wide">
      <div class="mhdr">
        <div class="mhl">
          <div class="mhico" style="background:rgba(79,110,247,0.12);border:1px solid rgba(79,110,247,0.22);">🏢</div>
          <div>
            <div class="mtitle">Dodaj nową firmę</div>
            <div class="msub">Wprowadź dane rejestrowe firmy (Sprzedawcy)</div>
          </div>
        </div>
        <div class="mclose" @click="$emit('close')">✕</div>
      </div>
      <div class="mbody">
        <div class="sec"><div class="sdot" style="background:var(--blue);"></div>Dane podstawowe</div>
        <div class="gr2">
          <div class="fg span2">
            <label>Pełna nazwa firmy <span class="req">*</span></label>
            <input type="text" v-model="form.name" placeholder="Np. GLS Space Sp. z o.o.">
          </div>
          <div class="fg">
            <label>NIP <span class="req">*</span></label>
            <input type="text" v-model="form.nip" placeholder="999-999-99-99">
          </div>
          <div class="fg">
            <label>Status VAT</label>
            <select v-model="form.vat_status">
              <option value="active">Czynny podatnik VAT</option>
              <option value="zw">Zwolniony (podmiotowo/przedmiotowo)</option>
            </select>
          </div>
        </div>

        <div class="div"></div>
        <div class="sec"><div class="sdot" style="background:var(--purple);"></div>Adres rejestrowy</div>
        <div class="gr2">
          <div class="fg span2"><label>Ulica и numer</label><input type="text" v-model="form.address_street"></div>
          <div class="fg"><label>Kod pocztowy</label><input type="text" v-model="form.address_postal"></div>
          <div class="fg"><label>Miejscowość</label><input type="text" v-model="form.address_city"></div>
        </div>
      </div>
      <div class="mfooter">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">Anuluj</button>
        <button class="btn btn-primary" @click="save">＋ Dodaj firmę</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['close', 'save'])

const form = ref({
  name: '',
  nip: '',
  vat_status: 'active',
  address_street: '',
  address_postal: '',
  address_city: ''
})

function save() {
  alert('Firma zapisana (mock)')
  emit('close')
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center; z-index: 1100;
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--card); border: 1px solid var(--b);
  border-radius: 16px; width: 95%; max-width: 650px;
  display: flex; flex-direction: column; overflow: hidden;
}
.mhdr { padding: 18px 20px; border-bottom: 1px solid var(--b); display: flex; align-items: center; justify-content: space-between; }
.mhl { display: flex; align-items: center; gap: 14px; }
.mhico { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.mtitle { font-size: 14px; font-weight: 800; color: var(--white); }
.msub { font-size: 10.5px; color: var(--dim); margin-top: 2px; }
.mclose { cursor: pointer; color: var(--dim); font-size: 18px; }

.mbody { padding: 20px; }

.sec {
  display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800;
  color: var(--dim); text-transform: uppercase; margin-bottom: 12px;
}
.sdot { width: 6px; height: 6px; border-radius: 50%; }

.gr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.span2 { grid-column: span 2; }
.fg { display: flex; flex-direction: column; gap: 6px; }
.fg label { font-size: 11px; font-weight: 800; color: var(--dim); text-transform: uppercase; }
.req { color: var(--red); }

input, select {
  background: rgba(12, 12, 32, 0.8); border: 1px solid var(--b);
  color: var(--white); border-radius: 8px; padding: 10px 12px; font-size: 13px;
}
.div { height: 1px; background: var(--b); margin: 16px 0; }

.mfooter { padding: 14px 20px; background: rgba(0,0,0,0.2); border-top: 1px solid var(--b); display: flex; justify-content: flex-end; gap: 10px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: none; }
.btn-primary { background: linear-gradient(135deg, var(--blue), var(--purple)); color: #fff; }
.btn-ghost { background: var(--faint); color: var(--dim); border: 1px solid var(--b); }
.btn-sm { padding: 5px 11px; font-size: 11px; }
</style>
