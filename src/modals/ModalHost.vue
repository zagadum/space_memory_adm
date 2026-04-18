<template>
  <PauseModal v-if="openId==='pause'" />
  <DiscountModal v-else-if="openId==='discount'" />
  <TariffModal v-else-if="openId==='tariff'" />
  <ExtraModal v-else-if="openId==='extra'" />
  <UnlockModal v-else-if="openId==='unlock'" />
  <ArchiveModal v-else-if="openId==='archive'" />
  <RecalculateStartDateModal v-else-if="openId==='recalculate-start-date'" />
  <EditInvoiceModal v-else-if="openId==='edit-invoice'" />
  <KorektaModal v-else-if="openId==='korekta'" />
  <RefundModal v-else-if="openId==='refund'" />
  <RefundOkModal v-else-if="openId==='refund-ok'" />
  <ResumeModal v-else-if="openId==='resume'" />
  <GroupSplitModal v-else-if="openId==='groupSplit'" />
  <TrainerPresenceModal v-else-if="openId==='trainer-presence'" />
  <EditInfoModal v-else-if="openId==='edit-info'" />
  <AttendanceStatusModal v-else-if="openId==='attendance-status'" />
  <AttendanceModal v-else-if="openId==='attendance'" />
  <ConsentConfirmModal v-else-if="openId==='consent-confirm'" />
  <InviteLeadModal v-else-if="openId==='invite-lead'" />
  <CreateTeacherModal v-else-if="openId==='create-teacher'" />
  <InvoiceCreateModal v-else-if="openId==='invoice-create-b2c'" mode="b2c" />
  <InvoiceCreateModal v-else-if="openId==='invoice-create-b2b'" mode="b2b" />
  <InvoiceCreateModal v-else-if="openId==='invoice-proforma'" mode="b2c" is-proforma />
  <InvoiceCorrectModal v-else-if="openId==='invoice-correct-b2c'" :invoice="modal.payload" mode="b2c" />
  <InvoiceCorrectModal v-else-if="openId==='invoice-correct-b2b'" :invoice="modal.payload" mode="b2b" />
  <InvoicePreviewModal v-else-if="openId==='invoice-preview-b2c'" :invoice="modal.payload" />
  <InvoicePreviewModal v-else-if="openId==='invoice-preview-b2b'" :invoice="modal.payload" />
  <SendEmailModal v-else-if="openId==='invoice-email'" :invoice="modal.payload" />
  <InvoiceSettingsModal v-else-if="openId==='invoice-settings'" />
  <InvoiceEditModal v-else-if="openId==='invoice-edit'" />
  <InvoiceDeleteModal v-else-if="openId==='invoice-delete'" />
  <BulkGenerateInvoicesModal v-else-if="openId==='BulkGenerateInvoicesModal'" />
  <CreateContractorModal
    v-else-if="openId==='create-contractor'"
    :contractor="modal.payload?.contractor"
    :on-success="modal.payload?.onSuccess"
    @close="modal.close"
  />
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
import RecalculateStartDateModal from "./templates/RecalculateStartDateModal.vue";
import EditInvoiceModal from "./templates/EditInvoiceModal.vue";
import KorektaModal from "./templates/KorektaModal.vue";
import RefundModal from "./templates/RefundModal.vue";
import RefundOkModal from "./templates/RefundOkModal.vue";
import ResumeModal from "./templates/ResumeModal.vue";
import GroupSplitModal from "./templates/GroupSplitModal.vue";
import TrainerPresenceModal from "./templates/TrainerPresenceModal.vue";
import EditInfoModal from "./templates/EditInfoModal.vue";
import AttendanceStatusModal from "./templates/AttendanceStatusModal.vue";
import AttendanceModal from "./templates/AttendanceModal.vue";
import ConsentConfirmModal from "./templates/ConsentConfirmModal.vue";
import InviteLeadModal from "./templates/InviteLeadModal.vue";
import CreateTeacherModal from "./templates/CreateTeacherModal.vue";
import BulkGenerateInvoicesModal from "./finance/BulkGenerateInvoicesModal.vue";
import InvoiceCreateModal from "./templates/InvoiceCreateModal.vue";
import InvoiceCorrectModal from "./templates/InvoiceCorrectModal.vue";
import SendEmailModal from "./templates/SendEmailModal.vue";
import InvoicePreviewModal from "./templates/InvoicePreviewModal.vue";
import InvoiceSettingsModal from "./templates/InvoiceSettingsModal.vue";
import InvoiceEditModal from "./templates/InvoiceEditModal.vue";
import InvoiceDeleteModal from "./templates/InvoiceDeleteModal.vue";
import CreateContractorModal from "./finance/CreateContractorModal.vue";

const modal = useModalStore();
const { openId } = storeToRefs(modal);
</script>
