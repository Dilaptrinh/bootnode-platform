import { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Spin, Empty, Collapse } from 'antd'
import {
  RocketOutlined,
  CloudServerOutlined,
  ArrowRightOutlined,
  GithubOutlined,
  FolderOutlined,
  GlobalOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import serverService from '../api/serverService'
import announcementService from '../api/announcementService'
import faqService from '../api/faqService'
import { useSiteSettings } from '../contexts/siteSettingsContext'
import { SectionHeading, TerminalMockup } from '../components/ui'

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price)
}

export default function Home() {
  const navigate = useNavigate()
  const { settings } = useSiteSettings()
  const heroTitle = settings['home.hero_title']
  const heroSubtitle = settings['home.hero_subtitle']
  const [servers, setServers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      const [serversRes, annRes, faqGeneral, faqDeploy] = await Promise.allSettled([
        serverService.getAll({ page: 0, size: 20 }),
        announcementService.getAll(),
        faqService.getByCategory('GENERAL'),
        faqService.getByCategory('DEPLOY'),
      ])
      if (!active) return
      if (serversRes.status === 'fulfilled') {
        setServers(serversRes.value.data.data.content || [])
      }
      if (annRes.status === 'fulfilled') {
        setAnnouncements((annRes.value.data.data || []).slice(0, 3))
      }
      const general = faqGeneral.status === 'fulfilled' ? (faqGeneral.value.data.data || []) : []
      const deploy = faqDeploy.status === 'fulfilled' ? (faqDeploy.value.data.data || []) : []
      setFaqs([...general, ...deploy].slice(0, 6))
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])

  const minPrice = servers.length
    ? Math.min(...servers.map((s) => Number(s.price)).filter((n) => !Number.isNaN(n)))
    : null

  const faqItems = faqs.map((f) => ({
    key: String(f.id),
    label: f.question,
    children: <p style={{ margin: 0 }}>{f.answer}</p>,
  }))

  return (
    <div>
      <section className="vh-hero">
        <div className="vh-hero__copy">
          <div className="vh-eyebrow">Dành cho sinh viên Đại học Cần Thơ</div>
          <h1 className="vh-h1">{heroTitle}</h1>
          <p className="vh-lead" style={{ whiteSpace: 'pre-line' }}>{heroSubtitle}</p>
          <div className="vh-hero__actions">
            <Button type="primary" size="large" onClick={() => navigate('/deployment')}>
              Triển khai miễn phí <ArrowRightOutlined />
            </Button>
            <Button size="large" onClick={() => navigate('/hosting')}>
              Xem gói hosting
            </Button>
          </div>
        </div>
        <TerminalMockup />
      </section>

      <section className="vh-section">
        <SectionHeading
          align="center"
          eyebrow="Hai dịch vụ tách biệt"
          title="Chọn đúng nhu cầu của bạn"
          subtitle="Triển khai web tĩnh miễn phí cho sinh viên CTU, hoặc thuê hosting trả phí cho dự án lớn hơn."
        />
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card styles={{ body: { padding: 32 } }} style={{ borderRadius: 12, height: '100%' }}>
              <div className="vh-feature-icon vh-feature-icon--sky">
                <RocketOutlined />
              </div>
              <h3 className="vh-h3" style={{ fontSize: 22, margin: '16px 0 6px' }}>
                Triển khai web tĩnh
              </h3>
              <div className="vh-chip" style={{ marginBottom: 12 }}>Miễn phí</div>
              <p className="vh-muted" style={{ marginBottom: 20 }}>
                Dành cho sinh viên có email @student.ctu.edu.vn. Tải thư mục hoặc kết nối GitHub,
                website chạy trên subdomain với dung lượng tối đa 50MB.
              </p>
              <div className="vh-stack vh-gap-8" style={{ marginBottom: 24 }}>
                <span><GlobalOutlined style={{ color: 'var(--vh-link)', marginRight: 8 }} />Subdomain *.bootnode.cloud</span>
                <span><FolderOutlined style={{ color: 'var(--vh-link)', marginRight: 8 }} />Tải lên thư mục tĩnh</span>
                <span><GithubOutlined style={{ color: 'var(--vh-link)', marginRight: 8 }} />Kết nối GitHub</span>
              </div>
              <Button type="primary" onClick={() => navigate('/deployment')}>
                Triển khai miễn phí <ArrowRightOutlined />
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card styles={{ body: { padding: 32 } }} style={{ borderRadius: 12, height: '100%' }}>
              <div className="vh-feature-icon vh-feature-icon--amber">
                <CloudServerOutlined />
              </div>
              <h3 className="vh-h3" style={{ fontSize: 22, margin: '16px 0 6px' }}>
                Thuê hosting
              </h3>
              <div className="vh-chip" style={{ marginBottom: 12 }}>Trả phí</div>
              <p className="vh-muted" style={{ marginBottom: 20 }}>
                Chọn gói theo CPU, RAM, dung lượng và băng thông. Giá và số chỗ còn lại
                được cập nhật trực tiếp từ hệ thống.
              </p>
              <div style={{ marginBottom: 24 }}>
                {loading ? (
                  <Spin size="small" />
                ) : minPrice != null ? (
                  <>
                    <span className="vh-price" style={{ fontSize: 28 }}>Từ {formatPrice(minPrice)}₫</span>
                    <span className="vh-muted" style={{ marginLeft: 4 }}>/ngày</span>
                  </>
                ) : (
                  <span className="vh-muted">Xem bảng giá chi tiết</span>
                )}
              </div>
              <Button onClick={() => navigate('/hosting')}>
                Xem gói hosting <ArrowRightOutlined />
              </Button>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="vh-section" style={{ paddingTop: 0 }}>
        <SectionHeading
          eyebrow="Cập nhật"
          title="Thông báo mới nhất"
          subtitle="Tin tức và thay đổi mới nhất từ hệ thống."
        />
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
        ) : announcements.length === 0 ? (
          <Empty description="Chưa có thông báo nào" />
        ) : (
          <Row gutter={[20, 20]}>
            {announcements.map((item) => (
              <Col xs={24} md={8} key={item.id}>
                <Card styles={{ body: { padding: 24 } }} style={{ borderRadius: 8, height: '100%' }}>
                  <span className="vh-chip" style={{ marginBottom: 12 }}>
                    <CalendarOutlined /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <h3 className="vh-h3" style={{ fontSize: 18, margin: '8px 0 6px' }}>{item.title}</h3>
                  <p className="vh-muted" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{item.content}</p>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        <div style={{ marginTop: 24 }}>
          <Button type="link" style={{ padding: 0 }} onClick={() => navigate('/info')}>
            Xem tất cả thông báo <ArrowRightOutlined />
          </Button>
        </div>
      </section>

      {faqItems.length > 0 && (
        <section className="vh-section" style={{ paddingTop: 0 }}>
          <div className="vh-split" style={{ alignItems: 'start' }}>
            <div>
              <div className="vh-eyebrow">Câu hỏi thường gặp</div>
              <h2 className="vh-h2" style={{ marginBottom: 12 }}>Bạn cần biết trước khi bắt đầu</h2>
              <p className="vh-muted" style={{ marginBottom: 20 }}>
                Không tìm thấy câu trả lời? Xem trang Liên hệ để được hỗ trợ.
              </p>
              <Button onClick={() => navigate('/contact')}>Liên hệ hỗ trợ</Button>
            </div>
            <Collapse bordered={false} defaultActiveKey={faqItems[0] ? [faqItems[0].key] : []} items={faqItems} />
          </div>
        </section>
      )}
    </div>
  )
}
