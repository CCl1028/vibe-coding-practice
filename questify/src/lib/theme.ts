/**
 * 主题管理系统
 * 提供深色/浅色主题切换功能
 */

export type Theme = 'dark' | 'light'

const THEME_STORAGE_KEY = 'questify_theme'

/**
 * 获取存储的主题
 */
export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark'
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return (stored as Theme) || 'dark'
}

/**
 * 保存主题到存储
 */
export const setStoredTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

/**
 * 更新 DOM 的主题类
 */
export const updateDocumentTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * 初始化主题
 */
export const initializeTheme = () => {
  const theme = getStoredTheme()
  updateDocumentTheme(theme)
  return theme
}
