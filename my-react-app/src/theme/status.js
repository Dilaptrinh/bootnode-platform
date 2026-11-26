export const ORDER_STATUS = {
  PENDING: { tone: 'warning', label: 'Chờ thanh toán' },
  ACTIVE: { tone: 'success', label: 'Hoạt động' },
  CANCELLED: { tone: 'error', label: 'Đã hủy' },
  EXPIRED: { tone: 'mute', label: 'Hết hạn' },
}

export const PAYMENT_STATUS = {
  PENDING: { tone: 'warning', label: 'Chờ xử lý' },
  COMPLETED: { tone: 'success', label: 'Hoàn tất' },
  SUCCESS: { tone: 'success', label: 'Thành công' },
  FAILED: { tone: 'error', label: 'Thất bại' },
  REFUNDED: { tone: 'info', label: 'Hoàn tiền' },
}

export const USER_STATUS = {
  ACTIVE: { tone: 'success', label: 'Hoạt động' },
  BANNED: { tone: 'error', label: 'Bị khóa' },
}

export const ROLE_STATUS = {
  SUPER_ADMIN: { tone: 'warning', label: 'Super Admin' },
  ADMIN: { tone: 'info', label: 'Admin' },
  USER: { tone: 'mute', label: 'Người dùng' },
}

export const SITE_STATUS = {
  ACTIVE: { tone: 'success', label: 'Hoạt động' },
  PENDING: { tone: 'warning', label: 'Đang deploy' },
  FAILED: { tone: 'error', label: 'Thất bại' },
}

export const STATUS_MAPS = {
  order: ORDER_STATUS,
  payment: PAYMENT_STATUS,
  user: USER_STATUS,
  role: ROLE_STATUS,
  site: SITE_STATUS,
}

export function resolveStatus(type, status) {
  const map = STATUS_MAPS[type] || ORDER_STATUS
  return map[status] || { tone: 'mute', label: status || '--' }
}
