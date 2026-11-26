import { Button, Alert } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import { OAUTH2_URL } from '../config'
import { BrandMark } from '../components/ui'

export default function Login() {
  const [searchParams] = useSearchParams()
  const oauthFailed = searchParams.get('error') === 'oauth2_failed'

  return (
    <div className="vh-auth-wrap">
      <div className="vh-auth-card">
        <div className="vh-auth-head">
          <BrandMark size="lg" />
          <h1 className="vh-h3" style={{ fontSize: 22, marginTop: 16 }}>Đăng nhập</h1>
          <p className="vh-muted" style={{ fontSize: 14, marginTop: 4 }}>
            Đăng nhập bằng tài khoản Google để tiếp tục.
          </p>
        </div>

        {oauthFailed && (
          <Alert
            type="error"
            showIcon
            message="Đăng nhập Google thất bại, vui lòng thử lại."
            style={{ marginBottom: 16 }}
          />
        )}

        <a href={OAUTH2_URL} style={{ display: 'block', textDecoration: 'none' }}>
          <Button type="primary" icon={<GoogleOutlined />} block size="large" style={{ height: 44 }}>
            Đăng nhập bằng Google
          </Button>
        </a>

        <div className="vh-auth-foot">
          Hệ thống chỉ hỗ trợ đăng nhập bằng Google.
        </div>
      </div>
    </div>
  )
}
