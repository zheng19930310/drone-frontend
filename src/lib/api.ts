import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截 - 自动携带token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

// 响应拦截
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// ============ 白名单 ============
export const whitelistAPI = {
  list: (pageNum = 1, pageSize = 10, keyword = '') =>
    api.get('/whitelist/page', { params: { pageNum, pageSize, keyword } }),
  get: (id: number) => api.get(`/whitelist/${id}`),
  create: (data: any) => api.post('/whitelist', data),
  update: (id: number, data: any) => api.put(`/whitelist/${id}`, data),
  delete: (id: number) => api.delete(`/whitelist/${id}`),
  approve: (id: number, remark: string) => api.put(`/whitelist/${id}/approve`, null, { params: { remark } }),
}

// ============ 部门 ============
export const departmentAPI = {
  list: (pageNum = 1, pageSize = 10, keyword = '') =>
    api.get('/department/page', { params: { pageNum, pageSize, keyword } }),
  get: (id: number) => api.get(`/department/${id}`),
  create: (data: any) => api.post('/department', data),
  update: (id: number, data: any) => api.put(`/department/${id}`, data),
  delete: (id: number) => api.delete(`/department/${id}`),
}

// ============ 设备 ============
export const equipmentAPI = {
  list: (pageNum = 1, pageSize = 10, deptId?: number, keyword = '') =>
    api.get('/equipment/page', { params: { pageNum, pageSize, deptId, keyword } }),
  get: (id: number) => api.get(`/equipment/${id}`),
  create: (data: any) => api.post('/equipment', data),
  update: (id: number, data: any) => api.put(`/equipment/${id}`, data),
  delete: (id: number) => api.delete(`/equipment/${id}`),
}

// ============ 人员 ============
export const staffAPI = {
  list: (pageNum = 1, pageSize = 10, deptId?: number, keyword = '') =>
    api.get('/staff/page', { params: { pageNum, pageSize, deptId, keyword } }),
  get: (id: number) => api.get(`/staff/${id}`),
  create: (data: any) => api.post('/staff', data),
  update: (id: number, data: any) => api.put(`/staff/${id}`, data),
  delete: (id: number) => api.delete(`/staff/${id}`),
}

// ============ 任务 ============
export const taskAPI = {
  list: (pageNum = 1, pageSize = 10, keyword = '', status = '') =>
    api.get('/task/page', { params: { pageNum, pageSize, keyword, status } }),
  get: (id: number) => api.get(`/task/${id}`),
  create: (data: any) => api.post('/task', data),
  update: (id: number, data: any) => api.put(`/task/${id}`, data),
  delete: (id: number) => api.delete(`/task/${id}`),
}

// ============ 调度点位 ============
export const taskScheduleAPI = {
  list: (pageNum = 1, pageSize = 10, taskId?: number) =>
    api.get('/task-schedule/page', { params: { pageNum, pageSize, taskId } }),
  listByTaskId: (taskId: number) => api.get(`/task-schedule/task/${taskId}`),
  get: (id: number) => api.get(`/task-schedule/${id}`),
  create: (data: any) => api.post('/task-schedule', data),
  update: (id: number, data: any) => api.put(`/task-schedule/${id}`, data),
  delete: (id: number) => api.delete(`/task-schedule/${id}`),
}

// ============ 资源分配 ============
export const scheduleResourceAPI = {
  list: (scheduleId: number) => api.get(`/schedule-resource/schedule/${scheduleId}`),
  assign: (data: any) => api.post('/schedule-resource', data),
  update: (id: number, data: any) => api.put(`/schedule-resource/${id}`, data),
  delete: (id: number) => api.delete(`/schedule-resource/${id}`),
}

// ============ 预警 ============
export const alarmAPI = {
  list: (pageNum = 1, pageSize = 10, alarmType = '', status = '') =>
    api.get('/alarm/page', { params: { pageNum, pageSize, alarmType, status } }),
  get: (id: number) => api.get(`/alarm/${id}`),
  create: (data: any) => api.post('/alarm', data),
  handle: (id: number, remark: string) => api.put(`/alarm/${id}/handle`, null, { params: { remark } }),
  delete: (id: number) => api.delete(`/alarm/${id}`),
}

// ============ 认证 ============
export const authAPI = {
  login: async (username: string, password: string) => {
    // 临时方案：如果没有后端，使用模拟登录
    try {
      return await api.post('/auth/login', { username, password })
    } catch (error) {
      console.warn('后端未连接，使用模拟登录')
      // 模拟成功响应
      return {
        code: 200,
        message: 'success',
        data: {
          token: 'mock-token-' + Date.now(),
          username: username || 'admin',
          role: 'admin'
        }
      }
    }
  },
  logout: () => api.post('/auth/logout'),
  info: () => api.get('/auth/info'),
}

// ============ 违规记录 ============
export const violationAPI = {
  list: (pageNum = 1, pageSize = 10, equipmentId?: number) =>
    api.get('/violation/page', { params: { pageNum, pageSize, equipmentId } }),
  get: (id: number) => api.get(`/violation/${id}`),
  create: (data: any) => api.post('/violation', data),
  delete: (id: number) => api.delete(`/violation/${id}`),
}

export default api
