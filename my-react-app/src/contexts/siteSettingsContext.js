import { createContext, useContext } from 'react'

export const FALLBACK_SETTINGS = {
  'site.brand_name': 'HireHost',
  'home.hero_title': 'Triển khai web tĩnh miễn phí',
  'home.hero_subtitle':
    'Miễn phí với email @student.ctu.edu.vn. Cần tài nguyên lớn hơn? Thuê hosting riêng với cấu hình và giá minh bạch.',
  'contact.email': 'duyb2407571@student.ctu.edu.vn',
  'contact.phone': '0335050252',
  'contact.address': 'Đại học Cần Thơ',
  'contact.hours': 'Thứ 2 - Thứ 7, 8:00 - 18:00',
}

export const SiteSettingsContext = createContext({
  settings: FALLBACK_SETTINGS,
  reload: async () => null,
})

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
