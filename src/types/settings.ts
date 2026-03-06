export interface Firma {
    id: number;
    name: string;
    short_name?: string;
    nip: string;
    regon?: string;
    krs?: string;
    legal_form: "sp_zoo" | "jdg" | "sa" | "fundacja";
    address_street?: string;
    address_city?: string;
    address_postal?: string;
    email_main?: string;
    email_invoices?: string;
    phone?: string;
    vat_status: "zw" | "vat";
    vat_exemption_reason?: string;
    pkd_codes?: string[];
    logo_path?: string | null;
    invoice_color?: string;
    invoice_style: "classic" | "modern" | "minimal";
    show_logo: boolean;
    show_footer: boolean;
    is_default: boolean;
    is_archived: boolean;
    projekty?: any[]; // For now
}

export interface Projekt {
    id: number;
    name: string;
    slug: string;
    emoji?: string;
    firma_id: number | null;
    invoice_serie: string;
    cities?: string[];
    is_active: boolean;
}
