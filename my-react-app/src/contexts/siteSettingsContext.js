import { createContext, useContext } from 'react'

// Không hardcode thông tin liên hệ cá nhân ở đây: mọi giá trị contact.* chỉ được
// lấy từ cài đặt của admin. Nếu admin để trống thì website không hiển thị gì,
// tránh lộ email/số điện thoại trong bundle JS (F12).
export const FALLBACK_SETTINGS = {
  'site.brand_name': 'HireHost',
  'home.hero_title': 'Triển khai web tĩnh miễn phí',
  'home.hero_subtitle':
    'Miễn phí với email @student.ctu.edu.vn. Cần tài nguyên lớn hơn? Thuê hosting riêng với cấu hình và giá minh bạch.',
}

export const SiteSettingsContext = createContext({
  settings: FALLBACK_SETTINGS,
  reload: async () => null,
})

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}
