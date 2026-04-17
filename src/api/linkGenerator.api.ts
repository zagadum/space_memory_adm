import { getRecruitmentHttpClient, type RecruitmentBackend } from './http'

export interface LinkGeneratorHistoryItem {
  id: number
  created_at: string
  manager: string
  parent_email: string
  student_name: string
  tariff: number
  total_price: number
  discounts: Array<{
    id: string
    value: number
    type: 'fixed' | 'percent'
    name: string
  }>
  link: string
  status: 'generated' | 'sent' | 'converted'
  converted_at: string | null
}

export interface GenerateLinkRequest {
  first_name: string
  surname: string
  parent_email: string
  tariff: number
  total_price: number
  discounts: Array<{
    id: string
    value: number
    type: 'fixed' | 'percent'
    name: string
  }>
  manager_name: string
  partner_child_name?: string
}

function createLinkGeneratorApi(backend: RecruitmentBackend = 'default') {
  const client = getRecruitmentHttpClient(backend)

  return {
    async getHistory(): Promise<LinkGeneratorHistoryItem[]> {
      const { data } = await client.get<{ success: boolean; data: LinkGeneratorHistoryItem[] }>(
        'recruitment/link-history'
      )
      return data.data
    },

    async generate(payload: GenerateLinkRequest): Promise<{ link: string; token: string }> {
      const { data } = await client.post<{ success: boolean; data: { link: string; token: string } }>(
        'recruitment/generate-link',
        payload
      )
      return data.data
    },

    async delete(id: number): Promise<void> {
      await client.delete(`recruitment/link-history/${id}`)
    },

    async clear(): Promise<void> {
      await client.delete('recruitment/link-history')
    },
  }
}

export const linkGeneratorApi = createLinkGeneratorApi()

export function getLinkGeneratorApi(backend: RecruitmentBackend = 'default') {
  return createLinkGeneratorApi(backend)
}
