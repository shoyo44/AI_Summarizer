const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function stringifyDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const parts = detail
      .map(item => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>
          const loc = Array.isArray(record.loc) ? record.loc.join('.') : ''
          const msg = typeof record.msg === 'string' ? record.msg : ''
          return [loc, msg].filter(Boolean).join(': ')
        }
        return ''
      })
      .filter(Boolean)
    if (parts.length > 0) return parts.join('; ')
  }
  if (detail && typeof detail === 'object') {
    try {
      return JSON.stringify(detail)
    } catch {
      return 'Request failed'
    }
  }
  return 'Request failed'
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const errorBody = await response.json()
    return stringifyDetail(errorBody?.detail) || fallback
  } catch {
    return fallback
  }
}

function getNetworkErrorMessage(url: string): string {
  const isLocalApi = url.includes('localhost') || url.includes('127.0.0.1')
  if (isLocalApi && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'Backend API URL is set to localhost. Set VITE_API_URL in Vercel to your deployed backend HTTPS URL and redeploy.'
  }
  if (window.location.protocol === 'https:' && url.startsWith('http://')) {
    return 'Blocked insecure API request (HTTP) from HTTPS site. Use an HTTPS backend URL in VITE_API_URL.'
  }
  return 'Cannot reach backend API. Check VITE_API_URL, backend uptime, and CORS settings.'
}

export interface Usecase {
  id: string
  name: string
  description: string
  output_format: string
  category: string
  extra_params: string[]
}

export interface AnalyzeRequest {
  text: string
  usecase_id: string
  target_language?: string
}

export interface AnalyzeResponse {
  usecase_id: string
  usecase_name: string
  result: string
  user_email?: string
  history_id?: string
}

export interface HistoryItem {
  id: string
  usecase_id: string
  usecase_name: string
  input_preview: string
  input_text: string
  result: string
  created_at: string
  is_public?: boolean
  share_id?: string
}

export interface UserInfo {
  uid: string
  email?: string
  name?: string
  picture?: string
  total_analyses: number
}

export interface WeeklyUsage {
  week: string
  count: number
}

export interface TopUsecase {
  name: string
  count: number
}

export interface CategoryBreakdown {
  category: string
  count: number
}

export interface AnalyticsData {
  weekly_usage: WeeklyUsage[]
  total_words: number
  avg_words_per_analysis: number
  top_usecases: TopUsecase[]
  category_breakdown: CategoryBreakdown[]
  streak_days: number
  total_analyses: number
}

class ApiClient {
  private getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async getUsecases(): Promise<Usecase[]> {
    const requestUrl = `${API_BASE_URL}/usecases`
    let response: Response
    try {
      response = await fetch(requestUrl)
    } catch {
      throw new Error(getNetworkErrorMessage(requestUrl))
    }
    if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to fetch usecases'))
    return response.json()
  }

  async getCurrentUser(token: string): Promise<UserInfo> {
    const requestUrl = `${API_BASE_URL}/me`
    let response: Response
    try {
      response = await fetch(requestUrl, {
        headers: this.getHeaders(token),
      })
    } catch {
      throw new Error(getNetworkErrorMessage(requestUrl))
    }
    if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to fetch user info'))
    return response.json()
  }

  async analyze(request: AnalyzeRequest, token: string): Promise<AnalyzeResponse> {
    const requestUrl = `${API_BASE_URL}/analyze`
    let response: Response
    try {
      response = await fetch(requestUrl, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(request),
      })
    } catch {
      throw new Error(getNetworkErrorMessage(requestUrl))
    }
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, 'Analysis failed'))
    }
    return response.json()
  }

  async getHistory(token: string, limit = 20, skip = 0): Promise<HistoryItem[]> {
    const requestUrl = `${API_BASE_URL}/history?limit=${limit}&skip=${skip}`
    let response: Response
    try {
      response = await fetch(requestUrl, {
        headers: this.getHeaders(token),
      })
    } catch {
      throw new Error(getNetworkErrorMessage(requestUrl))
    }
    if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to fetch history'))
    return response.json()
  }

  async getAnalytics(token: string): Promise<AnalyticsData> {
    const requestUrl = `${API_BASE_URL}/analytics`
    let response: Response
    try {
      response = await fetch(requestUrl, {
        headers: this.getHeaders(token),
      })
    } catch {
      throw new Error(getNetworkErrorMessage(requestUrl))
    }
    if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to fetch analytics'))
    return response.json()
  }

  async deleteHistoryItem(historyId: string, token: string): Promise<void> {
    const requestUrl = `${API_BASE_URL}/history/${historyId}`
    let response: Response
    try {
      response = await fetch(requestUrl, {
        method: 'DELETE',
        headers: this.getHeaders(token),
      })
    } catch {
      throw new Error(getNetworkErrorMessage(requestUrl))
    }
    if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to delete history item'))
  }

  async shareHistoryItem(historyId: string, token: string): Promise<{ share_id: string }> {
    const requestUrl = `${API_BASE_URL}/history/${historyId}/share`
    let response: Response
    try {
      response = await fetch(requestUrl, {
        method: 'POST',
        headers: this.getHeaders(token),
      })
    } catch {
      throw new Error(getNetworkErrorMessage(requestUrl))
    }
    if (!response.ok) throw new Error(await getErrorMessage(response, 'Failed to share item'))
    return response.json()
  }

  async getSharedItem(shareId: string): Promise<HistoryItem> {
    const requestUrl = `${API_BASE_URL}/shared/${shareId}`
    let response: Response
    try {
      response = await fetch(requestUrl)
    } catch {
      throw new Error(getNetworkErrorMessage(requestUrl))
    }
    if (!response.ok) throw new Error(await getErrorMessage(response, 'Shared item not found'))
    return response.json()
  }
}

export const api = new ApiClient()
