export type ProjectType = 'recurring' | 'onetime';
export type ProjectStatus = 'active' | 'inactive' | 'archive';

export interface ProjectStats {
    studentsCount?: number;
    invoicesCount?: number;
    fixedPrice?: number | null;
}

export interface Project {
    id: string;
    name: string;
    code: string;
    type: ProjectType;
    status: ProjectStatus;
    icon: string;
    color: string;
    description?: string;
    invoicePatternB2C: string;
    invoicePatternB2B: string;
    firmaId: string;
    stats: ProjectStats;
}

export interface Company {
    id: string;
    name: string;
    nip: string;
    krs?: string;
    regon?: string;
    address: string;
    email: string;
    isDefault: boolean;
    tags?: string[];
}
