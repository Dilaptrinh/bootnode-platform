import { useEffect, useState } from 'react'
import { Table, Grid, Spin, message, Button, Space, Modal, Form, Input } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import adminService from '../../api/adminService'
import categoryService from '../../api/categoryService'
import { PageHeader } from '../../components/ui'

const { useBreakpoint } = Grid

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await categoryService.getAll()
        setCategories(res.data.data || [])
      } catch {
        message.error('Không thể tải danh mục')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const refresh = async () => {
    const res = await categoryService.getAll()
    setCategories(res.data.data || [])
  }

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (cat) => { setEditing(cat); form.setFieldsValue(cat); setModalOpen(true) }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (editing) {
        await adminService.updateCategory(editing.id, values)
        message.success('Đã cập nhật danh mục')
      } else {
        await adminService.createCategory(values)
        message.success('Đã tạo danh mục mới')
      }
      setModalOpen(false)
      await refresh()
    } catch (err) {
      if (err.errorFields) return
      message.error(err.response?.data?.message || 'Lưu thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa danh mục',
      content: 'Bạn có chắc chắn muốn xóa?',
      okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminService.deleteCategory(id)
          message.success('Đã xóa')
          await refresh()
        } catch (err) {
          message.error(err.response?.data?.message || 'Xóa thất bại')
        }
      },
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', render: (v) => v || '--' },
    {
      title: '', key: 'actions', render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button size="small" icon={<DeleteOutlined />} danger onClick={() => handleDelete(r.id)} />
        </Space>
      ),
    },
  ]

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>

  return (
    <div>
      <PageHeader
        eyebrow="Quản trị"
        title="Quản lý danh mục"
        subtitle="Nhóm các gói hosting theo danh mục."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm danh mục</Button>}
      />

      <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} size={isMobile ? 'small' : 'middle'} pagination={false} />

      <Modal
        title={editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="VD: VPS, Dedicated..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả danh mục" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
