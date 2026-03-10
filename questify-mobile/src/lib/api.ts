/**
 * 🌐 API 调用工具
 */

// TODO: 替换为你的后端地址
const API_BASE_URL = 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// 角色 API
export const characterAPI = {
  get: (token?: string) => fetchAPI<any>('/character', { token }),
  
  update: (data: any, token?: string) =>
    fetchAPI<any>('/character', {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),
};

// 任务 API
export const questsAPI = {
  getAll: (params?: { isToday?: boolean; status?: string }, token?: string) => {
    const searchParams = new URLSearchParams();
    if (params?.isToday !== undefined) searchParams.set('isToday', String(params.isToday));
    if (params?.status) searchParams.set('status', params.status);
    
    const query = searchParams.toString();
    return fetchAPI<any[]>(`/quests${query ? `?${query}` : ''}`, { token });
  },
  
  create: (data: any, token?: string) =>
    fetchAPI<any>('/quests', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
  
  update: (id: string, data: any, token?: string) =>
    fetchAPI<any>(`/quests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),
  
  delete: (id: string, token?: string) =>
    fetchAPI<any>(`/quests/${id}`, {
      method: 'DELETE',
      token,
    }),
};
