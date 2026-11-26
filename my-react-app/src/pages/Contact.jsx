import { useState } from 'react'
import { Card, Row, Col, Form, Input, Button, message, Space, Grid } from 'antd'
import {
  MailOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from '@ant-design/icons'
import contactService from '../api/contactService'
import { useSiteSettings } from '../contexts/siteSettingsContext'
import { PageHeader } from '../components/ui'

const { TextArea } = Input
const { useBreakpoint } = Grid

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const { settings } = useSiteSettings()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const contactInfo = [
    { icon: <EnvironmentOutlined />, label: 'Địa chỉ', value: settings['contact.address'] },
    { icon: <MailOutlined />, label: 'Email', value: settings['contact.email'] },
    { icon: <PhoneOutlined />, label: 'Hotline', value: settings['contact.phone'] },
    { icon: <ClockCircleOutlined />, label: 'Giờ làm việc', value: settings['contact.hours'] },
  ]

  const onFinish = async (values) => {
    setLoading(true)
    try {
      await contactService.sendContact(values)
      message.success('Cảm ơn bạn! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.')
    } catch {
      message.error('Gửi tin nhắn thất bại, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Hỗ trợ"
        title="Liên hệ"
        subtitle="Bạn có thắc mắc hoặc cần hỗ trợ? Hãy gửi tin nhắn cho chúng tôi."
      />

      <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 24]}>
        <Col xs={24} lg={14}>
          <Card
            styles={{ body: { padding: isMobile ? 20 : 32 } }}
            style={{ borderRadius: 8 }}
          >
            <h3 className="vh-h3" style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
              Gửi tin nhắn
            </h3>
            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                    <Input prefix={<UserOutlined />} placeholder="Họ tên" size={isMobile ? 'middle' : 'large'} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email' },
                      { type: 'email', message: 'Email không hợp lệ' },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" size={isMobile ? 'middle' : 'large'} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="message" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                <TextArea rows={5} placeholder="Nội dung tin nhắn..." size={isMobile ? 'middle' : 'large'} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" icon={<SendOutlined />} size="large" loading={loading}>
                  Gửi tin nhắn
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Space direction="vertical" size={isMobile ? 12 : 16} style={{ width: '100%' }}>
            {contactInfo.map((info) => (
              <Card
                key={info.label}
                styles={{ body: { padding: isMobile ? 16 : 20 } }}
                style={{ borderRadius: 8 }}
              >
                <Space size={12}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'var(--vh-canvas-soft)',
                      border: '1px solid var(--vh-hairline)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      color: 'var(--vh-link)',
                      flexShrink: 0,
                    }}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <div className="vh-eyebrow" style={{ fontSize: 11, letterSpacing: 1.4, marginBottom: 2, color: 'var(--vh-mute)' }}>
                      {info.label}
                    </div>
                    <div className="vh-text-ink" style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600 }}>
                      {info.value}
                    </div>
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </Col>
      </Row>
    </div>
  )
}
