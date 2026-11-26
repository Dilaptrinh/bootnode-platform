import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, Grid, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import faqService from '../../api/faqService'
import { PageHeader } from '../../components/ui'

const { useBreakpoint } = Grid
const { TextArea } = Input

const CATEGORY_OPTIONS = [
  { value: 'HOSTING', label: 'Hosting' },
  { value: 'DEPLOY', label: 'Triển khai' },
  { value: 'GENERAL', label: 'Chung' },
]

export default function AdminFaqs() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const load = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const res = await faqService.getAllAdmin({ page: p, size: 10, sort: 'displayOrder,asc' })
      setList(res.data.data.content || [])
      setTotal(res.data.data?.page?.totalElements ?? res.data.data?.totalElements ?? 0)
    } catch {
      message.error('Không thể tải FAQ')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ category: 'GENERAL', displayOrder: 0, active: true })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      category: record.category,
      question: record.question,
      answer: record.answer,
      displayOrder: record.displayOrder,
      active: record.active,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        await faqService.update(editing.id, values)
        message.success('Đã cập nhật FAQ')
      } else {
        await faqService.create(values)
        message.success('Đã tạo FAQ')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xóa FAQ',
      content: `Xóa "${record.question}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await faqService.delete(record.id)
          message.success('Đã xóa FAQ')
          load()
        } catch (err) {
          message.error(err.response?.data?.message || 'Xóa thất bại')
        }
      },
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: 'Danh mục', dataIndex: 'category', width: 110,
      render: (v) => <span className="vh-chip">{v}</span>,
    },
    { title: 'Câu hỏi', dataIndex: 'question', ellipsis: true },
    { title: 'Thứ tự', dataIndex: 'displayOrder', width: 80 },
    {
      title: 'Hiển thị', dataIndex: 'active', width: 90,
      render: (v) => (v ? <span className="vh-tag vh-tag--success"><span className="vh-tag__dot" />Bật</span> : <span className="vh-tag vh-tag--mute"><span className="vh-tag__dot" />Tắt</span>),
    },
    {
      title: '', key: 'actions', width: 110,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Quản trị"
        title="Quản lý FAQ"
        subtitle="Câu hỏi thường gặp hiển thị trên trang chủ và trang dịch vụ."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo FAQ</Button>}
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        scroll={{ x: isMobile ? 720 : undefined }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{ current: page + 1, total, pageSize: 10, onChange: (p) => setPage(p - 1) }}
      />

      <Modal
        title={editing ? 'Sửa FAQ' : 'Tạo FAQ'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={saving}
        okText={editing ? 'Lưu' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
            <Select options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="question" label="Câu hỏi" rules={[{ required: true, message: 'Vui lòng nhập câu hỏi' }]}>
            <Input maxLength={500} placeholder="Câu hỏi" />
          </Form.Item>
          <Form.Item name="answer" label="Câu trả lời" rules={[{ required: true, message: 'Vui lòng nhập câu trả lời' }]}>
            <TextArea rows={5} placeholder="Câu trả lời..." />
          </Form.Item>
          <Space size={16} wrap>
            <Form.Item name="displayOrder" label="Thứ tự" style={{ marginBottom: 0 }}>
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item name="active" label="Hiển thị" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Switch />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}
