import { defineStore } from "pinia";

export type ModalId =
  | "pause"
  | "discount"
  | "tariff"
  | "extra"
  | "unlock"
  | "archive"
  | "edit-invoice"
  | "korekta"
  | "refund"
  | "refund-ok"
  | "resume"
  | "groupSplit"
  | "trainer-presence"
  | "edit-info"
  | "attendance-status"
  | "attendance"
  | "consent-confirm"
  | "invite-lead"
  | "create-teacher"
  | "invoice-create-b2c"
  | "invoice-create-b2b"
  | "invoice-proforma"
  | "invoice-preview-b2c"
  | "invoice-preview-b2b"
  | "invoice-preview-kor"
  | "invoice-correct-b2c"
  | "invoice-correct-b2b"
  | "invoice-edit"
  | "invoice-edit-number"
  | "invoice-delete"
  | "invoice-email"
  | "invoice-export"
  | "invoice-settings"
  | "invoice-add-b2b"
  | "create-contractor"
  | "BulkGenerateInvoicesModal";

export const useModalStore = defineStore("modal", {
  state: () => ({
    activeModal: null as ModalId | null,
    modalData: null as any,
  }),
  getters: {
    openId: (s) => s.activeModal,
    payload: (s) => s.modalData,
  },
  actions: {
    open(id: ModalId, payload?: any) {
      this.activeModal = id;
      this.modalData = payload ?? null;
    },
    openModal(id: ModalId, payload?: any) {
      this.open(id, payload);
    },
    close() {
      this.activeModal = null;
      this.modalData = null;
    },
    closeModal() {
      this.close();
    },
  },
});
