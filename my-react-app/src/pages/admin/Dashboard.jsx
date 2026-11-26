import { useEffect, useState } from 'react'
import { Col, Row, Grid, Spin } from 'antd'
import {
  UserOutlined,
  CloudServerOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import adminService from '../../api/adminService'
import { PageHeader, StatCard } from '../../components/ui'
import { voltTokens } from '../../theme/voltTheme'

const { useBreakpoint } = Grid

const cards = [
  { key: 'users', label: 'Người dùng', path: '/admin/users', icon: <UserOutlined />, accent: voltTokens.primaryDeep },
  { key: 'servers', label: 'Gói hosting', path: '/admin/servers', icon: <CloudServerOutlined />, accent: voltTokens.inkStrong },
  { key: 'orders', label: 'Đơn hàng', path: '/admin/orders', icon: <ShoppingCartOutlined />, accent: voltTokens.warning },
  { key: 'payments', label: 'Thanh toán', path: '/admin/payments', icon: <DollarOutlined />, accent: voltTokens.inkStrong },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, servers: 0, orders: 0, payments: 0 })
  const [loading, setLoading] = useState(true)
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, serversRes, ordersRes, paymentsRes] = await Promise.all([
          adminService.getAllUsers({ page: 0, size: 1 }),
          adminService.getAllServers({ page: 0, size: 1 }),
          adminService.getAllOrders({ page: 0, size: 1 }),
          adminService.getAllPayments({ page: 0, size: 1 }),
        ])
        setStats({
          users: usersRes.data.data?.page?.totalElements ?? usersRes.data.data?.totalElements ?? 0,
          servers: serversRes.data.data?.page?.totalElements ?? serversRes.data.data?.totalElements ?? 0,
          orders: ordersRes.data.data?.page?.totalElements ?? ordersRes.data.data?.totalElements ?? 0,
          payments: paymentsRes.data.data?.page?.totalElements ?? paymentsRes.data.data?.totalElements ?? 0,
        })
      } catch {
        setStats({ users: 0, servers: 0, orders: 0, payments: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <PageHeader
        eyebrow="Quản trị"
        title="Admin Dashboard"
        subtitle="Tổng quan nhanh các số liệu của hệ thống."
      />
      <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]}>
        {cards.map((card) => (
          <Col xs={12} lg={6} key={card.key}>
            <div
              className="vh-card vh-card-link"
              onClick={() => navigate(card.path)}
              role="button"
              tabIndex={0}
              style={{ padding: 0 }}
            >
              <StatCard
                label={card.label}
                value={stats[card.key]}
                icon={card.icon}
                accent={card.accent}
                style={{ border: 0, boxShadow: 'none' }}
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}
