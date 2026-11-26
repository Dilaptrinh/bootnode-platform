import { useEffect, useState } from 'react'
import { Card, Space, Spin, Empty, message } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import announcementService from '../api/announcementService'
import { PageHeader } from '../components/ui'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export default function Announcements() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await announcementService.getAll()
        setList(res.data.data || [])
      } catch {
        message.error('Không thể tải thông báo')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Cập nhật"
        title="Thông báo"
        subtitle="Cập nhật tin tức và thông báo mới nhất từ hệ thống."
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : list.length === 0 ? (
        <Empty description="Chưa có thông báo nào" style={{ padding: 60 }} />
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {list.map((item) => (
            <Card key={item.id} styles={{ body: { padding: 24 } }} style={{ borderRadius: 8 }}>
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <span className="vh-chip">
                  <CalendarOutlined /> {formatDate(item.createdAt)}
                </span>
                <h3 className="vh-h3" style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--vh-body)' }}>
                  {item.content}
                </p>
              </Space>
            </Card>
          ))}
        </Space>
      )}
    </div>
  )
}
