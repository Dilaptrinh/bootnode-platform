import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, Spin, message } from 'antd'
import siteSettingService from '../../api/siteSettingService'
import { useSiteSettings } from '../../contexts/siteSettingsContext'
import { PageHeader } from '../../components/ui'

const { TextArea } = Input

const FIELDS = [
  { key: 'site.brand_name', label: 'Tên thương hiệu', required: true },
  { key: 'home.hero_title', label: 'Tiêu đề hero', required: true },
  { key: 'home.hero_subtitle', label: 'Mô tả hero', multiline: true, required: true },
  { key: 'contact.email', label: 'Email liên hệ' },
  { key: 'contact.phone', label: 'Hotline' },
  { key: 'contact.address', label: 'Địa chỉ' },
  { key: 'contact.hours', label: 'Giờ làm việc' },
  { key: 'deploy.allowed_domain', label: 'Domain được deploy (cách nhau bởi dấu phẩy)' },
  { key: 'deploy.max_size_mb', label: 'Dung lượng tối đa (MB)', numeric: true },
]

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
      const updates = FIELDS
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
        subtitle="Thông tin liên hệ và nội dung hero hiển thị trên website."
      />

      <Card style={{ borderRadius: 8 }} styles={{ body: { padding: 24 } }}>
        <Form form={form} layout="vertical" requiredMark={false}>
          {FIELDS.map((field) => (
            <Form.Item
              key={field.key}
              name={field.key}
              label={field.label}
              rules={[
                ...(field.required ? [{ required: true, message: 'Trường này không được để trống' }] : []),
                ...(field.numeric ? [{
                  pattern: /^[1-9]\d*$/,
                  message: 'Vui lòng nhập số nguyên dương',
                }] : []),
              ]}
            >
              {field.multiline ? <TextArea rows={2} /> : <Input />}
            </Form.Item>
          ))}
          <Button type="primary" loading={saving} onClick={handleSubmit}>
            Lưu cài đặt
          </Button>
        </Form>
      </Card>
    </div>
  )
}
