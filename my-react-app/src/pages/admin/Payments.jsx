import { useCallback, useEffect, useState } from 'react'
import { Table, Typography, Grid, Spin, message, Button, Space, Popconfirm } from 'antd'
import adminService from '../../api/adminService'
import { PageHeader, StatusTag } from '../../components/ui'

const { Text } = Typography
const { useBreakpoint } = Grid

const methodLabels = { BANKING: 'Chuyển khoản', MOMO: 'MoMo', VNPAY: 'VNPay', CASH: 'Tiền mặt', PAYOS: 'PayOS' }

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [actingId, setActingId] = useState(null)
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminService.getAllPayments({ page, size: 10, sort: ['id,desc'] })
      setPayments(res.data.data.content || [])
      setTotal(res.data.data?.page?.totalElements ?? res.data.data?.totalElements ?? 0)
    } catch { message.error('Không thể tải thanh toán')
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments()
  }, [fetchPayments])

  const handleConfirm = async (id) => {
    setActingId(id)
    try {
      await adminService.confirmPayment(id)
      message.success('Đã xác nhận thanh toán và cấp host')
      fetchPayments()
    } catch (e) {
      message.error(e.response?.data?.message || 'Xác nhận thất bại')
    } finally { setActingId(null) }
  }

  const handleReject = async (id) => {
    setActingId(id)
    try {
      await adminService.rejectPayment(id)
      message.success('Đã từ chối thanh toán')
      fetchPayments()
    } catch (e) {
      message.error(e.response?.data?.message || 'Từ chối thất bại')
    } finally { setActingId(null) }
  }

  const columns = [
    { title: 'Mã GD', dataIndex: 'id', key: 'id', width: 80, render: (id) => <Text copyable className="vh-mono">#{id}</Text> },
    { title: 'Mã ĐH', dataIndex: 'orderId', key: 'orderId', render: (oid) => <span className="vh-mono">#{oid}</span> },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (a) => <span className="vh-mono vh-text-primary" style={{ fontWeight: 600 }}>{formatPrice(a)}₫</span> },
    { title: 'Phương thức', dataIndex: 'method', key: 'method', render: (m) => methodLabels[m] || m, responsive: ['md'] },
    { title: 'Mã GD', dataIndex: 'transactionId', key: 'transactionId', render: (v) => v || '--', responsive: ['lg'] },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <StatusTag status={s} type="payment" /> },
    { title: 'Ngày', dataIndex: 'paidAt', key: 'paidAt', render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '--', responsive: ['md'] },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => record.status === 'PENDING' ? (
        <Space>
          <Popconfirm
            title="Xác nhận đã nhận tiền và cấp host?"
            onConfirm={() => handleConfirm(record.id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button type="primary" size="small" loading={actingId === record.id}>Xác nhận</Button>
          </Popconfirm>
          <Popconfirm
            title="Từ chối giao dịch này?"
            onConfirm={() => handleReject(record.id)}
            okText="Từ chối"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" loading={actingId === record.id}>Từ chối</Button>
          </Popconfirm>
        </Space>
      ) : '--',
    },
  ]

  if (loading && payments.length === 0) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <PageHeader
        eyebrow="Quản trị"
        title="Quản lý thanh toán"
        subtitle="Xác nhận hoặc từ chối các giao dịch đang chờ xử lý."
      />
      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loading}
        scroll={{ x: isMobile ? 700 : undefined }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />
    </div>
  )
}
