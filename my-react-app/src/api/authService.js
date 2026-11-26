import axiosClient from './axiosClient'

const authService = {
  refresh(data) {
    return axiosClient.post('/api/v1/auth/refresh', data)
  },

  logout() {
    return axiosClient.post('/api/v1/auth/logout')
  },
}

export default authService
