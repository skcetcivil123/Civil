/**
 * Axios API client — base configuration & endpoint bindings.
 */
import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('tqm_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tqm_access_token')
      window.dispatchEvent(new CustomEvent('tqm:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default API

// ── In-Memory Client Cache (Instant 0ms Page Switching) ────────────────────
const memoryCache = new Map()

export function clearClientCache() {
  memoryCache.clear()
}

function cachedGet(url, params = null, ttlMs = 60000) {
  const cacheKey = url + (params ? JSON.stringify(params) : '')
  const hit = memoryCache.get(cacheKey)
  const now = Date.now()
  if (hit && (now - hit.time < ttlMs)) {
    return Promise.resolve(hit.response)
  }
  return API.get(url, params ? { params } : {}).then(res => {
    memoryCache.set(cacheKey, { time: Date.now(), response: res })
    return res
  })
}

// ── API Helpers ───────────────────────────────────────────────────────────

export const healthApi = {
  get: () => cachedGet('/api/health', null, 15000),
}

export const factorsApi = {
  getAll: (category) => cachedGet('/api/factors', category ? { category } : null),
  getByCode: (code) => cachedGet(`/api/factors/${code}`),
  create: (data) => { clearClientCache(); return API.post('/api/factors', data) },
  update: (code, data) => { clearClientCache(); return API.put(`/api/factors/${code}`, data) },
}

export const fdmApi = {
  getExperts: () => cachedGet('/api/fdm/experts'),
  createExpert: (data) => { clearClientCache(); return API.post('/api/fdm/experts', data) },
  getScale: () => cachedGet('/api/fdm/scale'),
  calculate: (config) => API.post('/api/fdm/calculate', config || {}),
}

export const surveyApi = {
  getQuestionnaire: () => cachedGet('/api/survey/questionnaire'),
  getResponses: () => cachedGet('/api/survey/responses'),
  submit: (data) => { clearClientCache(); return API.post('/api/survey/submit', data) },
  getSummary: () => cachedGet('/api/survey/stats/summary'),
}

export const statisticsApi = {
  getDescriptive: () => cachedGet('/api/statistics/descriptive'),
  getRII: () => cachedGet('/api/statistics/rii'),
  getReliability: () => cachedGet('/api/statistics/reliability'),
  getKMO: () => cachedGet('/api/statistics/kmo'),
  getEFA: (nFactors = 4, rotation = 'varimax') => cachedGet('/api/statistics/efa', { n_factors: nFactors, rotation }),
  getANOVA: (groupBy = 'experience') => cachedGet('/api/statistics/anova', { group_by: groupBy }),
  getFramework: () => cachedGet('/api/statistics/framework'),
}

export const mlApi = {
  getClusters: (nClusters = 3) => cachedGet('/api/ml/clusters', { n_clusters: nClusters }),
  getModels: () => cachedGet('/api/ml/models'),
  predict: (data) => API.post('/api/ml/predict', data),
}

export const xaiApi = {
  getShap: () => cachedGet('/api/xai/shap'),
  simulate: (data) => API.post('/api/xai/simulate', data),
}

export const recommendationsApi = {
  getAll: () => cachedGet('/api/recommendations'),
}

export const chatbotApi = {
  query: (message, screen = null, sessionId = 'default', mode = 'research') => API.post('/api/chatbot/query', { message, screen, session_id: sessionId, mode }),
  getVivaQuestions: () => cachedGet('/api/chatbot/viva/questions'),
  evaluateViva: (questionId, userAnswer) => API.post('/api/chatbot/viva/evaluate', { question_id: questionId, user_answer: userAnswer }),
}


export const reportsApi = {
  getSummary: () => cachedGet('/api/reports/summary'),
  getExportCsvUrl: () => '/api/reports/export/csv',
}

export const authApi = {
  login: (credentials) => API.post('/api/auth/login', credentials),
  register: (userData) => API.post('/api/auth/register', userData),
  me: () => API.get('/api/auth/me'),
  getCredentials: () => cachedGet('/api/auth/credentials'),
}

