import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Card, Button, Typography, Space, Grid, Result, DatePicker, Form, message, Descriptions, Radio, Divider } from 'antd'
import {
  CheckCircleOutlined,
  CloudServerOutlined,
  ArrowLeftOutlined,
  DashboardOutlined,
  CalendarOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import orderService from '../api/orderService'
import paymentService from '../api/paymentService'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader } from '../components/ui'

const { Text } = Typography
const { useBreakpoint } = Grid

export default function OrderConfirm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const [form] = Form.useForm()

  const [submitting, setSubmitting] = useState(false)
  const [paying, setPaying] = useState(false)
  const [orderResult, setOrderResult] = useState(null)
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('PAYOS')

  const paymentMethods = [
    { value: 'PAYOS', label: 'Mã QR', icon: <WalletOutlined /> },
  ]

  const handlePay = async () => {
    setPaying(true)
    try {
      const res = await paymentService.create({
        orderId: orderResult.id,
        amount: orderResult.totalPrice,
        method: paymentMethod,
        returnUrl: window.location.origin + '/payment/callback',
      })
      const payment = res.data.data
      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl
        return
      }
      message.success('Yêu cầu thanh toán đã được ghi nhận!')
    } catch (error) {
      message.error(error.response?.data?.message || 'Thanh toán thất bại')
    } finally {
      setPaying(false)
    }
  }

  const server = location.state?.server

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const handleDateChange = () => {
    const start = form.getFieldValue('startDate')
    const end = form.getFieldValue('endDate')
    if (start && end && server?.price) {
      const days = end.diff(start, 'day')
      if (days > 0) {
        setTotalDays(days)
        setTotalPrice(server.price * days)
      } else {
        setTotalDays(0)
        setTotalPrice(0)
      }
    }
  }

  const onFinish = async (values) => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để đặt hàng')
      navigate('/login', { state: { from: location.pathname, server } })
      return
    }
    setSubmitting(true)
    try {
      const res = await orderService.create({
        serverId: server.id,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      })
      setOrderResult(res.data.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  if (!server) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <Result
          status="warning"
          title="Không tìm thấy thông tin gói"
          subTitle="Vui lòng chọn gói hosting từ danh sách."
          extra={
            <Button type="primary" onClick={() => navigate('/hosting')}>
              Xem gói hosting
            </Button>
          }
        />
      </div>
    )
  }

  if (orderResult) {
    return (
      <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <PageHeader eyebrow="Thanh toán" title="Thanh toán đơn hàng" subtitle="Vui lòng thanh toán ngay để kích hoạt dịch vụ." />

        <Card style={{ borderRadius: 8 }} styles={{ body: { padding: isMobile ? 24 : 32 } }}>
          <Descriptions
            column={1}
            size={isMobile ? 'small' : 'default'}
            bordered
          >
            <Descriptions.Item label="Mã đơn hàng">
              <Text copyable className="vh-mono vh-text-primary" style={{ fontWeight: 600 }}>#{orderResult.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Gói">{orderResult.serverName}</Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">{orderResult.startDate}</Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">{orderResult.endDate}</Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <span className="vh-mono vh-text-primary" style={{ fontSize: 18, fontWeight: 600 }}>
                {formatPrice(orderResult.totalPrice)}₫
              </span>
            </Descriptions.Item>
          </Descriptions>

          <Divider style={{ margin: '24px 0' }} />

          <div style={{ marginBottom: 20 }}>
            <h3 className="vh-h3" style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px 0' }}>
              <WalletOutlined style={{ marginRight: 8 }} />Chọn phương thức thanh toán
            </h3>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                {paymentMethods.map((m) => (
                  <Card
                    key={m.value}
                    size="small"
                    hoverable
                    style={{
                      cursor: 'pointer',
                      borderRadius: 8,
                      border: paymentMethod === m.value
                        ? '1px solid var(--vh-primary)'
                        : '1px solid var(--vh-hairline)',
                      background: paymentMethod === m.value
                        ? 'var(--vh-canvas-soft)'
                        : 'var(--vh-canvas)',
                    }}
                    onClick={() => setPaymentMethod(m.value)}
                  >
                    <Radio value={m.value} style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                      <Space>
                        {m.icon}
                        <Text strong>{m.label}</Text>
                      </Space>
                    </Radio>
                  </Card>
                ))}
              </Space>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            block
            size="large"
            loading={paying}
            icon={<WalletOutlined />}
            onClick={handlePay}
            style={{ height: 48, fontSize: 16, marginBottom: 16 }}
          >
            Thanh toán {formatPrice(orderResult.totalPrice)}₫
          </Button>

          <Space style={{ width: '100%', justifyContent: 'center' }} size={12} wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/hosting')}>
              Tiếp tục mua
            </Button>
            <Button icon={<DashboardOutlined />} onClick={() => navigate('/dashboard')}>
              Về Dashboard
            </Button>
          </Space>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 660, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Đặt gói"
        title={`Xác nhận đặt gói ${server.name}`}
        subtitle="Chọn thời gian thuê để xem tổng chi phí trước khi đặt hàng."
      />

      <Card style={{ borderRadius: 8 }} styles={{ body: { padding: isMobile ? 24 : 32 } }}>
        <div className="vh-card-soft" style={{ marginBottom: 24 }}>
          <Descriptions column={1} size={isMobile ? 'small' : 'default'}>
            <Descriptions.Item label="Gói"><CloudServerOutlined /> {server.name}</Descriptions.Item>
            {server.categoryName && <Descriptions.Item label="Danh mục">{server.categoryName}</Descriptions.Item>}
            <Descriptions.Item label="CPU">{server.cpu}</Descriptions.Item>
            <Descriptions.Item label="RAM">{server.ram}</Descriptions.Item>
            <Descriptions.Item label="Storage">{server.storage}</Descriptions.Item>
            <Descriptions.Item label="Bandwidth">{server.bandwidth}</Descriptions.Item>
            <Descriptions.Item label="Giá">
              <span className="vh-mono vh-text-primary" style={{ fontSize: 16, fontWeight: 600 }}>
                {formatPrice(server.price)}₫<span className="vh-muted" style={{ fontSize: 13 }}>/ngày</span>
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{ startDate: dayjs() }} // Ngày bắt đầu mặc định = hôm nay, vẫn sửa được
          onValuesChange={handleDateChange}
        >
          <Space size={isMobile ? 12 : 16} style={{ width: '100%' }} align="start" wrap>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu (From)"
              rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Chọn ngày bắt đầu"
                format="DD/MM/YYYY"
                allowClear={false}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                prefix={<CalendarOutlined />}
                size={isMobile ? 'middle' : 'large'}
              />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc (To)"
              rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="Chọn ngày kết thúc"
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().add(1, 'day').startOf('day')}
                prefix={<CalendarOutlined />}
                size={isMobile ? 'middle' : 'large'}
              />
            </Form.Item>
          </Space>

          {totalPrice > 0 && (
            <div className="vh-card-soft" style={{ marginBottom: 24, textAlign: 'center' }}>
              <Text className="vh-muted" style={{ fontSize: 13 }}>
                {totalDays} ngày × {formatPrice(server.price)}₫ = </Text>
              <span className="vh-mono vh-text-primary" style={{ fontSize: 24, fontWeight: 600 }}>{formatPrice(totalPrice)}₫</span>
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submitting}
              icon={<CheckCircleOutlined />}
            >
              Xác nhận đặt hàng
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/hosting')}>
            Quay lại danh sách gói
          </Button>
        </div>
      </Card>
    </div>
  )
}
