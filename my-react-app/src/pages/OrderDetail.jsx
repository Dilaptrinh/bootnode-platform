import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Typography, Spin, Button, Space, message, Divider, Grid, Empty } from 'antd'
import { ArrowLeftOutlined, ShoppingCartOutlined, DollarOutlined, CloseCircleOutlined } from '@ant-design/icons'
import orderService from '../api/orderService'
import paymentService from '../api/paymentService'
import { PageHeader, StatusTag } from '../components/ui'

const { Text } = Typography
const { useBreakpoint } = Grid

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [order, setOrder] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p)

  useEffect(() => {
    (async () => {
      try {
        const [orderRes, payRes] = await Promise.all([
          orderService.getById(id),
          paymentService.getAllMine(),
        ])
        setOrder(orderRes.data.data)
        const allPayments = payRes.data.data || []
        setPayments(allPayments.filter((p) => p.orderId === Number(id)))
      } catch {
        message.error('Không tìm thấy đơn hàng')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, navigate])

  const handleCancel = async () => {
    try {
      const res = await orderService.cancel(id)
      setOrder(res.data.data)
      message.success('Đã hủy đơn hàng')
    } catch (err) {
      message.error(err.response?.data?.message || 'Hủy thất bại')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  if (!order) return <Empty description="Không tìm thấy đơn hàng" />

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ marginBottom: 16 }}>
        Quay lại Dashboard
      </Button>

      <PageHeader
        eyebrow="Chi tiết đơn hàng"
        title={<><ShoppingCartOutlined /> Đơn hàng #{order.id}</>}
        subtitle="Chi tiết đơn hàng thuê hosting"
        extra={<StatusTag status={order.status} type="order" />}
      />

      <Card styles={{ body: { padding: isMobile ? 20 : 32 } }} style={{ borderRadius: 8 }}>
        <Descriptions column={isMobile ? 1 : 2} size={isMobile ? 'small' : 'default'} bordered>
          <Descriptions.Item label="Gói dịch vụ" span={2}>{order.serverName}</Descriptions.Item>
          <Descriptions.Item label="Mã server">#{order.serverId}</Descriptions.Item>
          <Descriptions.Item label="Mã người dùng">#{order.userId}</Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">{order.startDate}</Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">{order.endDate}</Descriptions.Item>
          <Descriptions.Item label="Tổng tiền" span={2}>
            <span className="vh-mono vh-text-primary" style={{ fontSize: 18, fontWeight: 600 }}>{formatPrice(order.totalPrice)}₫</span>
          </Descriptions.Item>
        </Descriptions>

        {order.status === 'PENDING' && (
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button type="primary" icon={<DollarOutlined />} size="large" onClick={() => navigate(`/payment/${order.id}`)}>
              Thanh toán ngay
            </Button>
            <Button icon={<CloseCircleOutlined />} size="large" onClick={handleCancel}>
              Hủy đơn hàng
            </Button>
          </div>
        )}

        {payments.length > 0 && (
          <>
            <Divider />
            <h3 className="vh-h3" style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Lịch sử thanh toán
            </h3>
            {payments.map((pay) => (
              <Card key={pay.id} size="small" style={{ marginBottom: 8, background: 'var(--vh-canvas-soft)', borderRadius: 8 }}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }} align="start">
                  <div>
                    <div className="vh-mono vh-muted" style={{ fontSize: 12 }}>GD #{pay.id}</div>
                    <div>
                      <span className="vh-mono vh-text-primary" style={{ fontWeight: 600 }}>+{formatPrice(pay.amount)}₫</span>
                      <span className="vh-muted" style={{ marginLeft: 8, fontSize: 13 }}>qua {pay.method}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <StatusTag status={pay.status} type="payment" />
                    {pay.paidAt && (
                      <div><Text className="vh-muted" style={{ fontSize: 12 }}>{new Date(pay.paidAt).toLocaleString('vi-VN')}</Text></div>
                    )}
                  </div>
                </Space>
              </Card>
            ))}
          </>
        )}
      </Card>
    </div>
  )
}
