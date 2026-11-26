import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, Spin, message, Divider, Typography } from 'antd'
import siteSettingService from '../../api/siteSettingService'
import { useSiteSettings } from '../../contexts/siteSettingsContext'
import { PageHeader } from '../../components/ui'

const { TextArea } = Input
const { Text } = Typography

const CONTENT_FIELDS = [
  { key: 'site.brand_name', label: 'Tên thương hiệu', required: true },
  { key: 'home.hero_title', label: 'Tiêu đề hero', required: true },
  { key: 'home.hero_subtitle', label: 'Mô tả hero', multiline: true, required: true },
  { key: 'contact.email', label: 'Email liên hệ' },
  { key: 'contact.phone', label: 'Hotline' },
  { key: 'contact.address', label: 'Địa chỉ' },
  { key: 'contact.hours', label: 'Giờ làm việc' },
]

const DEPLOY_FIELDS = [
  {
    key: 'deploy.allowed_domain',
    label: 'Domain email được phép deploy',
    hint: 'Chỉ tài khoản có email thuộc các domain này mới được deploy web tĩnh. Cách nhau bởi dấu phẩy, ví dụ: student.ctu.edu.vn',
  },
  {
    key: 'deploy.max_size_mb',
    label: 'Dung lượng tối đa mỗi website (MB)',
    hint: 'Giới hạn tổng dung lượng file khi deploy (áp dụng cho cả tải thư mục và GitHub).',
    numeric: true,
  },
]

const ALL_FIELDS = [...CONTENT_FIELDS, ...DEPLOY_FIELDS]

function fieldRules(field) {
  return [
    ...(field.required ? [{ required: true, message: 'Trường này không được để trống' }] : []),
    ...(field.numeric ? [{
      pattern: /^[1-9]\d*$/,
      message: 'Vui lòng nhập số nguyên dương',
    }] : []),
  ]
}

export default function AdminSiteSettings() {
  const [form] = Form.useForm()
  const { reload } = useSiteSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    siteSettingService.getAllAdmin()
      .then((res) => {
        if (!active) return
        const map = {}
        ;(res.data.data || []).forEach((item) => { map[item.key] = item.value })
        form.setFieldsValue(map)
      })
      .catch(() => message.error('Không thể tải cài đặt'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [form])

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      const updates = ALL_FIELDS
        .map((f) => ({
          key: f.key,
          value: values[f.key] === undefined || values[f.key] === null
            ? ''
            : String(values[f.key]).trim(),
        }))
        .filter((item) => item.value !== '')
        .map((item) => siteSettingService.update(item.key, item.value))
      if (updates.length === 0) {
        message.info('Không có thay đổi để lưu')
        return
      }
      await Promise.all(updates)
      await reload()
      message.success('Đã lưu cài đặt')
    } catch (err) {
      message.error(err.response?.data?.message || 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  const renderFields = (fields) => fields.map((field) => (
    <Form.Item
      key={field.key}
      name={field.key}
      label={field.label}
      extra={field.hint}
      rules={fieldRules(field)}
    >
      {field.multiline ? <TextArea rows={2} /> : <Input />}
    </Form.Item>
  ))

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        eyebrow="Quản trị"
        title="Cài đặt website"
        subtitle="Nội dung hiển thị trên website và cấu hình cho tính năng deploy web tĩnh."
      />

      <Card style={{ borderRadius: 8 }} styles={{ body: { padding: 24 } }}>
        <Form form={form} layout="vertical" requiredMark={false}>
          <Text strong>Nội dung hiển thị</Text>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
            Hero trang chủ, tên thương hiệu và thông tin liên hệ ở header/footer.
          </Text>
          {renderFields(CONTENT_FIELDS)}

          <Divider style={{ margin: '8px 0 20px' }} />

          <Text strong>Cấu hình triển khai (không hiển thị trên hero)</Text>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 13 }}>
            Dùng để kiểm soát ai được deploy và dung lượng tối đa của mỗi website tĩnh.
          </Text>
          {renderFields(DEPLOY_FIELDS)}

          <Button type="primary" loading={saving} onClick={handleSubmit}>
            Lưu cài đặt
          </Button>
        </Form>
      </Card>
    </div>
  )
}
