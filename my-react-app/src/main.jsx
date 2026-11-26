import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import voltTheme from './theme/voltTheme'
import { AuthProvider } from './contexts/AuthContext'
import { SiteSettingsProvider } from './contexts/SiteSettingsProvider'
import App from './App.jsx'
import './index.css'

ConfigProvider.config({
  holderRender: (children) => (
    <ConfigProvider theme={voltTheme}>{children}</ConfigProvider>
  ),
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={voltTheme}>
      <BrowserRouter>
        <AuthProvider>
          <SiteSettingsProvider>
            <App />
          </SiteSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>,
)
