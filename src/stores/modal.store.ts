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
  | "consent-confirm";

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
