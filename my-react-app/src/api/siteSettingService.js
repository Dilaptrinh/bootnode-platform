import axiosClient from './axiosClient'

const siteSettingService = {
  getPublic() {
    return axiosClient.get('/api/v1/site-settings', { _skipAuth: true })
  },
  getAllAdmin() {
    return axiosClient.get('/api/v1/admin/site-settings')
  },
  update(key, value) {
    return axiosClient.put(`/api/v1/admin/site-settings/${key}`, { value })
  },
}

export default siteSettingService
