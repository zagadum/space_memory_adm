import { computed } from 'vue';
import { useAccessStore } from '../stores/access.store';
import { normalizeRole } from '../config/roleMenuAccess.config';

export function useInvoicePermissions() {
  const accessStore = useAccessStore();
  
  const role = computed(() => normalizeRole(accessStore.role));

  const can = {
    // General module access - trainer/teacher NOT allowed
    viewModule: computed(() => role.value !== 'teacher'),
    
    // Creation - manager + (manager, admin, super-admin)
    createInvoice: computed(() => 
      ['super-admin', 'admin', 'finance', 'manager'].includes(role.value || '')
    ),
    
    // Advanced actions - bookkeeper + (finance, super-admin)
    changeNumber: computed(() => 
      ['super-admin', 'finance'].includes(role.value || '')
    ),
    
    deleteInvoice: computed(() => 
      ['super-admin', 'finance'].includes(role.value || '')
    ),
    
    // Exports - everyone except trainer
    exportXLSX: computed(() => role.value !== 'teacher'),
    
    // Email sending - manager +
    sendEmail: computed(() => 
      ['super-admin', 'admin', 'finance', 'manager'].includes(role.value || '')
    ),
    
    // Settings for prefixes - super-admin only
    manageSettings: computed(() => role.value === 'super-admin')
  };

  /**
   * Check if a specific invoice can be edited.
   * Locked if 'paid' or 'cancelled'.
   */
  const canEdit = (invoice: any) => {
    if (!invoice) return false;
    if (['paid', 'cancelled'].includes(invoice.ksef_status)) return false;
    return ['super-admin', 'admin', 'finance', 'manager'].includes(role.value || '');
  };

  /**
   * Check if a specific invoice's number can be changed.
   * Only for super-admin/finance and only for 'draft' or 'wystawiona'.
   */
  const canChangeNumber = (invoice: any) => {
    if (!invoice) return false;
    if (!['draft', 'wystawiona'].includes(invoice.ksef_status)) return false;
    return can.changeNumber.value;
  };

  const canCorrect = (invoice: any) => {
    if (!invoice) return false;
    if (['FK', 'FVK'].includes(invoice.document_type)) return false;
    if (invoice.ksef_status === 'cancelled') return false;
    return can.createInvoice.value;
  };

  return {
    can,
    canEdit,
    canChangeNumber,
    canCorrect
  };
}
