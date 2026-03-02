import { defineStore } from "pinia";
import { paymentsApi } from "../api/paymentsApi";
import type { Program, StudentProfile } from "../api/mockDb";
import type { Transaction } from "../api/paymentsApi";

export const usePaymentsStore = defineStore("payments", {
  state: () => ({
    student: null as StudentProfile | null,
    programs: [] as Program[],
    loading: false,
    error: "" as string,
    activeTab: "payments" as "payments" | "groups" | "info" | "attendance" | "progress" | "notes",

    transactionsByProgram: {} as Record<string, Transaction[]>,
    txLoading: {} as Record<string, boolean>,
    txError: {} as Record<string, string>,

    ksefInvoicesByProgram: {} as Record<string, any[]>,
    ksefLoading: {} as Record<string, boolean>,
    ksefError: {} as Record<string, string>,
  }),
  getters: {
    programsById: (s) => Object.fromEntries(s.programs.map((p) => [p.id, p])) as Record<string, Program>,
  },
  actions: {
    async loadStudent(studentId = "s_1") {
      this.loading = true;
      this.error = "";
      try {
        const res = await paymentsApi.getStudentPayments(studentId);
        this.student = res.student;
        this.programs = res.programs;
      } catch (e: any) {
        this.error = e?.response?.data?.message || "Failed to load payments";
      } finally {
        this.loading = false;
      }
    },

    async loadTransactions(programId: string) {
      if (this.transactionsByProgram[programId]?.length) return; // cache
      this.txLoading[programId] = true;
      this.txError[programId] = "";
      try {
        this.transactionsByProgram[programId] = await paymentsApi.getTransactions(programId);
      } catch (e: any) {
        this.txError[programId] = e?.response?.data?.message || "Failed to load transactions";
      } finally {
        this.txLoading[programId] = false;
      }
    },

    async loadKsefInvoices(programId: string) {
      if (this.ksefInvoicesByProgram[programId]?.length) return; // cache
      this.ksefLoading[programId] = true;
      this.ksefError[programId] = "";
      try {
        this.ksefInvoicesByProgram[programId] = await paymentsApi.getKsefInvoices(programId);
      } catch (e: any) {
        this.ksefError[programId] = e?.response?.data?.message || "Failed to load KSeF invoices";
      } finally {
        this.ksefLoading[programId] = false;
      }
    },


    updateTariff(programId: string, value: number) {
      const p = this.programs.find((x) => x.id === programId);
      if (!p) return;
      p.tariff = value;
      // keep sub string readable
      p.sub = p.sub.replace(/\d+\s*зл\/мес/, `${value} зл/мес`);
    },
  },
});
