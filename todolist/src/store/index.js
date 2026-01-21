import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'

// 从 localStorage 加载初始状态
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('todosState')
    if (serializedState === null) {
      return undefined
    }
    return { todos: JSON.parse(serializedState) }
  } catch (err) {
    console.error('加载状态失败:', err)
    return undefined
  }
}

// 保存状态到 localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state.todos)
    localStorage.setItem('todosState', serializedState)
  } catch (err) {
    console.error('保存状态失败:', err)
  }
}

// 创建 store
export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
  preloadedState: loadState(),
})

// 订阅 store 变化，自动保存到 localStorage
store.subscribe(() => {
  saveState(store.getState())
})

export default store
