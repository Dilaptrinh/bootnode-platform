import { useEffect, useState } from 'react'
import { Card, Col, Row, Button, Grid, Spin, Empty } from 'antd'
import { CheckOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import serverService from '../api/serverService'
import { PageHeader } from '../components/ui'

const { useBreakpoint } = Grid

export default function Hosting() {
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    serverService.getAll({ page: 0, size: 20 })
      .then((res) => { if (active) setServers(res.data.data.content || []) })
      .catch(() => { if (active) setServers([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price)

  return (
    <div>
      <PageHeader title="Gói hosting" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      ) : servers.length === 0 ? (
        <Empty description="Hiện chưa có gói hosting nào" style={{ padding: 60 }} />
      ) : (
        <Row gutter={[20, 20]}>
          {servers.map((server) => {
            const soldOut = server.quantity != null && server.remaining != null && server.remaining <= 0
            const featureList = [
              `CPU: ${server.cpu}`,
              `RAM: ${server.ram}`,
              `Storage: ${server.storage}`,
              `Bandwidth: ${server.bandwidth}`,
            ]

            return (
              <Col xs={24} sm={12} lg={8} xxl={6} key={server.id}>
                <Card
                  hoverable
                  className="vh-plan-card"
                  styles={{ body: { padding: 28 } }}
                  style={{ height: '100%', borderRadius: 8 }}
                >
                  {server.categoryName && (
                    <div className="vh-eyebrow" style={{ fontSize: 12, marginBottom: 6 }}>
                      {server.categoryName}
                    </div>
                  )}

                  <h3 className="vh-h3" style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
                    {server.name}
                  </h3>

                  <div style={{ marginBottom: 8 }}>
                    <span className="vh-price" style={{ fontSize: isMobile ? 30 : 36 }}>
                      {formatPrice(server.price)}₫
                    </span>
                    <span className="vh-muted" style={{ marginLeft: 4 }}>/ngày</span>
                  </div>

                  <p className="vh-muted" style={{ fontSize: 14, minHeight: 42 }}>
                    {server.description}
                  </p>

                  <div style={{ margin: '12px 0 20px' }}>
                    {soldOut ? (
                      <span className="vh-tag vh-tag--error"><span className="vh-tag__dot" />Hết hàng</span>
                    ) : server.quantity != null ? (
                      <span className="vh-chip">Còn {server.remaining} / {server.quantity} chỗ</span>
                    ) : (
                      <span className="vh-chip">Còn chỗ</span>
                    )}
                  </div>

                  <hr className="vh-divider" style={{ marginBottom: 16 }} />

                  <div className="vh-stack vh-gap-8" style={{ marginBottom: 24 }}>
                    {featureList.map((feat) => (
                      <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckOutlined style={{ color: 'var(--vh-primary-deep)', fontSize: 12 }} />
                        <span style={{ fontSize: 14 }}>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="primary"
                    block
                    disabled={soldOut}
                    style={{ height: 42 }}
                    onClick={() => navigate(`/order/${server.name.toLowerCase().replace(/\s+/g, '-')}`, { state: { server } })}
                  >
                    {soldOut ? 'Hết hàng' : 'Đăng ký ngay'} <ArrowRightOutlined />
                  </Button>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </div>
  )
}
