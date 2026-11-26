import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Col, Form, Input, Row, Tabs, Upload, Grid, Typography, message, Space, Divider, Alert, Modal, Collapse } from 'antd'
import { GithubOutlined, InboxOutlined, FolderOutlined, FileOutlined, LinkOutlined, GlobalOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import siteService from '../api/siteService'
import faqService from '../api/faqService'
import { PageHeader } from '../components/ui'

const { Text, Paragraph } = Typography
const { useBreakpoint } = Grid
const { Dragger } = Upload

const ALLOWED_EXT = new Set([
  'html', 'htm', 'css', 'js', 'mjs', 'json', 'txt', 'md', 'xml', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'webp', 'avif', 'bmp', 'pdf', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'map', 'webmanifest',
])
const IGNORE_PART = ['.git', 'node_modules', '.idea', '.vscode', '.DS_Store', 'Thumbs.db', 'package-lock.json', 'yarn.lock']

function isAllowedStaticFile(file) {
  const rel = (file.webkitRelativePath || file.name || '').replace(/\\/g, '/')
  if (!rel) return false
  if (IGNORE_PART.some((p) => rel.split('/').includes(p))) return false
  const dot = rel.lastIndexOf('.')
  if (dot < 0) return false
  const ext = rel.slice(dot + 1).toLowerCase()
  return ALLOWED_EXT.has(ext)
}

export default function UploadProject() {
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()

  const [folderFiles, setFolderFiles] = useState([])
  const [showAllFiles, setShowAllFiles] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [subdomain, setSubdomain] = useState('')
  const [changeSub, setChangeSub] = useState('')
  const [changingSub, setChangingSub] = useState(false)
  const [eligibility, setEligibility] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [githubForm] = Form.useForm()

  const baseDomain = eligibility?.baseDomain || 'bootnode.cloud'
  const maxSizeMb = eligibility?.maxSizeMb || 50
  const deployDisabled = isAuthenticated && eligibility != null && eligibility.allowed === false

  const requireLogin = () => {
    if (!isAuthenticated) {
      messageApi.warning('Vui lòng đăng nhập trước khi deploy')
      navigate('/login')
      return false
    }
    return true
  }

  useEffect(() => {
    let active = true
    faqService.getByCategory('DEPLOY')
      .then((res) => { if (active) setFaqs(res.data.data || []) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    const load = async () => {
      try {
        const res = await siteService.getMySite()
        if (active && res.data.data) setResult(res.data.data)
      } catch {
        setResult(null)
      }
      try {
        const res = await siteService.getEligibility()
        if (active) setEligibility(res.data.data)
      } catch {
        setEligibility(null)
      }
    }
    load()
    return () => { active = false }
  }, [isAuthenticated])

  const handleFolderSubmit = async () => {
    if (!requireLogin()) return
    if (deployDisabled) {
      messageApi.warning(eligibility?.reason || 'Tài khoản chưa đủ điều kiện deploy')
      return
    }
    if (!folderFiles.length) {
      messageApi.warning('Vui lòng chọn thư mục trước')
      return
    }
    setLoading(true)
    try {
      const res = await siteService.deployFolder(folderFiles, subdomain)
      setResult(res.data.data)
      messageApi.success('Deploy thành công')
    } catch (err) {
      messageApi.error(err?.response?.data?.message || 'Deploy thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSubmit = async (values) => {
    if (!requireLogin()) return
    if (deployDisabled) {
      messageApi.warning(eligibility?.reason || 'Tài khoản chưa đủ điều kiện deploy')
      return
    }
    setLoading(true)
    try {
      const res = await siteService.deployGithub(values.githubUrl, subdomain)
      setResult(res.data.data)
      messageApi.success('Deploy thành công')
    } catch (err) {
      messageApi.error(err?.response?.data?.message || 'Deploy thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeSubdomain = async () => {
    if (!requireLogin()) return
    if (!changeSub.trim()) {
      messageApi.warning('Vui lòng nhập tên miền mới')
      return
    }
    setChangingSub(true)
    try {
      const res = await siteService.changeSubdomain(changeSub.trim())
      setResult(res.data.data)
      setChangeSub('')
      messageApi.success('Đã đổi tên miền thành công')
    } catch (err) {
      messageApi.error(err?.response?.data?.message || 'Đổi tên miền thất bại')
    } finally {
      setChangingSub(false)
    }
  }

  const handleDeleteSite = () => {
    Modal.confirm({
      title: 'Xóa website',
      content: 'Website và tên miền của bạn sẽ bị xóa vĩnh viễn khỏi hệ thống. Bạn chắc chắn muốn xóa?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          await siteService.deleteMySite()
          setResult(null)
          setSubdomain('')
          setChangeSub('')
          messageApi.success('Đã xóa website')
        } catch (err) {
          messageApi.error(err?.response?.data?.message || 'Xóa thất bại')
        }
      },
    })
  }

  const props = {
    name: 'folder',
    multiple: true,
    directory: true,
    beforeUpload: () => false,
    onChange(info) {
      const files = info.fileList.map((f) => f.originFileObj).filter(Boolean).filter(isAllowedStaticFile)
      setFolderFiles(files)
      messageApi.success(`Đã chọn ${files.length} file trong thư mục`)
    },
  }

  const resultCard = result ? (
    <Alert
      type={result.status === 'ACTIVE' ? 'success' : result.status === 'FAILED' ? 'error' : 'info'}
      showIcon
      message={result.status === 'ACTIVE' ? 'Site đã sẵn sàng' : result.status === 'FAILED' ? 'Deploy thất bại' : 'Đang deploy...'}
      description={
        result.status === 'ACTIVE' ? (
          <div>
            <Text>Subdomain: <Text code strong>{result.subdomain}</Text></Text>
            <br />
            <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a>
          </div>
        ) : result.errorMessage ? (
          <Text type="danger">{result.errorMessage}</Text>
        ) : null
      }
      style={{ marginBottom: 16 }}
    />
  ) : null

  const eligibilityAlert = !isAuthenticated ? (
    <Alert
      type="info"
      showIcon
      icon={<GiftOutlined />}
      message="Miễn phí cho sinh viên Đại học Cần Thơ"
      description="Yêu cầu email @student.ctu.edu.vn. Đăng nhập bằng Google để kiểm tra điều kiện."
      style={{ marginBottom: 16 }}
    />
  ) : eligibility == null ? (
    <Alert
      type="info"
      showIcon
      message="Đang kiểm tra điều kiện deploy..."
      style={{ marginBottom: 16 }}
    />
  ) : eligibility.allowed === false ? (
    <Alert
      type="warning"
      showIcon
      message="Tài khoản chưa đủ điều kiện deploy"
      description={eligibility.reason}
      style={{ marginBottom: 16 }}
    />
  ) : (
    <Alert
      type="success"
      showIcon
      icon={<GiftOutlined />}
      message="Miễn phí cho sinh viên Đại học Cần Thơ"
      description={`Tài khoản ${eligibility?.email || ''} đủ điều kiện deploy. Dung lượng tối đa ${maxSizeMb}MB.`}
      style={{ marginBottom: 16 }}
    />
  )

  const githubTab = (
    <Card style={{ borderRadius: 8 }}>
      <Form form={githubForm} layout="vertical" onFinish={handleGithubSubmit}>
        <Form.Item
          name="githubUrl"
          label="Link github"
          rules={[{ required: true, message: 'Vui lòng nhập link' }]}
        >
          <Input
            placeholder="https://github.com/username/repo"
            prefix={<GithubOutlined />}
            maxLength={200}
            showCount
            style={isMobile ? { width: '100%' } : { width: '60%' }}
          />
        </Form.Item>
        <Form.Item label="Subdomain (tên miền con)">
          <Input
            placeholder="VD: mywebsite"
            addonAfter={`.${baseDomain}`}
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} disabled={deployDisabled} icon={<GithubOutlined />}>
          Submit
        </Button>
      </Form>
    </Card>
  )

  const folderTab = (
    <Card style={{ borderRadius: 8 }}>
      <Form layout="vertical">
        <Form.Item name="folder" label="Chọn thư mục">
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">Hỗ trợ chọn thư mục tĩnh chứa index.html.</p>
          </Dragger>
        </Form.Item>
        <Form.Item label="Subdomain (tên miền con)">
          <Input
            placeholder="VD: mywebsite"
            addonAfter={`.${baseDomain}`}
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            style={{ width: '100%' }}
          />
        </Form.Item>
        {folderFiles.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <Text className="vh-muted">Đã chọn {folderFiles.length} file:</Text>
            <div className={`vh-code${showAllFiles ? ' vh-code--scroll' : ''}`} style={{ marginTop: 8 }}>
              {(showAllFiles ? folderFiles : folderFiles.slice(0, 10))
                .map((f) => f.webkitRelativePath || f.name)
                .map((p) => <div key={p}>{p}</div>)}
              {!showAllFiles && folderFiles.length > 10 && (
                <div>... và {folderFiles.length - 10} file khác</div>
              )}
            </div>
            {folderFiles.length > 10 && (
              <Button type="link" size="small" style={{ padding: 0, marginTop: 4 }} onClick={() => setShowAllFiles((v) => !v)}>
                {showAllFiles ? 'Thu gọn' : 'Xem chi tiết tất cả'}
              </Button>
            )}
          </div>
        )}
        <Button type="primary" onClick={handleFolderSubmit} loading={loading} disabled={deployDisabled} icon={<FolderOutlined />}>
          Submit
        </Button>
      </Form>
    </Card>
  )

  const items = [
    { key: '1', label: 'Upload folder project', children: folderTab },
    { key: '2', label: 'Upload link github', children: githubTab },
  ]

  const guideCard = (
    <Card title="Cách Deploy" className="vh-sticky-top" style={{ borderRadius: 8 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text strong>Yêu cầu file chính</Text>
          <Paragraph style={{ margin: '4px 0 0' }}>
            File chính của website phải đặt tên là{' '}
            <Text code strong style={{ color: 'var(--vh-link)' }}>index.html</Text>.
            Hệ thống sẽ dùng nó làm trang mở đầu.
          </Paragraph>
        </div>

        <Divider style={{ margin: 0 }} />

        <div>
          <Text strong><FolderOutlined /> Cấu trúc thư mục</Text>
          <div className="vh-code" style={{ marginTop: 8 }}>
            <div><FolderOutlined style={{ color: 'var(--vh-warning)' }} /> my-website/</div>
            <div style={{ paddingLeft: 20 }}><FileOutlined /> <Text code>index.html</Text> <Text className="vh-muted">&lt;— bắt buộc</Text></div>
            <div style={{ paddingLeft: 20 }}><FileOutlined /> style.css</div>
            <div style={{ paddingLeft: 20 }}><FileOutlined /> app.js</div>
            <div style={{ paddingLeft: 20 }}><FolderOutlined style={{ color: 'var(--vh-warning)' }} /> assets/</div>
            <div style={{ paddingLeft: 40 }}><FileOutlined /> logo.png</div>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        <div>
          <Text strong><LinkOutlined /> Cách 2: GitHub</Text>
          <Paragraph style={{ margin: '4px 0 0' }}>
            Dán link repo GitHub chứa code tĩnh. Repo cũng phải có file <Text code>index.html</Text> ở thư mục gốc.
          </Paragraph>
        </div>

        <Divider style={{ margin: 0 }} />

        <div>
          <Text strong><GlobalOutlined /> Giới hạn</Text>
          <Paragraph style={{ margin: '4px 0 0' }}>
            Chỉ file tĩnh (HTML, CSS, JS, hình ảnh), dung lượng tối đa {maxSizeMb}MB. Không hỗ trợ PHP, Node.js hay cơ sở dữ liệu.
          </Paragraph>
        </div>
      </Space>
    </Card>
  )

  const faqItems = faqs.map((f) => ({
    key: String(f.id),
    label: f.question,
    children: <p style={{ margin: 0 }}>{f.answer}</p>,
  }))

  return (
    <div>
      <PageHeader
        eyebrow="Triển khai"
        title="Triển khai website tĩnh"
        subtitle="Miễn phí cho sinh viên Đại học Cần Thơ. Tải lên thư mục hoặc kết nối GitHub để đưa website lên subdomain của bạn."
      />
      {contextHolder}
      {eligibilityAlert}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          {resultCard}
          <Tabs defaultActiveKey="1" items={items} />
          {isAuthenticated && (
            <Card style={{ marginTop: 16, borderRadius: 8 }}>
              <h3 className="vh-h3" style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>
                <GlobalOutlined /> Đổi tên miền (subdomain)
              </h3>
              <Text className="vh-muted" style={{ display: 'block', marginBottom: 12 }}>
                {result?.subdomain
                  ? `Tên miền hiện tại: ${result.subdomain}.${baseDomain}`
                  : 'Bạn chưa có website nào.'}
              </Text>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="VD: ten-moi"
                  value={changeSub}
                  onChange={(e) => setChangeSub(e.target.value)}
                  disabled={!result?.subdomain}
                />
                <Button type="primary" loading={changingSub} onClick={handleChangeSubdomain} disabled={!result?.subdomain}>
                  Đổi tên miền
                </Button>
              </Space.Compact>
              <Text className="vh-muted" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                Đổi tên miền sẽ di chuyển website sang tên miền mới, không cần nộp lại code.
              </Text>
              <Divider style={{ margin: '16px 0 8px' }} />
              <Button danger icon={<DeleteOutlined />} disabled={!result?.subdomain} onClick={handleDeleteSite}>
                Xóa website
              </Button>
            </Card>
          )}
        </Col>
        <Col xs={24} md={10}>
          {guideCard}
        </Col>
      </Row>

      {faqItems.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <h2 className="vh-h2" style={{ marginBottom: 16 }}>Câu hỏi thường gặp về triển khai</h2>
          <Collapse bordered={false} defaultActiveKey={faqItems[0] ? [faqItems[0].key] : []} items={faqItems} />
        </section>
      )}
    </div>
  )
}
