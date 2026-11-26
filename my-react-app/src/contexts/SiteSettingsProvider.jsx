import { useCallback, useEffect, useState } from 'react'
import siteSettingService from '../api/siteSettingService'
import { FALLBACK_SETTINGS, SiteSettingsContext } from './siteSettingsContext'

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS)

  const reload = useCallback(async () => {
    try {
      const res = await siteSettingService.getPublic()
      setSettings({ ...FALLBACK_SETTINGS, ...(res.data.data || {}) })
      return res.data.data || {}
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let active = true
    siteSettingService.getPublic()
      .then((res) => {
        if (active) setSettings({ ...FALLBACK_SETTINGS, ...(res.data.data || {}) })
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, reload }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export default SiteSettingsProvider
