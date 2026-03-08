import { defineStore } from 'pinia';
import type { Company } from '../types/projects';

export const useCompaniesStore = defineStore('companies', {
    state: () => ({
        companies: [
            {
                id: 'gls-main',
                name: 'Global Leaders Skills Sp. z o.o.',
                nip: '525-297-09-24',
                krs: '0001055763',
                regon: '526267569',
                address: 'Kabacki Dukt 1 / U1 i U2, 02-798 Warszawa',
                email: 'biuro@indigomental.pl',
                isDefault: true,
                tags: ['Space Memory', 'INDIGO', 'Olimpiada', 'ZW VAT']
            },
            {
                id: 'hrableuski',
                name: 'E-sklep Space Memory — Artsiom Hrableuski (JDG)',
                nip: '527-285-49-02',
                regon: '525651337',
                address: 'al. Jerozolimskie 123A lok. 19p, 02-017 Warszawa',
                email: 'shop@spacememory.pl',
                isDefault: false,
                tags: ['Space Memory (sklep / materiały)']
            },
            {
                id: 'lubenets',
                name: 'Oleksii Lubenets (JDG)',
                nip: '527-300-33-88',
                regon: '522099129',
                address: 'Warszawa',
                email: 'oleksii@lubenets.pl',
                isDefault: false,
                tags: []
            }
        ] as Company[]
    }),
    getters: {
        defaultCompany: (state) => state.companies.find(c => c.isDefault),
        getCompanyById: (state) => (id: string) => state.companies.find(c => c.id === id)
    }
});
