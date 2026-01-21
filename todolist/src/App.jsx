import Header from './components/Header'
import AddTodo from './features/todos/components/AddTodo'
import TodoList from './features/todos/components/TodoList'

/**
 * 根组件
 * TodoList 迭代一 MVP 版本
 */
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <Header />

      {/* 主内容区 */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* 添加任务 */}
        <div className="mb-8">
          <AddTodo />
        </div>

        {/* 任务列表 */}
        <TodoList />
      </main>

      {/* 页脚 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <p className="text-center text-sm text-gray-400">
          双击任务可编辑 · 数据自动保存到本地
        </p>
      </footer>
    </div>
  )
}

export default App
