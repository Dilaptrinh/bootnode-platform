import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Button, Avatar, Dropdown, Drawer, Grid } from 'antd'
import {
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  DashboardOutlined,
  CrownOutlined,
  ProfileOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../contexts/siteSettingsContext'
import { BrandMark } from './ui'
import { voltTokens } from '../theme/voltTheme'

const { useBreakpoint } = Grid

const publicNav = [
  { key: '/', label: 'Trang chủ' },
  { key: '/hosting', label: 'Gói hosting' },
  { key: '/deployment', label: 'Triển khai' },
  { key: '/info', label: 'Thông tin' },
  { key: '/about', label: 'Giới thiệu' },
  { key: '/contact', label: 'Liên hệ' },
]

const adminNav = [
  { key: '/admin', label: 'Tổng quan' },
  { key: '/admin/users', label: 'Người dùng' },
  { key: '/admin/servers', label: 'Gói hosting' },
  { key: '/admin/categories', label: 'Danh mục' },
  { key: '/admin/orders', label: 'Đơn hàng' },
  { key: '/admin/payments', label: 'Thanh toán' },
  { key: '/admin/announcements', label: 'Thông báo' },
  { key: '/admin/faqs', label: 'FAQ' },
  { key: '/admin/settings', label: 'Cài đặt' },
]

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { settings } = useSiteSettings()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const isAdminArea = location.pathname.startsWith('/admin')

  const prevIsMobile = useRef(isMobile)
  useEffect(() => {
    if (prevIsMobile.current && !isMobile) setMobileMenuOpen(false)
    prevIsMobile.current = isMobile
  }, [isMobile])

  const closeOnLinkClick = (e) => {
    if (e.target.closest('a')) setMobileMenuOpen(false)
  }

  const isNavActive = (key) => {
    const path = location.pathname
    if (key === '/') return path === '/'
    if (key === '/hosting') return path === '/hosting' || path.startsWith('/order')
    if (key === '/dashboard') {
      return path.startsWith('/dashboard') || path.startsWith('/payment') || path.startsWith('/order-detail')
    }
    return path === key || path.startsWith(`${key}/`)
  }

  const isAdminNavActive = (key) => {
    if (key === '/admin') return location.pathname === '/admin'
    return location.pathname === key || location.pathname.startsWith(`${key}/`)
  }

  const userMenuItems = [
    {
      key: 'name',
      icon: <UserOutlined />,
      label: user?.fullName || user?.email || 'User',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'me',
      icon: <ProfileOutlined />,
      label: 'Tài khoản',
      onClick: () => navigate('/me'),
    },
    ...(isAdmin ? [{
      key: 'admin',
      icon: <CrownOutlined />,
      label: 'Quản trị',
      onClick: () => navigate('/admin'),
    }] : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => { logout(); navigate('/') },
    },
  ]

  const authActions = (
    isAuthenticated ? (
      <>
        <Link
          to="/dashboard"
          className={`vh-nav__link${isNavActive('/dashboard') ? ' vh-nav__link--active' : ''}`}
        >
          <DashboardOutlined /> Dashboard
        </Link>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Avatar
            size={34}
            icon={<UserOutlined />}
            style={{ backgroundColor: voltTokens.primary, color: voltTokens.onPrimary, cursor: 'pointer' }}
          />
        </Dropdown>
      </>
    ) : (
      <Button
        type="primary"
        icon={<LoginOutlined />}
        onClick={() => navigate('/login')}
      >
        Đăng nhập
      </Button>
    )
  )

  const brandName = settings['site.brand_name'] || 'HireHost'
  const contact = {
    email: settings['contact.email'],
    phone: settings['contact.phone'],
    address: settings['contact.address'],
    hours: settings['contact.hours'],
  }

  return (
    <div className="vh-app">
      <header className="vh-header">
        <div className="vh-container vh-header__inner">
          <BrandMark name={brandName} onClick={() => navigate('/')} />

          {!isMobile && (
            <nav className="vh-nav" aria-label="Điều hướng chính">
              {publicNav.map((item) => (
                <Link
                  key={item.key}
                  to={item.key}
                  className={`vh-nav__link${isNavActive(item.key) ? ' vh-nav__link--active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="vh-nav__actions">
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Mở menu"
              />
            ) : authActions}
          </div>
        </div>
      </header>

      {isAdmin && isAdminArea && !isMobile && (
        <nav className="vh-admin-nav" aria-label="Quản trị">
          <div className="vh-admin-nav__inner">
            {adminNav.map((item) => (
              <Link
                key={item.key}
                to={item.key}
                className={`vh-admin-nav__link${isAdminNavActive(item.key) ? ' vh-admin-nav__link--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <Drawer
        placement="right"
        width={300}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        closeIcon={<CloseOutlined />}
        title={<BrandMark size="sm" name={brandName} />}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <div onClick={closeOnLinkClick}>
          <div className="vh-stack vh-gap-8">
            {publicNav.map((item) => (
              <Link
                key={item.key}
                to={item.key}
                className={`vh-nav__link${isNavActive(item.key) ? ' vh-nav__link--active' : ''}`}
                style={{ padding: '10px 8px' }}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`vh-nav__link${isNavActive('/dashboard') ? ' vh-nav__link--active' : ''}`}
                style={{ padding: '10px 8px' }}
              >
                <DashboardOutlined /> Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`vh-nav__link${isAdminArea ? ' vh-nav__link--active' : ''}`}
                style={{ padding: '10px 8px' }}
              >
                <CrownOutlined /> Quản trị
              </Link>
            )}
          </div>

          {isAdmin && isAdminArea && (
            <>
              <hr className="vh-divider" style={{ margin: '16px 0' }} />
              <div className="vh-stack vh-gap-8">
                <div className="vh-eyebrow" style={{ margin: 0 }}>Quản trị</div>
                {adminNav.map((item) => (
                  <Link
                    key={item.key}
                    to={item.key}
                    className={`vh-nav__link${isAdminNavActive(item.key) ? ' vh-nav__link--active' : ''}`}
                    style={{ padding: '8px 8px' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          )}

          <hr className="vh-divider" style={{ margin: '16px 0' }} />

          {isAuthenticated ? (
            <Button
              block
              danger
              icon={<LogoutOutlined />}
              onClick={() => { logout(); navigate('/'); setMobileMenuOpen(false) }}
            >
              Đăng xuất
            </Button>
          ) : (
            <Button
              block
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </Drawer>

      <main
        className="vh-container"
        style={{ paddingTop: isMobile ? 28 : 48, paddingBottom: isMobile ? 40 : 64 }}
      >
        <Outlet />
      </main>

      <footer className="vh-footer">
        <div className="vh-container">
          <div className="vh-footer__grid">
            <div>
              <BrandMark size="sm" name={brandName} />
              <p className="vh-footer__tagline">
                Triển khai web tĩnh miễn phí cho sinh viên CTU và thuê hosting cho dự án lớn hơn.
              </p>
            </div>
            <div>
              <div className="vh-footer__col-title">Khám phá</div>
              {publicNav.map((item) => (
                <Link key={item.key} to={item.key} className="vh-footer__link">
                  {item.label}
                </Link>
              ))}
            </div>
            <div>
              <div className="vh-footer__col-title">Liên hệ</div>
              <span className="vh-footer__link">Email: {contact.email}</span>
              <span className="vh-footer__link">Hotline: {contact.phone}</span>
              <span className="vh-footer__link">{contact.address}</span>
              <span className="vh-footer__link">{contact.hours}</span>
            </div>
          </div>
          <div className="vh-footer__bottom">
            <span>{brandName} ©2026</span>
            <span className="vh-mono">Deploy tĩnh miễn phí · Thuê hosting linh hoạt</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
