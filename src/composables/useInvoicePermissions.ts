import { computed } from 'vue';
import { useAccessStore } from '../stores/access.store';
import { normalizeRole } from '../config/roleMenuAccess.config';

export function useInvoicePermissions() {
  const accessStore = useAccessStore();
  
  const role = computed(() => normalizeRole(accessStore.role));

  const can = {
    // General module access
    viewModule: computed(() => role.value !== 'teacher'),
    
    // Creation
    createInvoice: computed(() => 
      ['super-admin', 'admin', 'finance'].includes(role.value || '')
    ),
    
    // Advanced actions
    changeNumber: computed(() => 
      ['super-admin', 'finance'].includes(role.value || '')
    ),
    
    deleteInvoice: computed(() => 
      ['super-admin', 'finance'].includes(role.value || '')
    ),
    
    exportXLSX: computed(() => role.value !== 'teacher'),
    
    sendEmail: computed(() => 
      ['super-admin', 'admin', 'finance'].includes(role.value || '')
    ),
  };

  /**
   * Check if a specific invoice can be edited.
   * Locked if 'paid' or 'cancelled'.
   */
  const canEdit = (invoice: any) => {
    if (!invoice) return false;
    if (['paid', 'cancelled'].includes(invoice.ksef_status)) return false;
    return ['super-admin', 'admin', 'finance'].includes(role.value || '');
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

  return {
    can,
    canEdit,
    canChangeNumber
  };
}
