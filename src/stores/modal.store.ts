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
  | "group-split"
  | "change-group"
  | "trainer-presence"
  | "edit-info"
  | "attendance-status";

export const useModalStore = defineStore("modal", {
  state: () => ({
    openId: null as ModalId | null,
    payload: null as any,
  }),
  actions: {
    open(id: ModalId, payload?: any) {
      this.openId = id;
      this.payload = payload ?? null;
    },
    close() {
      this.openId = null;
      this.payload = null;
    },
  },
});
