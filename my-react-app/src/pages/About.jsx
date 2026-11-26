import { Card, Row, Col, Grid } from 'antd'
import {
  CloudServerOutlined,
  TeamOutlined,
  TrophyOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import { useSiteSettings } from '../contexts/siteSettingsContext'
import { PageHeader } from '../components/ui'

const { useBreakpoint } = Grid

const values = [
  { icon: <CloudServerOutlined />, title: 'Hai dịch vụ rõ ràng', desc: 'Triển khai web tĩnh miễn phí cho sinh viên CTU và thuê hosting trả phí theo cấu hình thực tế.' },
  { icon: <TeamOutlined />, title: 'Hỗ trợ trực tiếp', desc: 'Liên hệ qua email và hotline trong giờ làm việc để được hỗ trợ.' },
  { icon: <TrophyOutlined />, title: 'Thông tin minh bạch', desc: 'Giá, cấu hình và số chỗ còn lại của từng gói được hiển thị trực tiếp từ hệ thống.' },
  { icon: <HeartOutlined />, title: 'Dành cho sinh viên', desc: 'Ưu tiên trải nghiệm đơn giản cho sinh viên Đại học Cần Thơ.' },
]

export default function About() {
  const screens = useBreakpoint()
  const { settings } = useSiteSettings()
  const brandName = settings['site.brand_name'] || 'HireHost'
  const isMobile = !screens.md

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <PageHeader
        eyebrow="Về chúng tôi"
        title={`Về ${brandName}`}
        subtitle={`${brandName} cung cấp hai dịch vụ tách biệt: triển khai web tĩnh miễn phí cho sinh viên CTU và thuê hosting trả phí cho dự án lớn hơn.`}
      />

      <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]}>
        {values.map((val) => (
          <Col xs={24} sm={12} lg={12} key={val.title}>
            <Card
              styles={{ body: { padding: isMobile ? 20 : 24 } }}
              style={{ height: '100%', borderRadius: 8 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: 'var(--vh-canvas-soft)',
                    border: '1px solid var(--vh-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: 'var(--vh-link)',
                    flexShrink: 0,
                  }}
                >
                  {val.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="vh-h3" style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                    {val.title}
                  </h3>
                  <p className="vh-muted" style={{ margin: 0, fontSize: 14 }}>
                    {val.desc}
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
