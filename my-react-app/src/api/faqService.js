import axiosClient from './axiosClient'

const faqService = {
  getByCategory(category) {
    return axiosClient.get('/api/v1/faqs', {
      params: category ? { category } : {},
      _skipAuth: true,
    })
  },
  getAllAdmin(pageable) {
    return axiosClient.get('/api/v1/admin/faqs', { params: pageable })
  },
  create(data) {
    return axiosClient.post('/api/v1/admin/faqs', data)
  },
  update(id, data) {
    return axiosClient.put(`/api/v1/admin/faqs/${id}`, data)
  },
  delete(id) {
    return axiosClient.delete(`/api/v1/admin/faqs/${id}`)
  },
}

export default faqService
