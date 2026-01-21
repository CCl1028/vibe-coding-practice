import { createSlice, nanoid } from '@reduxjs/toolkit'

// 初始状态
const initialState = {
  items: [],
}

// 创建 todos slice
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // 添加任务
    addTodo: {
      reducer(state, action) {
        state.items.unshift(action.payload)
      },
      // 使用 prepare 回调来生成 payload
      prepare(title) {
        return {
          payload: {
            id: nanoid(),
            title,
            completed: false,
            createdAt: new Date().toISOString(),
          },
        }
      },
    },
    
    // 切换任务完成状态
    toggleTodo(state, action) {
      const todo = state.items.find((item) => item.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    
    // 删除任务
    deleteTodo(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    
    // 编辑任务标题
    editTodo(state, action) {
      const { id, title } = action.payload
      const todo = state.items.find((item) => item.id === id)
      if (todo) {
        todo.title = title
      }
    },
    
    // 清除所有已完成任务
    clearCompleted(state) {
      state.items = state.items.filter((item) => !item.completed)
    },
  },
})

// 导出 actions
export const { addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted } = todosSlice.actions

// 导出 selectors
export const selectTodos = (state) => state.todos.items
export const selectTodosCount = (state) => state.todos.items.length
export const selectCompletedCount = (state) => 
  state.todos.items.filter((item) => item.completed).length
export const selectActiveCount = (state) => 
  state.todos.items.filter((item) => !item.completed).length

// 导出 reducer
export default todosSlice.reducer
