import { useEffect, useState } from 'react'
import { Card, Col, Row, Table, Typography, Grid, Spin, Empty, Progress, Button, Space, message, Modal } from 'antd'
import {
  CloudServerOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import orderService from '../api/orderService'
import { PageHeader, StatCard, StatusTag } from '../components/ui'
import { voltTokens } from '../theme/voltTheme'

const { Text } = Typography
const { useBreakpoint } = Grid

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getAllMine({ page: 0, size: 10, sort: ['createdAt,desc'] })
        setOrders(res.data.data.content || [])
      } catch {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)

  const totalOrders = orders.length
  const activeOrders = orders.filter((o) => o.status === 'ACTIVE').length
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)

  const progressColor = (status) => {
    if (status === 'ACTIVE') return voltTokens.primaryDeep
    if (status === 'PENDING') return voltTokens.warning
    if (status === 'CANCELLED') return voltTokens.error
    return voltTokens.hairline
  }

  const handleCancel = (id) => {
    Modal.confirm({
      title: 'Hủy đơn hàng',
      content: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      okText: 'Hủy đơn', okType: 'danger', cancelText: 'Quay lại',
      onOk: async () => {
        try {
          const res = await orderService.cancel(id)
          message.success('Đã hủy đơn hàng')
          setOrders((prev) => prev.map((o) => o.id === id ? res.data.data : o))
        } catch (err) { message.error(err.response?.data?.message || 'Hủy thất bại') }
      },
    })
  }

  const columns = [
    { title: 'Mã đơn', dataIndex: 'id', key: 'id', render: (id) => <span className="vh-mono vh-text-primary" style={{ fontWeight: 600 }}>#{id}</span> },
    { title: 'Gói', dataIndex: 'serverName', key: 'serverName' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (s) => <StatusTag status={s} type="order" />,
    },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate', responsive: ['md'] },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate', responsive: ['md'] },
    {
      title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'totalPrice',
      render: (p) => <span className="vh-mono vh-text-primary" style={{ fontWeight: 600 }}>{formatPrice(p)}₫</span>,
    },
    {
      title: '', key: 'actions',
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/order-detail/${record.id}`)} />
          {record.status === 'PENDING' && (
            <>
              <Button size="small" type="primary" icon={<DollarOutlined />} onClick={() => navigate(`/payment/${record.id}`)}>
                {!isMobile && 'Thanh toán'}
              </Button>
              <Button size="small" icon={<CloseCircleOutlined />} danger onClick={() => handleCancel(record.id)} />
            </>
          )}
        </Space>
      ),
    },
  ]

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <PageHeader
        eyebrow="Tài khoản"
        title="Dashboard"
        subtitle="Tổng quan các gói hosting và đơn hàng của bạn."
      />

      <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]}>
        <Col xs={12} lg={6}>
          <StatCard label="Tổng đơn hàng" value={totalOrders} icon={<ShoppingCartOutlined />} accent={voltTokens.inkStrong} />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard label="Đang hoạt động" value={activeOrders} icon={<CheckCircleOutlined />} accent={voltTokens.primaryDeep} />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard label="Chờ thanh toán" value={pendingOrders} icon={<CloudServerOutlined />} accent={voltTokens.warning} />
        </Col>
        <Col xs={12} lg={6}>
          <StatCard label="Đã chi" value={`${formatPrice(totalSpent)}₫`} icon={<DollarOutlined />} accent={voltTokens.inkStrong} />
        </Col>
      </Row>

      <Card
        title="Đơn hàng của bạn"
        styles={{ body: { padding: isMobile ? 0 : 24 } }}
        style={{ marginTop: isMobile ? 16 : 24, borderRadius: 8 }}
      >
        {orders.length === 0 ? (
          <Empty description={<span>Chưa có đơn hàng nào. <Button type="link" onClick={() => navigate('/hosting')}>Mua ngay</Button></span>} />
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={false}
            scroll={{ x: isMobile ? 700 : undefined }}
            size={isMobile ? 'small' : 'middle'}
            style={{ background: 'transparent' }}
          />
        )}
      </Card>

      {orders.length > 0 && (
        <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]} style={{ marginTop: isMobile ? 16 : 24 }}>
          <Col xs={24} lg={12}>
            <Card
              title="Phân bố trạng thái"
              styles={{ body: { padding: isMobile ? 16 : 24 } }}
              style={{ borderRadius: 8 }}
            >
              {orders.map((order) => (
                <div key={order.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13 }}>{order.serverName}</Text>
                    <span className="vh-mono vh-muted" style={{ fontSize: 13 }}>{formatPrice(order.totalPrice)}₫</span>
                  </div>
                  <Progress
                    percent={order.status === 'ACTIVE' ? 100 : order.status === 'PENDING' ? 50 : 0}
                    strokeColor={progressColor(order.status)}
                    size={isMobile ? 'small' : undefined}
                    showInfo={false}
                  />
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
