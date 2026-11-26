import { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Space, Grid, Descriptions, Spin, Empty, message, Button, Modal, Form, Input } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  CloudServerOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from '@ant-design/icons'
import userService from '../api/userService'
import orderService from '../api/orderService'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader, StatusTag } from '../components/ui'

const { Text } = Typography
const { useBreakpoint } = Grid

export default function Profile() {
  const { setUser } = useAuth()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm] = Form.useForm()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          userService.getProfile(),
          orderService.getAllMine({ page: 0, size: 10, sort: ['createdAt,desc'] }),
        ])
        setProfile(profileRes.data.data)
        setOrders(ordersRes.data.data.content || [])
      } catch {
        message.error('Không thể tải thông tin')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const handleEditProfile = async () => {
    try {
      const values = await editForm.validateFields()
      setEditLoading(true)
      const res = await userService.updateProfile(values)
      const updated = res.data.data
      setProfile(updated)
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      message.success('Cập nhật thông tin thành công')
      setEditOpen(false)
    } catch (error) {
      if (error.errorFields) return
      message.error(error.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Tài khoản"
        title="Thông tin tài khoản"
        subtitle="Quản lý hồ sơ và lịch sử đơn hàng của bạn."
      />

      <Card
        style={{ borderRadius: 8, marginBottom: 24 }}
        styles={{ body: { padding: isMobile ? 20 : 32 } }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 16 : 24,
            marginBottom: 28,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 24 }}>
            <div
              style={{
                width: isMobile ? 56 : 72,
                height: isMobile ? 56 : 72,
                borderRadius: '50%',
                background: 'var(--vh-canvas-soft)',
                border: '1px solid var(--vh-hairline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UserOutlined style={{ fontSize: isMobile ? 24 : 32, color: 'var(--vh-link)' }} />
            </div>
            <div>
              <h2 className="vh-h3" style={{ margin: 0, fontSize: isMobile ? 20 : 24 }}>
                {profile?.fullName || 'User'}
              </h2>
              <Space style={{ marginTop: 4 }}>
                <MailOutlined className="vh-muted" />
                <span className="vh-muted">{profile?.email}</span>
              </Space>
            </div>
          </div>
          <Space wrap>
            <Button icon={<EditOutlined />} onClick={() => { editForm.setFieldsValue(profile); setEditOpen(true) }}>
              Sửa thông tin
            </Button>
          </Space>
        </div>

        <Descriptions
          column={isMobile ? 1 : 2}
          size={isMobile ? 'small' : 'default'}
          bordered
        >
          <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>{profile?.fullName || '--'}</Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>{profile?.email || '--'}</Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Số điện thoại</>}>{profile?.phone || '--'}</Descriptions.Item>
          <Descriptions.Item label={<><CheckCircleOutlined /> Trạng thái</>}>
            <StatusTag status={profile?.status} type="user" />
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <StatusTag status={profile?.role} type="role" />
          </Descriptions.Item>
          <Descriptions.Item label={<><CloudServerOutlined /> Đơn hàng</>}>{orders.length}</Descriptions.Item>
        </Descriptions>
      </Card>

      <h3 className="vh-h3" style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
        Lịch sử đơn hàng
      </h3>

      {orders.length === 0 ? (
        <Empty description="Chưa có đơn hàng nào" />
      ) : (
        orders.map((order) => (
          <Card
            key={order.id}
            style={{ borderRadius: 8, marginBottom: 12 }}
            styles={{ body: { padding: isMobile ? 16 : 20 } }}
          >
            <Row gutter={[16, 12]} align="middle">
              <Col xs={24} sm={4}>
                <div className="vh-label">Mã đơn</div>
                <Text copyable className="vh-mono vh-text-primary" style={{ fontSize: 13 }}>
                  #{order.id}
                </Text>
              </Col>
              <Col xs={12} sm={5}>
                <div className="vh-label">Gói</div>
                <span className="vh-text-ink" style={{ fontWeight: 600, fontSize: isMobile ? 13 : 14 }}>
                  <CloudServerOutlined style={{ marginRight: 6, color: 'var(--vh-link)' }} />
                  {order.serverName}
                </span>
              </Col>
              <Col xs={12} sm={4}>
                <div className="vh-label">Bắt đầu</div>
                <span className="vh-text-ink" style={{ fontSize: isMobile ? 13 : 14 }}>{order.startDate}</span>
              </Col>
              <Col xs={12} sm={4}>
                <div className="vh-label">Kết thúc</div>
                <span className="vh-text-ink" style={{ fontSize: isMobile ? 13 : 14 }}>{order.endDate}</span>
              </Col>
              <Col xs={12} sm={4}>
                <div className="vh-label">Giá</div>
                <span className="vh-mono vh-text-primary" style={{ fontWeight: 600, fontSize: isMobile ? 13 : 14 }}>
                  {formatPrice(order.totalPrice)}₫
                </span>
              </Col>
              <Col xs={12} sm={3}>
                <div className="vh-label">Trạng thái</div>
                <StatusTag status={order.status} type="order" />
              </Col>
            </Row>
          </Card>
        ))
      )}

      <Modal
        title="Sửa thông tin"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleEditProfile}
        confirmLoading={editLoading}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Họ tên" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Số điện thoại" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
