import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Result, Button, Space, Grid } from 'antd'
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from '@ant-design/icons'
import paymentService from '../api/paymentService'
import { getAccessToken } from '../api/tokenStorage'

const { useBreakpoint } = Grid

function getInitialState() {
  const params = new URLSearchParams(window.location.search)
  const resultCode = params.get('resultCode')
  const msg = params.get('message') || ''

  // PayOS trả về status=PAID / code=00
  const payosStatus = params.get('status')
  const payosCode = params.get('code')
  const ok = resultCode === '0' || payosStatus === 'PAID' || payosCode === '00'

  return {
    status: ok ? 'success' : 'fail',
    message: msg || (ok ? 'Thanh toán thành công!' : 'Thanh toán thất bại hoặc đã bị hủy'),
  }
}

export default function PaymentCallback() {
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const processed = useRef(false)

  const [initial] = useState(getInitialState)
  const [status, setStatus] = useState(initial.status)
  const [message, setMessage] = useState(initial.message)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const verifyPayment = async () => {
      if (!getAccessToken()) return

      try {
        const res = await paymentService.getAllMine()
        const payments = res.data.data || []
        const lastPayment = payments[0]

        if (!lastPayment) return

        if (lastPayment.status === 'SUCCESS' || lastPayment.status === 'COMPLETED') {
          setStatus('success')
          setMessage('Thanh toán đã được xác nhận!')
          return
        }

        if (lastPayment.status === 'FAILED') {
          setStatus('fail')
          setMessage('Thanh toán thất bại')
          return
        }

        if (lastPayment.status === 'PENDING') {
          setPolling(true)
          const poll = setInterval(async () => {
            try {
              const pollRes = await paymentService.getAllMine()
              const pollPayments = pollRes.data.data || []
              const latest = pollPayments[0]

              if (latest.status === 'SUCCESS' || latest.status === 'COMPLETED') {
                setStatus('success')
                setMessage('Thanh toán đã được xác nhận!')
                setPolling(false)
                clearInterval(poll)
              } else if (latest.status === 'FAILED') {
                setStatus('fail')
                setMessage('Thanh toán thất bại')
                setPolling(false)
                clearInterval(poll)
              }
            } catch {
              clearInterval(poll)
              setPolling(false)
            }
          }, 3000)
        }
      } catch {
        // ignore
      }
    }

    verifyPayment()
  }, [])

  if (status === 'loading') {
    return (
      <div className="vh-center-screen">
        <h2 className="vh-h3" style={{ margin: 0 }}>Đang xử lý thanh toán...</h2>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto' }}>
      <Result
        status={status === 'success' ? 'success' : 'error'}
        icon={status === 'success'
          ? <CheckCircleFilled style={{ color: 'var(--vh-link)', fontSize: 64 }} />
          : <CloseCircleFilled style={{ color: 'var(--vh-error)', fontSize: 64 }} />
        }
        title={status === 'success' ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
        subTitle={
          <Space direction="vertical" size={4}>
            <span className="vh-muted">{message}</span>
            {polling && (
              <span className="vh-text-primary">
                <LoadingOutlined style={{ marginRight: 6 }} />Đang chờ xác nhận thanh toán...
              </span>
            )}
          </Space>
        }
        extra={[
          <Button key="dash" type="primary" size={isMobile ? 'middle' : 'large'} onClick={() => navigate('/dashboard')}>
            Về Dashboard
          </Button>,
          <Button key="orders" size={isMobile ? 'middle' : 'large'} onClick={() => navigate('/dashboard')}>
            Xem đơn hàng
          </Button>,
        ]}
      />
    </div>
  )
}
