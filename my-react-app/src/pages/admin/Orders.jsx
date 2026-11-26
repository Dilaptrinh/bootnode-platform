import { useEffect, useState } from 'react'
import { Table, Typography, Grid, Spin, message } from 'antd'
import adminService from '../../api/adminService'
import { PageHeader, StatusTag } from '../../components/ui'

const { Text } = Typography
const { useBreakpoint } = Grid

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await adminService.getAllOrders({ page, size: 10, sort: ['id,desc'] })
        setOrders(res.data.data.content || [])
        setTotal(res.data.data?.page?.totalElements ?? res.data.data?.totalElements ?? 0)
      } catch { message.error('Không thể tải đơn hàng')
      } finally { setLoading(false) }
    }
    fetchOrders()
  }, [page])

  const columns = [
    { title: 'Mã ĐH', dataIndex: 'id', key: 'id', width: 80, render: (id) => <Text copyable className="vh-mono">#{id}</Text> },
    { title: 'Người dùng', dataIndex: 'userId', key: 'userId', render: (uid) => <span className="vh-mono">#{uid}</span> },
    { title: 'Gói', dataIndex: 'serverName', key: 'serverName' },
    { title: 'Bắt đầu', dataIndex: 'startDate', key: 'startDate', responsive: ['md'] },
    { title: 'Kết thúc', dataIndex: 'endDate', key: 'endDate', responsive: ['md'] },
    { title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'totalPrice', render: (p) => <span className="vh-mono vh-text-primary" style={{ fontWeight: 600 }}>{formatPrice(p)}₫</span> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => <StatusTag status={s} type="order" /> },
  ]

  if (loading && orders.length === 0) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <PageHeader
        eyebrow="Quản trị"
        title="Quản lý đơn hàng"
        subtitle="Theo dõi toàn bộ đơn hàng trong hệ thống."
      />
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        scroll={{ x: isMobile ? 700 : undefined }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />
    </div>
  )
}
