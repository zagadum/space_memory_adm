<template>
  <PauseModal v-if="openId==='pause'" />
  <DiscountModal v-else-if="openId==='discount'" />
  <TariffModal v-else-if="openId==='tariff'" />
  <ExtraModal v-else-if="openId==='extra'" />
  <UnlockModal v-else-if="openId==='unlock'" />
  <ArchiveModal v-else-if="openId==='archive'" />
  <EditInvoiceModal v-else-if="openId==='edit-invoice'" />
  <KorektaModal v-else-if="openId==='korekta'" />
  <RefundModal v-else-if="openId==='refund'" />
  <RefundOkModal v-else-if="openId==='refund-ok'" />
  <ResumeModal v-else-if="openId==='resume'" />
  <GroupSplitModal v-else-if="openId==='group-split'" />
  <ChangeGroupModal v-else-if="openId==='change-group'" />
  <TrainerPresenceModal v-else-if="openId==='trainer-presence'" />
  <EditInfoModal v-else-if="openId==='edit-info'" />
  <AttendanceStatusModal v-else-if="openId==='attendance-status'" />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useModalStore } from "../stores/modal.store";
import PauseModal from "./templates/PauseModal.vue";
import DiscountModal from "./templates/DiscountModal.vue";
import TariffModal from "./templates/TariffModal.vue";
import ExtraModal from "./templates/ExtraModal.vue";
import UnlockModal from "./templates/UnlockModal.vue";
import ArchiveModal from "./templates/ArchiveModal.vue";
import EditInvoiceModal from "./templates/EditInvoiceModal.vue";
import KorektaModal from "./templates/KorektaModal.vue";
import RefundModal from "./templates/RefundModal.vue";
import RefundOkModal from "./templates/RefundOkModal.vue";
import ResumeModal from "./templates/ResumeModal.vue";
import GroupSplitModal from "./templates/GroupSplitModal.vue";
import ChangeGroupModal from "./templates/ChangeGroupModal.vue";
import TrainerPresenceModal from "./templates/TrainerPresenceModal.vue";
import EditInfoModal from "./templates/EditInfoModal.vue";
import AttendanceStatusModal from "./templates/AttendanceStatusModal.vue";

const modal = useModalStore();
const { openId } = storeToRefs(modal);
</script>
